"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ==========================================
// 1. Fetch Data
// ==========================================
export async function getProgramsWithFees() {
  // ไม่ต้อง include student_fees แล้ว ดึงจาก table หลักได้เลย
  const programs = await prisma.academicProgram.findMany({
    orderBy: { academic_program_id: 'asc' }
  });

  return programs.map(p => ({
    academic_program_id: p.academic_program_id,
    program_name: p.program_name,
    degree_level: p.degree_level,
    program_type: p.program_type,
    is_active: p.is_active,
    // แก้: ดึงค่าเทอมจาก p โดยตรง (แปลง Decimal เป็น Number)
    tuition_per_semester: p.tuition_per_semester ? Number(p.tuition_per_semester) : 0
  }));
}

// ==========================================
// 2. Update Data (แก้ไข)
// ==========================================
export async function updateProgramDetails(programId: number, amount: number, isActive: boolean) {
  try {
    // แก้: ยุบรวมเหลือการ update ที่เดียว ไม่ต้องเช็ค existingFee
    await prisma.academicProgram.update({
      where: { academic_program_id: programId },
      data: { 
        is_active: isActive,
        tuition_per_semester: amount // อัปเดตราคาได้เลย
      },
    });

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
        // แก้: ใส่ tuition_per_semester เข้าไปใน data ตอน create ได้เลย
        await prisma.academicProgram.create({
            data: {
                program_name: data.program_name,
                degree_level: data.degree_level,
                program_type: data.program_type,
                tuition_per_semester: data.tuition_per_semester, // เพิ่มบรรทัดนี้
                is_active: true,
            }
        });
        
        // ลบส่วนที่เป็นการ create studentFee ทิ้งไปได้เลย

        revalidatePath("/planning/tuition-fees");
        return { success: true };

    } catch (error) {
        console.error("Create Error:", error);
        return { success: false, error: "Failed to create program" };
    }
}