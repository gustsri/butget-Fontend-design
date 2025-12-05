"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- Helper: คำนวณรายรับค่าเทอมตามสูตร ---
async function calculateTuitionRevenue(budgetYear: number) {
  const prevYear = budgetYear - 1;

  // ดึงข้อมูลหลักสูตรทั้งหมด พร้อมค่าเทอม และ จำนวนนักศึกษา (จากแผน)
  const programs = await prisma.academicProgram.findMany({
    where: { is_active: true },
    include: {
      student_fees: {
        where: { is_active: true },
        orderBy: { created_at: "desc" },
        take: 1,
      },
      EnrollmentInformation: {
        where: {
          plan_type: "plan", // ใช้ข้อมูลจากแผน (Plan)
          academic_year: { in: [prevYear, budgetYear] },
        },
      },
    },
  });

  let amountTerm1Prev = 0; // ก้อนที่ 1 (2 เดือน)
  let amountTerm2Prev = 0; // ก้อนที่ 2 (เต็ม)
  let amountTerm1Curr = 0; // ก้อนที่ 3 (3 เดือน)

  for (const prog of programs) {
    const fee = Number(prog.student_fees[0]?.tuition_per_semester || 0);
    
    // หาจำนวนนักศึกษา
    const enrollPrev1 = prog.EnrollmentInformation.find(
      (e) => e.academic_year === prevYear && e.semester === 1
    );
    const countPrev1 = getTotalStudents(enrollPrev1);

    const enrollPrev2 = prog.EnrollmentInformation.find(
      (e) => e.academic_year === prevYear && e.semester === 2
    ) || enrollPrev1; // fallback ถ้าไม่มี semester 2
    const countPrev2 = getTotalStudents(enrollPrev2);

    const enrollCurr1 = prog.EnrollmentInformation.find(
      (e) => e.academic_year === budgetYear && e.semester === 1
    );
    const countCurr1 = getTotalStudents(enrollCurr1);

    // คำนวณเข้าสูตร
    amountTerm1Prev += (countPrev1 * fee * 2) / 5;
    amountTerm2Prev += (countPrev2 * fee);
    amountTerm1Curr += (countCurr1 * fee * 3) / 5;
  }

  return { amountTerm1Prev, amountTerm2Prev, amountTerm1Curr };
}

function getTotalStudents(enroll: any) {
  if (!enroll) return 0;
  return (
    (enroll.year1_count || 0) +
    (enroll.year2_count || 0) +
    (enroll.year3_count || 0) +
    (enroll.year4_count || 0) +
    (enroll.year5_count || 0) +
    (enroll.year6_count || 0)
  );
}

// --- Helper: คำนวณและอัปเดตยอดรวม Budget ---
async function recalculateBudgetTotal(budgetId: number) {
  const allItems = await prisma.revenueItem.findMany({
    where: { section: { revenue_budget_id: budgetId } },
  });

  const totalAmount = allItems
    .filter((i) => !i.is_deduction)
    .reduce((sum, item) => sum + item.amount.toNumber(), 0);

  const totalDeduction = allItems
    .filter((i) => i.is_deduction)
    .reduce((sum, item) => sum + item.amount.toNumber(), 0);

  const netAmount = totalAmount - totalDeduction;

  await prisma.revenueBudget.update({
    where: { revenue_budget_id: budgetId },
    data: { total_amount: totalAmount, net_amount: netAmount },
  });
}

// --- 1. ดึงข้อมูล (Fetch) ---
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

  // แปลง Decimal เป็น Number เพื่อส่งไป Client
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

