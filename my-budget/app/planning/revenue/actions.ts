"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { BudgetStatus } from "@prisma/client"; // อย่าลืม import Enum
// ==========================================
// 1. Helper Functions (ฟังก์ชันช่วยคำนวณ)
// ==========================================

// ช่วยคำนวณยอดเงินรวมและ Net Amount ใหม่ทุกครั้งที่มีการแก้ไข
async function recalculateBudgetTotal(budgetId: number) {
  const allItems = await prisma.revenueItem.findMany({
    where: { section: { revenue_budget_id: budgetId } },
    include: { section: true }
  });

  // 1. หา Section ค่าเทอม (ที่ Sort Order = 1 หรือชื่อขึ้นต้นด้วย 1.)
  // เพื่อคำนวณ 35% และ ยอดคงเหลือ
  const tuitionItems = allItems.filter(i => i.section.sort_order === 1);
  const termItems = tuitionItems.filter(i => i.item_name.includes("ภาคเรียนที่"));

  // รวมยอด 3 เทอม
  const tuitionSum = termItems.reduce((sum, item) => sum + Number(item.amount), 0);

  // คำนวณหัก 35%
  const deduction35 = tuitionSum * 0.35;
  const deductionItem = tuitionItems.find(i => i.item_name.includes("35%"));
  if (deductionItem) {
    await prisma.revenueItem.update({
      where: { item_id: deductionItem.item_id },
      data: { amount: deduction35 }
    });
  }

  // คำนวณคงเหลือ (เฉพาะส่วนค่าเทอม)
  const netTuition = tuitionSum - deduction35;
  const remainItem = tuitionItems.find(i => i.item_name.includes("คงเหลือ"));
  if (remainItem) {
    await prisma.revenueItem.update({
      where: { item_id: remainItem.item_id },
      data: { amount: netTuition }
    });
  }

  // 2. คำนวณยอดรวมทั้งโครงการ (Total Revenue)
  // สูตร: (ยอดรวมทุกรายการที่ไม่ใช่รายการหัก)
  const incomeItems = allItems.filter(i => !i.is_deduction && !i.item_name.startsWith("1.1")); // ไม่เอา Header
  const totalRevenue = incomeItems.reduce((sum, item) => sum + Number(item.amount), 0);

  // 3. คำนวณยอดรายจ่าย (Expenses / Deductions) ที่ไม่ใช่ 35% (เพราะ 35% หักไปใน NetTuition แล้ว หรือจะคิดแยกก็ได้แล้วแต่ Logic)
  // แต่เพื่อให้ง่าย: Net Amount = Total Revenue - Total Deductions
  const deductionItems = allItems.filter(i => i.is_deduction);
  const totalDeduction = deductionItems.reduce((sum, item) => sum + Number(item.amount), 0);

  const finalNet = totalRevenue - totalDeduction;

  // อัปเดต Header
  await prisma.revenueBudget.update({
    where: { revenue_budget_id: budgetId },
    data: {
      total_amount: totalRevenue,
      net_amount: finalNet
    },
  });
}

