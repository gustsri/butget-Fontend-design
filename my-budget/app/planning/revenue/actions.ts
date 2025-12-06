"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

// --- Helper: คำนวณรายรับค่าเทอมตามสูตร ---
async function calculateTuitionRevenue(budgetYear: number) {
  const prevYear = budgetYear - 1;
  const programs = await prisma.academicProgram.findMany({
    where: { is_active: true },
    include: {
      student_fees: { where: { is_active: true }, orderBy: { created_at: "desc" }, take: 1 },
      EnrollmentInformation: { where: { academic_year: { in: [prevYear, budgetYear] } } },
    },
  });

  let amountTerm1Prev = 0; let amountTerm2Prev = 0; let amountTerm1Curr = 0;

  for (const prog of programs) {
    const fee = Number(prog.student_fees[0]?.tuition_per_semester || 0);
    const getStudentCount = (year: number, semester: number) => {
      const actualData = prog.EnrollmentInformation.find(e => e.academic_year === year && e.semester === semester && e.plan_type === 'actual');
      if ((actualData?.year1_count || 0) > 0) return getTotalStudents(actualData);
      const planData = prog.EnrollmentInformation.find(e => e.academic_year === year && e.semester === semester && e.plan_type === 'plan');
      return getTotalStudents(planData);
    };
    amountTerm1Prev += (getStudentCount(prevYear, 1) * fee * 2) / 5;
    amountTerm2Prev += (getStudentCount(prevYear, 2) * fee);
    amountTerm1Curr += (getStudentCount(budgetYear, 1) * fee * 3) / 5;
  }
  return { amountTerm1Prev, amountTerm2Prev, amountTerm1Curr };
}

function getTotalStudents(enroll: any) {
  if (!enroll) return 0;
  return (enroll.year1_count || 0) + (enroll.year2_count || 0) + (enroll.year3_count || 0) + (enroll.year4_count || 0) + (enroll.year5_count || 0) + (enroll.year6_count || 0);
}

// --- 🔥 Helper: คำนวณยอดเงินตามสูตร Excel (Updated) ---
async function recalculateBudgetTotal(budgetId: number) {
  const allItems = await prisma.revenueItem.findMany({
    where: { section: { revenue_budget_id: budgetId } },
    include: { section: true }
  });

  // 1. คำนวณส่วนค่าเทอม (Section 1)
  const tuitionItems = allItems.filter(i => i.section.sort_order === 1);
  
  // หา 3 เทอมหลัก
  const termItems = tuitionItems.filter(i => i.item_name.includes("ภาคเรียนที่"));
  const tuitionSum = termItems.reduce((sum, item) => sum + item.amount.toNumber(), 0);

  // คำนวณ 35%
  const deduction35 = tuitionSum * 0.35;
  const deductionItem = tuitionItems.find(i => i.item_name.includes("35%"));
  if (deductionItem) {
    await prisma.revenueItem.update({ where: { item_id: deductionItem.item_id }, data: { amount: deduction35 } });
  }

  // คำนวณ "คงเหลือ" (Net Tuition) -> Tuition Sum - 35%
  const netTuition = tuitionSum - deduction35;
  const remainItem = tuitionItems.find(i => i.item_name.includes("คงเหลือ"));
  if (remainItem) {
    await prisma.revenueItem.update({ where: { item_id: remainItem.item_id }, data: { amount: netTuition } });
  }

  // 2. คำนวณ "รวมรายรับ" (Total Revenue)
  // สูตร: คงเหลือค่าเทอม + รายได้อื่นๆ (Section 1 ที่เหลือ + Section 2,3,4)
  const otherIncomeItems = allItems.filter(i => {
    // ไม่เอา Section ค่าใช้จ่ายท้ายตาราง (เช่น หักค่าสอนบริการ, ค่าจ้างพนักงาน)
    const isExpenseSection = i.section.section_name.includes("หัก") || i.section.section_name.includes("ค่าจ้างพนักงาน") || i.section.section_name.includes("ค่าตอบแทน");
    if (isExpenseSection) return false;

    // ใน Section 1 ไม่เอา 3 เทอม, ไม่เอา 35%, ไม่เอาคงเหลือ, ไม่เอา Header
    if (i.section.sort_order === 1) {
        if (i.item_name.includes("ภาคเรียนที่")) return false;
        if (i.item_name.includes("35%")) return false;
        if (i.item_name.includes("คงเหลือ")) return false;
        if (i.item_name.startsWith("1.1")) return false; // Header
    }
    
    // เอาเฉพาะที่ไม่ใช่ deduction และไม่ใช่ header
    return !i.is_deduction && !i.item_name.startsWith("1.");
  });

  const totalOtherIncome = otherIncomeItems.reduce((sum, item) => sum + item.amount.toNumber(), 0);
  const grandTotalRevenue = netTuition + totalOtherIncome;

  // 3. คำนวณ "รายการหักจ่าย" (Expenses ท้ายตาราง)
  // คือรายการที่เป็น Deduction ใน Section อื่นๆ (เช่น หักค่าสอนบริการ)
  const expenseItems = allItems.filter(i => {
     // เอา Deduction ที่ไม่ได้อยู่ใน Section 1 (เพราะ 35% หักไปแล้วใน NetTuition)
     return i.is_deduction && i.section.sort_order !== 1;
  });
  const totalExpenses = expenseItems.reduce((sum, item) => sum + item.amount.toNumber(), 0);

  // 4. สุทธิท้ายสุด
  const finalNet = grandTotalRevenue - totalExpenses;

  // อัปเดต Header
  await prisma.revenueBudget.update({
    where: { revenue_budget_id: budgetId },
    data: { 
      total_amount: grandTotalRevenue, // เก็บ "รวมรายรับ"
      net_amount: finalNet             // เก็บ "รวมรายรับสุทธิ"
    },
  });
}

