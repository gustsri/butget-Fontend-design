"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ==========================================
// 1. Fetch Data
// ==========================================
export async function getProgramsWithFees() {
  const programs = await prisma.academicProgram.findMany({
    include: {
      student_fees: {
        where: { is_active: true },
        orderBy: { created_at: 'desc' }, // เอาค่าเทอมล่าสุดที่ Active
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
    tuition_per_semester: p.student_fees[0]?.tuition_per_semester.toNumber() || 0
  }));
}

// ==========================================
// 2. Update Data (แก้ไข)
// ==========================================
export async function updateProgramDetails(programId: number, amount: number, isActive: boolean) {
  try {
    // 1. อัปเดตสถานะ Master Data
    await prisma.academicProgram.update({
      where: { academic_program_id: programId },
      data: { is_active: isActive },
    });

    // 2. อัปเดตราคา (Standard Price)
    const existingFee = await prisma.studentFee.findFirst({
      where: { academic_program_id: programId, is_active: true },
    });

    if (existingFee) {
      // Update เดิม
      await prisma.studentFee.update({
        where: { student_fee_id: existingFee.student_fee_id },
        data: { tuition_per_semester: amount },
      });
    } else {
      // Create ใหม่ (ถ้ายังไม่เคยมี)
      await prisma.studentFee.create({
        data: {
          academic_program_id: programId,
          tuition_per_semester: amount,
          is_active: true,
        },
      });
    }

    revalidatePath("/planning/tuition-fees"); 
    return { success: true };
    
  } catch (error) {
    console.error("Update Error:", error);
    return { success: false, error: "Failed to update details" };
  }
}

// ==========================================
// 3. Create Data (สร้างใหม่)
// ==========================================
type CreateProgramInput = {
    program_name: string;
    degree_level: "bachelor" | "bachelor_master" | "master" | "phd";
    program_type: "normal" | "international";
    tuition_per_semester: number;
};

export async function createProgram(data: CreateProgramInput) {
    try {
        // 1. สร้างหลักสูตร
        const newProgram = await prisma.academicProgram.create({
            data: {
                program_name: data.program_name,
                degree_level: data.degree_level,
                program_type: data.program_type,
                is_active: true,
            }
        });

        // 2. สร้างค่าเทอมมาตรฐาน (Standard Fee) ทันที
        // ไม่ต้องสนใจ Budget ID แล้ว
        await prisma.studentFee.create({
            data: {
                academic_program_id: newProgram.academic_program_id,
                tuition_per_semester: data.tuition_per_semester,
                is_active: true
            }
        });

        revalidatePath("/planning/tuition-fees");
        return { success: true };

    } catch (error) {
        console.error("Create Error:", error);
        return { success: false, error: "Failed to create program" };
    }
}