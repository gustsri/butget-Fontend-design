"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- 3. ดึงข้อมูลนักศึกษา (Refactor: ใช้ Year แทน ID) ---
export async function getEnrollmentData(year: number, semester: number) {
  // ไม่ต้องหา ID แล้ว ใช้ year ตรงๆ ได้เลย
  const currentYear = year;
  const prevYear = year - 1;

  // ดึงข้อมูล Enrollment ของปีนี้ (ตาม Semester) และปีก่อนหน้า (ยอดรวม)
  const programs = await prisma.academicProgram.findMany({
    include: {
      EnrollmentInformation: {
        where: {
          OR: [
            // เงื่อนไข 1: ของปีที่เลือก + เทอมที่เลือก
            { academic_year: currentYear, semester: semester },
            // เงื่อนไข 2: ของปีก่อนหน้า (เอามาเช็ค Phasing Out)
            { academic_year: prevYear }
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
    // กรองข้อมูลใน Memory (เพราะดึงมาแค่นิดเดียว)
    const currentEnrollments = p.EnrollmentInformation.filter(
      e => e.academic_year === currentYear && e.semester === semester
    );

    const prevEnrollments = p.EnrollmentInformation.filter(
      e => e.academic_year === prevYear
    );

    const prevTotal = prevEnrollments.reduce((sum, e) =>
      sum + e.year1_count + e.year2_count + e.year3_count + e.year4_count + e.year5_count + e.year6_count, 0
    );

    const hasCurrentData = currentEnrollments.length > 0;
    // Logic: ถ้าหลักสูตรปิด + ปีนี้ไม่มีข้อมูล + ปีก่อนก็ไม่มีเด็ก = ไม่ต้องแสดง
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

// --- 4. บันทึกข้อมูล (Refactor: ใช้ Year แทน ID) ---
type UpdateItem = {
  programId: number;
  planType: "plan" | "actual";
  updates: Record<string, number>;
};

export async function bulkUpdateEnrollment(items: UpdateItem[], year: number, semester: number) {
  try {
    await prisma.$transaction(
      items.map((item) => {
        return prisma.enrollmentInformation.upsert({
          where: {
            // ✅ ใช้ Constraint ใหม่ตาม Schema ที่แก้ไป (ตัด revenue_budget_id ทิ้ง)
            academic_program_id_academic_year_semester_plan_type: {
              academic_program_id: item.programId,
              academic_year: year,        // ใช้ year ที่ส่งมาตรงๆ
              semester: semester,
              plan_type: item.planType,
            }
          },
          update: item.updates,
          create: {
            academic_program_id: item.programId,
            academic_year: year,          // ใช้ year ที่ส่งมาตรงๆ
            semester: semester,
            plan_type: item.planType,
            // ❌ ไม่ต้องใส่ revenue_budget_id แล้ว
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