// --- CRUD Actions ---
export async function getRevenueData(budgetId: number) {
  const budget = await prisma.revenueBudget.findUnique({
    where: { revenue_budget_id: budgetId },
    include: {
      sections: {
        orderBy: { sort_order: "asc" },
        include: {
          items: { orderBy: { sort_order: "asc" } },
        },
      },
    },
  });
  if (!budget) return null;
  return {
    ...budget,
    total_amount: budget.total_amount.toNumber(),
    net_amount: budget.net_amount.toNumber(),
    sections: budget.sections.map((section) => ({
      ...section,
      items: section.items.map((item) => ({
        ...item,
        amount: item.amount.toNumber(),
      })),
    })),
  };
}

export async function addRevenueSection(budgetId: number, name: string) {
  const lastSection = await prisma.revenueSection.findFirst({
    where: { revenue_budget_id: budgetId },
    orderBy: { sort_order: 'desc' }
  });
  await prisma.revenueSection.create({
    data: {
      revenue_budget_id: budgetId,
      section_name: name,
      sort_order: (lastSection?.sort_order || 0) + 1
    }
  });
  revalidatePath("/planning/revenue");
  return { success: true };
}

export async function addRevenueItem(sectionId: number, name: string, isDeduction: boolean = false) {
  const lastItem = await prisma.revenueItem.findFirst({
    where: { section_id: sectionId },
    orderBy: { sort_order: 'desc' }
  });
  await prisma.revenueItem.create({
    data: {
      section_id: sectionId,
      item_name: name,
      amount: 0,
      is_deduction: isDeduction,
      sort_order: (lastItem?.sort_order || 0) + 1
    }
  });
  revalidatePath("/planning/revenue");
  return { success: true };
}

export async function deleteRevenueItem(itemId: number, budgetId: number) {
  await prisma.revenueItem.delete({ where: { item_id: itemId } });
  await recalculateBudgetTotal(budgetId);
  revalidatePath("/planning/revenue");
  return { success: true };
}

export async function bulkUpdateRevenueItems(items: { itemId: number; amount: number }[], budgetId: number) {
  try {
    await prisma.$transaction(items.map((item) => prisma.revenueItem.update({ where: { item_id: item.itemId }, data: { amount: item.amount } })));
    await recalculateBudgetTotal(budgetId);
    revalidatePath("/planning/revenue");
    return { success: true };
  } catch (error) { return { success: false }; }
}

