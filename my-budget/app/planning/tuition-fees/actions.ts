"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ฟังก์ชันดึงข้อมูล (เหมือนเดิม)
export async function getProgramsWithFees() {
  const programs = await prisma.academicProgram.findMany({
    include: {
      student_fees: {
        where: { is_active: true },
        orderBy: { created_at: 'desc' },
        take: 1
      }
    },
    orderBy: { academic_program_id: 'asc' }
  });

  return programs.map(p => ({
    academic_program_id: p.academic_program_id,
    program_name: p.program_name,
    degree_level: p.degree_level,
    program_type: p.program_type,
    is_active: p.is_active,
    student_fee_id: p.student_fees[0]?.student_fee_id || null,
    tuition_per_semester: p.student_fees[0]?.tuition_per_semester.toNumber() || null
  }));
}

// ✅ ฟังก์ชันอัปเดตข้อมูล (ชื่อใหม่ที่ page.tsx เรียกหา)
export async function updateProgramDetails(programId: number, amount: number, isActive: boolean) {
  try {
    // 1. อัปเดตสถานะ Active/Inactive ที่ตารางแม่ (AcademicProgram)
    await prisma.academicProgram.update({
      where: { academic_program_id: programId },
      data: { is_active: isActive },
    });

    // 2. อัปเดตราคาค่าเทอม ที่ตารางลูก (StudentFee)
    const existingFee = await prisma.studentFee.findFirst({
      where: { academic_program_id: programId, is_active: true },
    });

    if (existingFee) {
      // ถ้ามีอยู่แล้ว -> Update ราคา
      await prisma.studentFee.update({
        where: { student_fee_id: existingFee.student_fee_id },
        data: { tuition_per_semester: amount },
      });
    } else {
      // ถ้าไม่มี -> Create ใหม่
      await prisma.studentFee.create({
        data: {
          academic_program_id: programId,
          tuition_per_semester: amount,
          revenue_budget_id: 1, // ⚠️ อย่าลืมเช็คว่า ID 1 มีจริงในตาราง revenue_budgets
          is_active: true,
        },
      });
    }

    // สั่ง Refresh หน้าเว็บ
    revalidatePath("/planning/tuition-fees"); 
    return { success: true };
    
  } catch (error) {
    console.error("Update Error:", error);
    return { success: false, error: "Failed to update details" };
  }
}