// ช่วยดึงค่าเทอมจาก Enrollment มาคำนวณ (ใช้ตอนสร้างปีใหม่)
async function calculateTuitionRevenue(budgetYear: number) {
  const prevYear = budgetYear - 1;
  const programs = await prisma.academicProgram.findMany({
    where: { is_active: true },
    include: {
      EnrollmentInformation: {
        where: { academic_year: { in: [prevYear, budgetYear] } }
      },
    },
  });

  let amountTerm1Prev = 0;
  let amountTerm2Prev = 0;
  let amountTerm1Curr = 0;

  for (const prog of programs) {
    // ✅ ใช้ tuition_per_semester จาก Program โดยตรง
    const fee = Number(prog.tuition_per_semester || 0);

    // ฟังก์ชันช่วยดึงจำนวนนักศึกษา (Prioritize Actual -> Plan)
    const getStudentCount = (year: number, semester: number) => {
      // 1. ลองหา Actual ก่อน (เผื่อเป็นปีเก่าที่มีข้อมูลจริงแล้ว)
      const actual = prog.EnrollmentInformation.find(e =>
        e.academic_year === year && e.semester === semester && e.plan_type === 'actual'
      );
      if (actual) {
        return (actual.year1_count + actual.year2_count + actual.year3_count + actual.year4_count + actual.year5_count + actual.year6_count);
      }

      // 2. ถ้าไม่มี Actual ให้หา Plan (สำหรับปีปัจจุบัน/อนาคต)
      const plan = prog.EnrollmentInformation.find(e =>
        e.academic_year === year && e.semester === semester && e.plan_type === 'plan'
      );
      if (plan) {
        return (plan.year1_count + plan.year2_count + plan.year3_count + plan.year4_count + plan.year5_count + plan.year6_count);
      }

      return 0; // ไม่พบข้อมูล
    };

    // คำนวณยอดเงินสะสม
    const countTerm1Prev = getStudentCount(prevYear, 1);
    const countTerm2Prev = getStudentCount(prevYear, 2);
    const countTerm1Curr = getStudentCount(budgetYear, 1);

    amountTerm1Prev += (countTerm1Prev * fee * 2) / 5;
    amountTerm2Prev += (countTerm2Prev * fee); // เต็มเทอม
    amountTerm1Curr += (countTerm1Curr * fee * 3) / 5;
  }

  return { amountTerm1Prev, amountTerm2Prev, amountTerm1Curr };
}
// ==========================================
// 2. Export Actions (ฟังก์ชันหลักที่ Page เรียกใช้)
// ==========================================