// --- Create Plan (Template ตรงตาม Excel) ---
export async function createRevenuePlan(year: number) {
  try {
    const existing = await prisma.revenueBudget.findUnique({ where: { budget_year: year } });
    if (existing) return { success: false, message: "ปีงบประมาณนี้มีอยู่แล้ว" };

    const { amountTerm1Prev, amountTerm2Prev, amountTerm1Curr } = await calculateTuitionRevenue(year);
    const prevYear = year - 1;       
    const shortYear = year % 100;    
    const shortPrev = prevYear % 100;

    const budget = await prisma.revenueBudget.create({
      data: { budget_year: year, status: "draft", total_amount: 0, net_amount: 0, is_active: true }
    });

    const sectionsData = [
      {
        name: "1. เงินค่าบำรุงการศึกษา และค่าธรรมเนียมต่าง ๆ และเงินอุดหนุนสมทบ",
        items: [
          { name: "1.1 ค่าบำรุงการศึกษาฯ (รวมเหมาจ่ายระดับบัณฑิตศึกษา)", amount: 0 }, // Header
          { name: `ภาคเรียนที่ 1/${prevYear} (ต.ค.-พ.ย.${shortPrev}) - จำนวน 2 เดือน`, amount: amountTerm1Prev },
          { name: `ภาคเรียนที่ 2/${prevYear} (ธ.ค.${shortPrev}-เม.ย.${shortYear}) - เต็มภาคการศึกษา`, amount: amountTerm2Prev },
          { name: `ภาคเรียนที่ 1/${year} (ก.ค.-ก.ย.${shortYear}) - จำนวน 3 เดือน`, amount: amountTerm1Curr },
          { name: "รายรับก่อนหักโอนให้หน่วยงานกลาง", amount: 0, type: 'head' }, // Label
          { name: "หักให้งบกลาง 35%", amount: 0, is_deduction: true }, 
          { name: "คงเหลือ", amount: 0 }, // Calculated
          { name: "1.2 ค่าธรรมเนียมการรับนักศึกษา", amount: 0 },
          { name: "1.3 ค่าใบรับรองการศึกษา / ค่าธรรมเนียมอื่นๆ", amount: 0 },
        ]
      },
      {
        name: "2. เงินรายได้จากงานบริการ",
        items: [{ name: "รายรับค่าลงทะเบียนจากประชุมวิชาการ", amount: 0 }]
      },
      {
        name: "3. เงินผลประโยชน์ (เช่น ค่าบำรุงโรงอาหาร)",
        items: [{ name: "รายได้จากการบริการโรงอาหาร", amount: 0 }]
      },
      {
        name: "4. เงินรายได้จากการรับบริจาค หรือ เงินอุดหนุน",
        items: [{ name: "รายได้จากการรับเงินสนับสนุนเพื่อการศึกษา", amount: 0 }]
      },
      {
        name: "หักค่าสอนบริการ",
        items: [
          { name: "1. โอนเงินให้สำนักศึกษาทั่วไป", amount: 0, is_deduction: true },
          { name: "2. โอนเงินให้คณะวิทยาศาสตร์ เพื่อเป็นค่าสอนบริการ", amount: 0, is_deduction: true }
        ]
      },
      {
        name: "ค่าจ้างพนักงานสถาบันที่เปลี่ยนสถานภาพ (พนง.รายได้ -> พนง.งบประมาณ)",
        items: [
          { name: "1. โอนเงินให้ สนง.อธิการบดี (ค่าจ้างพนักงาน 12 อัตรา)", amount: 0, is_deduction: true },
          { name: "2. โอนเงินเข้ากองทุนวิจัยสถาบัน (5 อัตรา 50%)", amount: 0, is_deduction: true }
        ]
      }
    ];

    for (let i = 0; i < sectionsData.length; i++) {
      const sec = sectionsData[i];
      const section = await prisma.revenueSection.create({
        data: { revenue_budget_id: budget.revenue_budget_id, section_name: sec.name, sort_order: i + 1 }
      });

      for (let j = 0; j < sec.items.length; j++) {
        const item = sec.items[j];
        await prisma.revenueItem.create({
          data: {
            section_id: section.section_id,
            item_name: item.name,
            amount: item.amount,
            is_deduction: item.is_deduction || false,
            sort_order: j + 1,
          }
        });
      }
    }

    await recalculateBudgetTotal(budget.revenue_budget_id);
    revalidatePath("/planning/revenue");
    return { success: true, newId: budget.revenue_budget_id };
  } catch (error) {
    console.error(error);
    return { success: false, message: "เกิดข้อผิดพลาดในการสร้างข้อมูล" };
  }
}

export async function recalculateRevenueFromEnrollment(budgetId: number) {
  try {
    const budget = await prisma.revenueBudget.findUnique({ where: { revenue_budget_id: budgetId }, select: { budget_year: true } });
    if (!budget) return { success: false };

    const { amountTerm1Prev, amountTerm2Prev, amountTerm1Curr } = await calculateTuitionRevenue(budget.budget_year);
    const section1 = await prisma.revenueSection.findFirst({ where: { revenue_budget_id: budgetId, sort_order: 1 }, include: { items: { orderBy: { sort_order: 'asc' } } } });

    if (section1) {
      const updates = [];
      section1.items.forEach(item => {
        if(item.item_name.includes("ภาคเรียนที่ 1") && item.item_name.includes("2 เดือน")) updates.push({id: item.item_id, val: amountTerm1Prev});
        else if(item.item_name.includes("ภาคเรียนที่ 2")) updates.push({id: item.item_id, val: amountTerm2Prev});
        else if(item.item_name.includes("ภาคเรียนที่ 1") && item.item_name.includes("3 เดือน")) updates.push({id: item.item_id, val: amountTerm1Curr});
      });
      await prisma.$transaction(updates.map(u => prisma.revenueItem.update({ where: { item_id: u.id }, data: { amount: u.val } })));
      await recalculateBudgetTotal(budgetId);
      revalidatePath("/planning/revenue");
      return { success: true };
    }
    return { success: false, message: "ไม่พบโครงสร้างรายการ" };
  } catch (error) { return { success: false }; }
}

export async function updateBudgetStatus(budgetId: number, status: "draft" | "submitted") {
  try {
    await prisma.revenueBudget.update({ where: { revenue_budget_id: budgetId }, data: { status: status } });
    revalidatePath("/planning/revenue");
    return { success: true };
  } catch (error) { return { success: false }; }
}