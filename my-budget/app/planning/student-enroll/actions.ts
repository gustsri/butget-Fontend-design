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
  return budgets.map((b) => ({ id: b.revenue_budget_id, year: b.budget_year }));
}

// --- 2. ดึงข้อมูลนักศึกษา (รองรับ Semester) ---
// ✅ เพิ่ม parameter: semester
export async function getEnrollmentData(currentBudgetId: number, semester: number) {
  const currentBudget = await prisma.revenueBudget.findUnique({
    where: { revenue_budget_id: currentBudgetId },
    select: { budget_year: true }
  });

  if (!currentBudget) return [];

  // หา ID ของปีงบประมาณก่อนหน้า (เพื่อใช้เช็ค Phasing Out)
  const prevBudget = await prisma.revenueBudget.findFirst({
    where: { budget_year: currentBudget.budget_year - 1 },
    select: { revenue_budget_id: true }
  });

  const prevBudgetId = prevBudget?.revenue_budget_id;

  // ดึงข้อมูล Enrollment ของปีนี้ (ตาม Semester ที่เลือก) และปีก่อนหน้า (ยอดรวม)
  const programs = await prisma.academicProgram.findMany({
    include: {
      EnrollmentInformation: {
        where: { 
          OR: [
            // เงื่อนไข 1: ของปีปัจจุบัน ต้องตรงกับ Semester ที่เลือก
            { revenue_budget_id: currentBudgetId, semester: semester },
            // เงื่อนไข 2: ของปีก่อนหน้า เอามาทั้งหมดเพื่อเช็คว่ามี นศ. ค้างไหม
            ...(prevBudgetId ? [{ revenue_budget_id: prevBudgetId }] : [])
          ]
        },
      },
    },
    orderBy: { academic_program_id: "asc" },
  });
  
  const degreeMap: Record<string, string> = {
    bachelor: "ปริญญาตรี",
    bachelor_master: "ปริญญาตรี-โท",
    master: "ปริญญาโท",
    phd: "ปริญญาเอก"
  };

  const results = [];
  
  for (const p of programs) {
    // ข้อมูลของ "ปีปัจจุบัน + เทอมที่เลือก"
    const currentEnrollments = p.EnrollmentInformation.filter(
        e => e.revenue_budget_id === currentBudgetId && e.semester === semester
    );

    // ข้อมูลของ "ปีก่อนหน้า" (เอามาทุกเทอมรวมกันเพื่อดูว่าเคยมีเด็กไหม)
    const prevEnrollments = p.EnrollmentInformation.filter(
        e => e.revenue_budget_id === prevBudgetId
    );

    const prevTotal = prevEnrollments.reduce((sum, e) => 
      sum + e.year1_count + e.year2_count + e.year3_count + e.year4_count + e.year5_count + e.year6_count, 0
    );

    const hasCurrentData = currentEnrollments.length > 0;
    // Phasing Out Logic: ถ้าปิดหลักสูตร แต่ปีก่อนยังมีเด็กเรียนอยู่ -> ต้องแสดง
    const isPhasingOut = !p.is_active && prevTotal > 0;
    
    if (!p.is_active && !hasCurrentData && !isPhasingOut) {
        continue;
    }

    const createRow = (type: "plan" | "actual") => {
        const enrollment = currentEnrollments.find((e) => e.plan_type === type) || {};
        const year1 = enrollment.year1_count || 0;
        const year2 = enrollment.year2_count || 0;
        const year3 = enrollment.year3_count || 0;
        const year4 = enrollment.year4_count || 0;
        const year5 = enrollment.year5_count || 0;
        const year6 = enrollment.year6_count || 0;

        return {
          id: p.academic_program_id,
          name: p.program_name,
          degree: degreeMap[p.degree_level] || p.degree_level,
          is_active: p.is_active, 
          planType: type,
          year1, year2, year3, year4, year5, year6,
          total: year1 + year2 + year3 + year4 + year5 + year6,
          enrollment_id: enrollment.enrollment_id || null,
        };
    };
    results.push(createRow("plan"));
    results.push(createRow("actual"));
  }
  return results;
}

// --- 3. บันทึกข้อมูล (รองรับ Semester) ---
type UpdateItem = {
  programId: number;
  planType: "plan" | "actual";
  updates: Record<string, number>; 
};

// ✅ เพิ่ม parameter: semester
export async function bulkUpdateEnrollment(items: UpdateItem[], budgetYearId: number, semester: number) {
  try {
    const budget = await prisma.revenueBudget.findUnique({
      where: { revenue_budget_id: budgetYearId },
      select: { budget_year: true }
    });

    if (!budget) throw new Error("Budget year not found");
    const academicYear = budget.budget_year;

    await prisma.$transaction(
      items.map((item) => {
        return prisma.enrollmentInformation.upsert({
          where: {
            academic_program_id_revenue_budget_id_plan_type_academic_year_semester: {
              academic_program_id: item.programId,
              revenue_budget_id: budgetYearId,
              plan_type: item.planType,
              academic_year: academicYear,
              semester: semester, // ✅ ใช้ Semester ที่ส่งมา
            }
          },
          update: item.updates,
          create: {
            academic_program_id: item.programId,
            revenue_budget_id: budgetYearId,
            plan_type: item.planType,
            academic_year: academicYear,
            semester: semester, // ✅ ใช้ Semester ที่ส่งมา
            year1_count: 0, year2_count: 0, year3_count: 0, 
            year4_count: 0, year5_count: 0, year6_count: 0,
            graduates: 0,
            ...item.updates,
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