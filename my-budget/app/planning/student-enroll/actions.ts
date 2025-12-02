"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- 1. ดึงรายชื่อปีงบประมาณ ---
export async function getBudgetYears() {
  const budgets = await prisma.revenueBudget.findMany({
    where: { is_active: true },
    orderBy: { budget_year: "desc" },
    select: { revenue_budget_id: true, budget_year: true },
  });
  // แปลงให้ใช้ง่าย
  return budgets.map((b) => ({ id: b.revenue_budget_id, year: b.budget_year }));
}

// --- 2. ดึงข้อมูลนักศึกษา (เหมือนเดิม) ---
export async function getEnrollmentData(budgetYearId: number) {
  // ... (ใช้โค้ดเดิมจากรอบที่แล้วได้เลยครับ) ...
  // ขอละไว้เพื่อความกระชับ ให้ใช้ตัวเดิมที่ return 2 rows (plan/actual)
  const programs = await prisma.academicProgram.findMany({
    where: { is_active: true },
    include: {
      EnrollmentInformation: {
        where: { revenue_budget_id: budgetYearId },
      },
    },
    orderBy: { academic_program_id: "asc" },
  });
  
  const results = [];
  for (const p of programs) {
    const createRow = (type: "plan" | "actual") => {
        const enrollment = p.EnrollmentInformation.find((e) => e.plan_type === type) || {};
        return {
          id: p.academic_program_id,
          name: p.program_name,
          degree: p.degree_level,
          planType: type,
          year1: enrollment.year1_count || 0,
          year2: enrollment.year2_count || 0,
          year3: enrollment.year3_count || 0,
          year4: enrollment.year4_count || 0,
          year5: enrollment.year5_count || 0,
          year6: enrollment.year6_count || 0,
          total: (enrollment.year1_count || 0) + (enrollment.year2_count || 0) + (enrollment.year3_count || 0) + (enrollment.year4_count || 0),
          enrollment_id: enrollment.enrollment_id || null,
        };
    };
    results.push(createRow("plan"));
    results.push(createRow("actual"));
  }
  return results;
}

// --- 3. บันทึกข้อมูลแบบกลุ่ม (Batch Save) ---
type UpdateItem = {
  programId: number;
  planType: "plan" | "actual";
  updates: Record<string, number>; // { year1_count: 50, year2_count: 40 }
};

export async function bulkUpdateEnrollment(items: UpdateItem[], budgetYearId: number) {
  try {
    // ใช้ Transaction เพื่อความปลอดภัย ข้อมูลต้องเข้าครบทุกตัว
    await prisma.$transaction(
      items.map((item) => {
        // เตรียมข้อมูลที่จะ Upsert
        const updateData = item.updates;

        // เช็คก่อนว่ามี record เดิมไหม (ต้องหาด้วย Unique constraint)
        // แต่ Prisma upsert ต้องการ unique where clause ที่ชัดเจน
        // เพื่อความง่าย เราจะใช้ findFirst แล้ว update หรือ create
        
        return prisma.enrollmentInformation.upsert({
          where: {
            academic_program_id_revenue_budget_id_plan_type_academic_year_semester: {
              academic_program_id: item.programId,
              revenue_budget_id: budgetYearId,
              plan_type: item.planType,
              academic_year: 2567, // TODO: แก้ให้ dynamic ตามปีที่เลือก
              semester: 1,
            }
          },
          update: updateData,
          create: {
            academic_program_id: item.programId,
            revenue_budget_id: budgetYearId,
            plan_type: item.planType,
            academic_year: 2567,
            semester: 1,
            year1_count: 0, year2_count: 0, year3_count: 0, 
            year4_count: 0, year5_count: 0, year6_count: 0,
            graduates: 0,
            ...updateData,
          },
        });
      })
    );

    revalidatePath("/planning/student-enroll");
    return { success: true };
  } catch (error) {
    console.error("Bulk Update Error:", error);
    return { success: false, error: "Failed to save data" };
  }
}