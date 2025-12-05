"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ... (functions เดิม getRevenueData, createRevenuePlan เก็บไว้) ...
export async function getRevenueData(budgetId: number) {
  const budget = await prisma.revenueBudget.findUnique({
    where: { revenue_budget_id: budgetId },
    include: {
      sections: {
        orderBy: { sort_order: "asc" },
        include: {
          items: {
            orderBy: { sort_order: "asc" },
          },
        },
      },
    },
  });

  if (!budget) return null;

  // ✅ แก้ไขตรงนี้: แปลง Decimal เป็น Number ก่อนส่งกลับ
  return {
    ...budget,
    total_amount: budget.total_amount.toNumber(),
    net_amount: budget.net_amount.toNumber(),
    sections: budget.sections.map((section) => ({
      ...section,
      items: section.items.map((item) => ({
        ...item,
        amount: item.amount.toNumber(), // แปลง amount ในรายการย่อยด้วย
      })),
    })),
  };
}

export async function createRevenuePlan(year: number) {
  try {
    const existing = await prisma.revenueBudget.findUnique({ where: { budget_year: year } });
    if (existing) return { success: false, message: "ปีงบประมาณนี้มีอยู่แล้ว" };

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
          { name: `ภาคเรียนที่ 1/${prevYear} (ต.ค.-พ.ย.${shortPrev}) - จำนวน 2 เดือน`, amount: 0 },
          { name: `ภาคเรียนที่ 2/${prevYear} (ธ.ค.${shortPrev}-เม.ย.${shortYear}) - เต็มภาคการศึกษา`, amount: 0 },
          { name: `ภาคเรียนที่ 1/${year} (ก.ค.-ก.ย.${shortYear}) - จำนวน 3 เดือน`, amount: 0 },
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

    revalidatePath("/planning/revenue");
    return { success: true, newId: budget.revenue_budget_id };
  } catch (error) {
    console.error(error);
    return { success: false, message: "เกิดข้อผิดพลาดในการสร้างข้อมูล" };
  }
}

// ✅ 3. ฟังก์ชันบันทึกแบบกลุ่ม (Batch Update) - แทนที่ updateRevenueItem เดิม
export async function bulkUpdateRevenueItems(
  items: { itemId: number; amount: number }[],
  budgetId: number
) {
  try {
    // 3.1 ใช้ Transaction เพื่ออัปเดตทุกรายการพร้อมกัน
    await prisma.$transaction(
      items.map((item) =>
        prisma.revenueItem.update({
          where: { item_id: item.itemId },
          data: { amount: item.amount },
        })
      )
    );

    // 3.2 คำนวณยอดรวมใหม่ (Recalculate)
    const allItems = await prisma.revenueItem.findMany({
      where: {
        section: { revenue_budget_id: budgetId },
      },
    });

    const totalAmount = allItems
      .filter((i) => !i.is_deduction)
      .reduce((sum, item) => sum + item.amount.toNumber(), 0);

    const totalDeduction = allItems
      .filter((i) => i.is_deduction)
      .reduce((sum, item) => sum + item.amount.toNumber(), 0);

    const netAmount = totalAmount - totalDeduction;

    // 3.3 อัปเดต Header
    await prisma.revenueBudget.update({
      where: { revenue_budget_id: budgetId },
      data: {
        total_amount: totalAmount,
        net_amount: netAmount,
      },
    });

    revalidatePath("/planning/revenue");
    return { success: true };
  } catch (error) {
    console.error("Bulk Update Error:", error);
    return { success: false };
  }
}

// ... (function updateBudgetStatus เก็บไว้เหมือนเดิม) ...
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