// --- 2. สร้างแผนปีใหม่ (Create) ---
export async function createRevenuePlan(year: number) {
  try {
    const existing = await prisma.revenueBudget.findUnique({ where: { budget_year: year } });
    if (existing) return { success: false, message: "ปีงบประมาณนี้มีอยู่แล้ว" };

    // คำนวณตัวเลขรอไว้เลย
    const { amountTerm1Prev, amountTerm2Prev, amountTerm1Curr } = await calculateTuitionRevenue(year);

    const prevYear = year - 1;       
    const shortYear = year % 100;    
    const shortPrev = prevYear % 100;

    const budget = await prisma.revenueBudget.create({
      data: {
        budget_year: year,
        status: "draft",
        total_amount: 0,
        net_amount: 0,
        is_active: true,
      }
    });

    const sectionsData = [
      {
        name: "1. เงินค่าบำรุงการศึกษา และค่าธรรมเนียมต่าง ๆ และเงินอุดหนุนสมทบ",
        items: [
          { name: "1.1 ค่าบำรุงการศึกษาฯ (รวมเหมาจ่ายระดับบัณฑิตศึกษา)", amount: 0 },
          { name: `ภาคเรียนที่ 1/${prevYear} (ต.ค.-พ.ย.${shortPrev}) - จำนวน 2 เดือน`, amount: amountTerm1Prev },
          { name: `ภาคเรียนที่ 2/${prevYear} (ธ.ค.${shortPrev}-เม.ย.${shortYear}) - เต็มภาคการศึกษา`, amount: amountTerm2Prev },
          { name: `ภาคเรียนที่ 1/${year} (ก.ค.-ก.ย.${shortYear}) - จำนวน 3 เดือน`, amount: amountTerm1Curr },
          
          { name: "หักให้งบกลาง 35%", amount: 0, is_deduction: true }, 
          { name: "1.2 ค่าธรรมเนียมการรับนักศึกษา", amount: 0 },
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
      }
    ];

    for (let i = 0; i < sectionsData.length; i++) {
      const sec = sectionsData[i];
      const section = await prisma.revenueSection.create({
        data: {
          revenue_budget_id: budget.revenue_budget_id,
          section_name: sec.name,
          sort_order: i + 1,
        }
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

// --- 3. บันทึกแบบกลุ่ม (Batch Save) ---
export async function bulkUpdateRevenueItems(
  items: { itemId: number; amount: number }[],
  budgetId: number
) {
  try {
    await prisma.$transaction(
      items.map((item) =>
        prisma.revenueItem.update({
          where: { item_id: item.itemId },
          data: { amount: item.amount },
        })
      )
    );
    await recalculateBudgetTotal(budgetId);
    revalidatePath("/planning/revenue");
    return { success: true };
  } catch (error) {
    console.error("Bulk Update Error:", error);
    return { success: false };
  }
}

// --- 4. คำนวณยอดใหม่ (Recalculate) ---
export async function recalculateRevenueFromEnrollment(budgetId: number) {
  try {
    const budget = await prisma.revenueBudget.findUnique({
      where: { revenue_budget_id: budgetId },
      select: { budget_year: true }
    });
    if (!budget) return { success: false };

    const { amountTerm1Prev, amountTerm2Prev, amountTerm1Curr } = await calculateTuitionRevenue(budget.budget_year);

    // ค้นหา Section แรกเพื่ออัปเดตรายการที่ 2,3,4 (Index 1,2,3)
    const section1 = await prisma.revenueSection.findFirst({
      where: { revenue_budget_id: budgetId, sort_order: 1 },
      include: { items: { orderBy: { sort_order: 'asc' } } }
    });

    if (section1 && section1.items.length >= 4) {
      const updateList = [
        { id: section1.items[1].item_id, amount: amountTerm1Prev },
        { id: section1.items[2].item_id, amount: amountTerm2Prev },
        { id: section1.items[3].item_id, amount: amountTerm1Curr },
      ];

      await prisma.$transaction(
        updateList.map(u => prisma.revenueItem.update({
          where: { item_id: u.id },
          data: { amount: u.amount }
        }))
      );
      
      await recalculateBudgetTotal(budgetId);
      revalidatePath("/planning/revenue");
      return { success: true };
    }
    return { success: false, message: "ไม่พบโครงสร้างรายการ" };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
}

// --- 5. เปลี่ยนสถานะ (Status) ---
export async function updateBudgetStatus(budgetId: number, status: "draft" | "submitted") {
  try {
    await prisma.revenueBudget.update({
      where: { revenue_budget_id: budgetId },
      data: { status: status } 
    });
    revalidatePath("/planning/revenue");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}