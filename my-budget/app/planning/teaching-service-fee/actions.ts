"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- 1. ดึงข้อมูลรายวิชา ---
export async function getTeachingFeeData(year?: number, semester?: number) {
  try {
    const courses = await prisma.teachingServiceFee.findMany({
      orderBy: { course_code: "asc" },
    });

    return courses.map((c) => {
      const regCount = Number(c.student_regular);
      const specCount = Number(c.student_special);
      const credits = Number(c.credits) || 0;
      const rate = 150;

      return {
        id: c.id,
        courseCode: c.course_code,
        courseName: c.course_name,
        yearLevel: c.year_level,
        studentRegular: regCount,
        studentSpecial: specCount,
        credits: credits,
        creditsStructure: c.credits_structure,
        feeRegular: regCount * rate * credits, // คำนวณ: คน * 150 * หน่วยกิต
        feeSpecial: specCount * rate * credits,
        feeSum: (regCount + specCount) * rate * credits,
        grandTotal: (regCount + specCount) * rate * credits,
      };
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
}

// --- 2. อัปเดตข้อมูลแบบ Bulk ---
export async function updateTeachingFee(items: any[]) {
  try {
    await prisma.$transaction(
      items.map((item) => {
        // ในขั้นตอนนี้ เราควรคำนวณเงินใหม่โดยอ้างอิงจากหน่วยกิตใน DB
        return prisma.teachingServiceFee.update({
          where: { id: item.id },
          data: {
            student_regular: item.updates.student_regular,
            student_special: item.updates.student_special,
            // หมายเหตุ: หากต้องการความแม่นยำสูง ควรดึง credits จาก DB มาคูณในขั้นตอนนี้ด้วย
            // หรือส่งค่ารวมที่คำนวณแล้วมาจากหน้าบ้าน
          },
        });
      })
    );
    revalidatePath("/teachingservicefee");
    return { success: true };
  } catch (error) {
    return { success: false, error: "บันทึกข้อมูลไม่สำเร็จ" };
  }
}

// --- 3. เพิ่มรายวิชาใหม่ ---
export async function addTeachingFeeItem(data: any) {
  try {
    const rate = 150;
    const reg = Number(data.studentRegular) || 0;
    const spec = Number(data.studentSpecial) || 0;
    const credits = Number(data.credits) || 0;

    await prisma.teachingServiceFee.create({
      data: {
        course_code: data.courseCode,
        course_name: data.courseName,
        year_level: data.yearLevel,
        student_regular: reg,
        student_special: spec,
        credits: credits,
        credits_structure: data.creditsStructure,
        fee_regular: reg * rate * credits, // คน * 150 * หน่วยกิต
        fee_special: spec * rate * credits,
        fee_sum: (reg + spec) * rate * credits,
        grand_total: (reg + spec) * rate * credits,
      },
    });
    revalidatePath("/teachingservicefee");
    return { success: true };
  } catch (error) {
    return { success: false, error: "ไม่สามารถเพิ่มรายวิชาได้" };
  }
}