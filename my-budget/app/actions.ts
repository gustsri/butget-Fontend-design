"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ฟังก์ชันดึงปีงบประมาณ (ใช้ร่วมกันทุกหน้า)
export async function getBudgetYears() {
  const budgets = await prisma.revenueBudget.findMany({
    where: { is_active: true },
    orderBy: { budget_year: "desc" },
    select: { revenue_budget_id: true, budget_year: true },
  });
  return budgets.map((b) => ({ id: b.revenue_budget_id, year: b.budget_year }));
}

export async function createBudgetYear(year: number) {
  try {
    const existing = await prisma.revenueBudget.findFirst({
      where: { budget_year: year }
    });

    if (existing) {
      return { id: existing.revenue_budget_id, year: existing.budget_year };
    }

    const newBudget = await prisma.revenueBudget.create({
      data: {
        budget_year: year,
        is_active: true,
      },
    });

    revalidatePath("/");
    return { id: newBudget.revenue_budget_id, year: newBudget.budget_year };

  } catch (error) {
    console.error("Error creating budget year:", error);
    throw new Error("Failed to create budget year");
  }
}