// ✅ 2.1 ดึงข้อมูล (แก้ไขให้รับ year แทน ID)
export async function getRevenueData(year: number) {
  if (!year) return null;

  const budget = await prisma.revenueBudget.findUnique({
    where: { budget_year: year },
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
    total_amount: Number(budget.total_amount),
    net_amount: Number(budget.net_amount),
    sections: budget.sections.map((section) => ({
      ...section,
      items: section.items.map((item) => ({
        ...item,
        amount: Number(item.amount),
      })),
    })),
  };
}

// ✅ 2.2 สร้างแผนปีใหม่ (Clone & Seed Logic)
// actions.ts (แก้ไขเฉพาะฟังก์ชัน createRevenuePlan)

export async function createRevenuePlan(year: number) {
  try {
    // 1. เช็คก่อนว่ามี Header อยู่แล้วไหม
    const existing = await prisma.revenueBudget.findUnique({
      where: { budget_year: year },
      include: { sections: true } // เช็คด้วยว่ามีไส้ในไหม
    });

    let budgetId: number;

    if (existing) {
      // ถ้ามีข้อมูล Sections อยู่แล้ว -> ถือว่าซ้ำ ให้แจ้งเตือน
      if (existing.sections.length > 0) {
        return { success: false, message: "ปีงบประมาณนี้มีข้อมูลครบถ้วนอยู่แล้ว" };
      }
      // **แก้ตรงนี้:** ถ้ามีแต่หัว (Empty Shell) -> ให้ใช้ ID เดิมเลย ไม่ต้อง return error
      console.log(`Found empty budget header for year ${year}, proceeding to populate items...`);
      budgetId = existing.revenue_budget_id;
    } else {
      // ถ้าไม่มีเลย -> สร้าง Header ใหม่
      const newBudget = await prisma.revenueBudget.create({
        data: { budget_year: year, status: "draft", total_amount: 0, net_amount: 0, is_active: true }
      });
      budgetId = newBudget.revenue_budget_id;
    }

    // --- จากจุดนี้ใช้ budgetId ในการสร้าง Sections/Items เหมือนเดิม ---

    // 2. สร้าง Section 1 (ค่าเทอม)
    const { amountTerm1Prev, amountTerm2Prev, amountTerm1Curr } = await calculateTuitionRevenue(year);
    const prevYear = year - 1;
    const shortYear = year % 100;
    const shortPrev = prevYear % 100;

    const sec1 = await prisma.revenueSection.create({
      data: { revenue_budget_id: budgetId, section_name: "1. เงินค่าบำรุงการศึกษา และค่าธรรมเนียมต่าง ๆ", sort_order: 1 }
    });

    const sec1Items = [
      { name: "1.1 ค่าบำรุงการศึกษาฯ (Header)", amount: 0 },
      { name: `ภาคเรียนที่ 1/${prevYear} (ต.ค.-พ.ย.${shortPrev})`, amount: amountTerm1Prev },
      { name: `ภาคเรียนที่ 2/${prevYear} (ธ.ค.${shortPrev}-เม.ย.${shortYear})`, amount: amountTerm2Prev },
      { name: `ภาคเรียนที่ 1/${year} (ก.ค.-ก.ย.${shortYear})`, amount: amountTerm1Curr },
      { name: "รายรับก่อนหักโอนให้หน่วยงานกลาง", amount: 0 },
      { name: "หักให้งบกลาง 35%", amount: 0, is_deduction: true },
      { name: "คงเหลือ", amount: 0 },
      { name: "1.2 ค่าธรรมเนียมการรับนักศึกษา", amount: 0 },
      { name: "1.3 ค่าใบรับรองการศึกษา / ค่าธรรมเนียมอื่นๆ", amount: 0 }
    ];

    for (let i = 0; i < sec1Items.length; i++) {
      await prisma.revenueItem.create({
        data: { section_id: sec1.section_id, item_name: sec1Items[i].name, amount: sec1Items[i].amount, is_deduction: sec1Items[i].is_deduction || false, sort_order: i + 1 }
      });
    }

    // 3. Clone Section อื่นๆ (เหมือนเดิม)
    const prevBudget = await prisma.revenueBudget.findUnique({
      where: { budget_year: prevYear },
      include: { sections: { include: { items: true } } }
    });

    if (prevBudget && prevBudget.sections.length > 0) {
      for (const oldSec of prevBudget.sections) {
        if (oldSec.sort_order === 1 || oldSec.section_name.startsWith("1.")) continue;

        const newSec = await prisma.revenueSection.create({
          data: { revenue_budget_id: budgetId, section_name: oldSec.section_name, sort_order: oldSec.sort_order }
        });

        for (const oldItem of oldSec.items) {
          await prisma.revenueItem.create({
            data: { section_id: newSec.section_id, item_name: oldItem.item_name, amount: 0, is_deduction: oldItem.is_deduction, sort_order: oldItem.sort_order }
          });
        }
      }
    } else {
      // Fallback: Default Template (ถ้าไม่มีปีเก่าให้ Clone)
      const defaultSecs = [
        { name: "2. เงินรายได้จากงานบริการ", items: ["รายรับค่าลงทะเบียนจากประชุมวิชาการ"] },
        { name: "3. เงินผลประโยชน์ (เช่น ค่าบำรุงโรงอาหาร)", items: ["รายได้จากการบริการโรงอาหาร"] },
        { name: "4. เงินรายได้จากการรับบริจาค หรือ เงินอุดหนุน", items: ["รายได้จากการรับเงินสนับสนุนเพื่อการศึกษา"] },
        { name: "หักค่าสอนบริการ", items: ["1. โอนเงินให้สำนักศึกษาทั่วไป", "2. โอนเงินให้คณะวิทยาศาสตร์"], isDeduction: true },
        { name: "ค่าจ้างพนักงานสถาบันที่เปลี่ยนสถานภาพ...", items: ["1. โอนเงินให้ สนง.อธิการบดี", "2. โอนเงินเข้ากองทุนวิจัยสถาบัน"], isDeduction: true }
      ];

      let order = 2;
      for (const dSec of defaultSecs) {
        const newSec = await prisma.revenueSection.create({
          data: { revenue_budget_id: budgetId, section_name: dSec.name, sort_order: order++ }
        });
        let itemOrder = 1;
        for (const dItem of dSec.items) {
          await prisma.revenueItem.create({
            data: {
              section_id: newSec.section_id,
              item_name: dItem,
              amount: 0,
              is_deduction: dSec.isDeduction || false,
              sort_order: itemOrder++
            }
          });
        }
      }
    }

    await recalculateBudgetTotal(budgetId);
    revalidatePath("/planning/revenue");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Error creating plan" };
  }
}

// ✅ 2.3 เพิ่มหมวดหมู่ใหม่ (Add Section)
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

// ✅ 2.4 เพิ่มรายการย่อย (Add Item)
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

// ✅ 2.5 ลบรายการ (Delete Item)
export async function deleteRevenueItem(itemId: number, budgetId: number) {
  await prisma.revenueItem.delete({ where: { item_id: itemId } });
  await recalculateBudgetTotal(budgetId);
  revalidatePath("/planning/revenue");
  return { success: true };
}

// ✅ 2.6 บันทึกแก้ไขหลายรายการ (Bulk Update)
export async function bulkUpdateRevenueItems(
  items: { itemId: number; amount: number }[],
  budgetId: number,
  newStatus: BudgetStatus = 'draft' // Default เป็น draft
) {
  try {
    // ใช้ Transaction เพื่อความชัวร์ (แก้ Items + แก้ Header พร้อมกัน)
    await prisma.$transaction(async (tx) => {

      // 1. อัปเดตยอดเงินใน Items
      for (const item of items) {
        await tx.revenueItem.update({
          where: { item_id: item.itemId },
          data: { amount: item.amount }
        });
      }

      // 2. อัปเดต Header (เปลี่ยน Status และ +1 Version)
      await tx.revenueBudget.update({
        where: { revenue_budget_id: budgetId },
        data: {
          status: newStatus,
          version: { increment: 1 } // ✅ บวก version ขึ้นทีละ 1 อัตโนมัติ
        }
      });
    });

    // 3. คำนวณยอดรวมใหม่ (เรียก Helper function เดิม)
    await recalculateBudgetTotal(budgetId);

    revalidatePath("/planning/revenue");
    return { success: true };

  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to update" };
  }
}

export async function refreshTuitionRevenue(budgetYear: number, budgetId: number) {
  try {
    // 1. คำนวณใหม่
    const { amountTerm1Prev, amountTerm2Prev, amountTerm1Curr } = await calculateTuitionRevenue(budgetYear);
    const prevYear = budgetYear - 1;

    // 2. อัปเดตลง Database (เฉพาะรายการที่เป็นค่าเทอม)
    // ค้นหา Section 1
    const section1 = await prisma.revenueSection.findFirst({
      where: { revenue_budget_id: budgetId, sort_order: 1 }
    });

    if (section1) {
      // Map ชื่อรายการกับค่าที่คำนวณได้
      const updateMap = [
        { key: `ภาคเรียนที่ 1/${prevYear}`, amount: amountTerm1Prev },
        { key: `ภาคเรียนที่ 2/${prevYear}`, amount: amountTerm2Prev },
        { key: `ภาคเรียนที่ 1/${budgetYear}`, amount: amountTerm1Curr },
      ];

      for (const item of updateMap) {
        // หา Item ที่ชื่อตรงกัน (ใช้ contains เพราะชื่อเต็มอาจยาว)
        const dbItem = await prisma.revenueItem.findFirst({
          where: {
            section_id: section1.section_id,
            item_name: { contains: item.key }
          }
        });

        if (dbItem) {
          await prisma.revenueItem.update({
            where: { item_id: dbItem.item_id },
            data: { amount: item.amount }
          });
        }
      }
    }

    // 3. คำนวณยอดรวมใหม่ (35%, Net Amount)
    await recalculateBudgetTotal(budgetId);
    revalidatePath("/planning/revenue");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to recalculate" };
  }
}