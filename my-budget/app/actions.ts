"use server";
import { prisma } from "@/lib/prisma";

// ฟังก์ชันดึงปีงบประมาณ (ใช้ร่วมกันทุกหน้า)
export async function getBudgetYears() {
  const budgets = await prisma.revenueBudget.findMany({
    where: { is_active: true },
    orderBy: { budget_year: "desc" },
    select: { revenue_budget_id: true, budget_year: true },
  });
  return budgets.map((b) => ({ id: b.revenue_budget_id, year: b.budget_year }));
}