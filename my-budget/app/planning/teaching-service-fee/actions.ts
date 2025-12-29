"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- 1. ประกาศ MOCK_DATA เพียงที่เดียวที่นี่ (บนสุดของไฟล์) ---
const MOCK_DATA = [
  {
    id: 1,
    courseCode: "GEN101",
    courseName: "การพัฒนาตนเองและวิชาชีพ",
    yearLevel: "1",
    studentRegular: 120,
    studentSpecial: 45,
    credits: "3(3-0-6)",
    feeRegular: 120 * 150,
    feeSpecial: 45 * 150,
    feeSum: (120 + 45) * 150,
    grandTotal: (120 + 45) * 150,
  },
  {
    id: 2,
    courseCode: "GEN121",
    courseName: "ทักษะการใช้ภาษาอังกฤษ",
    yearLevel: "1",
    studentRegular: 200,
    studentSpecial: 80,
    credits: "3(3-0-6)",
    feeRegular: 200 * 150,
    feeSpecial: 80 * 150,
    feeSum: (200 + 80) * 150,
    grandTotal: (200 + 80) * 150,
  },
  {
    id: 3,
    courseCode: "LNG102",
    courseName: "ภาษาอังกฤษพื้นฐาน 2",
    yearLevel: "2",
    studentRegular: 150,
    studentSpecial: 20,
    credits: "3(2-2-5)",
    feeRegular: 150 * 150,
    feeSpecial: 20 * 150,
    feeSum: (150 + 20) * 150,
    grandTotal: (150 + 20) * 150,
  }
];

// --- 2. ประเภทข้อมูลสำหรับการอัปเดต ---
type UpdateFeeItem = {
  id: number;
  updates: {
    student_regular_count?: number;
    student_special_count?: number;
  };
};

// --- 3. ดึงข้อมูลรายวิชาและค่าสอนบริการ ---
export async function getTeachingFeeData(year: number, semester: number) {
  try {
    const courses = await prisma.courseServiceFee.findMany({
      where: {
        academic_year: year,
        semester: semester,
      },
      orderBy: { course_code: "asc" },
    });

    // หากไม่มีข้อมูลในฐานข้อมูล ให้ใช้ MOCK_DATA แทนเพื่อทดสอบ UI
    if (courses.length === 0) {
      return MOCK_DATA;
    }

    return courses.map((c) => ({
      id: c.id,
      courseCode: c.course_code,
      courseName: c.course_name,
      yearLevel: c.year_level,
      studentRegular: c.student_regular_count,
      studentSpecial: c.student_special_count,
      credits: c.credits,
      feeRegular: c.student_regular_count * 150,
      feeSpecial: c.student_special_count * 150,
      feeSum: (c.student_regular_count + c.student_special_count) * 150,
      grandTotal: (c.student_regular_count + c.student_special_count) * 150,
    }));
  } catch (error) {
    console.error("Error fetching teaching fee data:", error);
    return MOCK_DATA; // คืนค่า Mock กรณี Error เพื่อให้หน้าเว็บไม่พัง
  }
}

// --- 4. บันทึกข้อมูลค่าสอนบริการแบบ Bulk Update ---
export async function updateTeachingFee(items: UpdateFeeItem[], year: number, semester: number) {
  try {
    await prisma.$transaction(
      items.map((item) => {
        return prisma.courseServiceFee.update({
          where: { id: item.id },
          data: {
            ...item.updates,
          },
        });
      })
    );

    revalidatePath("/teachingservicefee");
    return { success: true };
  } catch (error) {
    console.error("Bulk Update Teaching Fee Error:", error);
    return { success: false, error: "Failed to save data" };
  }
}

// --- 5. ดึงรายชื่อปีงบประมาณ ---
export async function getBudgetYears() {
  try {
    const budgets = await prisma.revenueBudget.findMany({
      where: { is_active: true },
      orderBy: { budget_year: "desc" },
      select: { revenue_budget_id: true, budget_year: true },
    });
    return budgets.map((b) => ({ id: b.revenue_budget_id, year: b.budget_year }));
  } catch (error) {
    console.error("Error fetching budget years:", error);
    return [];
  }
}

// --- 6. สร้างปีงบประมาณใหม่ ---
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