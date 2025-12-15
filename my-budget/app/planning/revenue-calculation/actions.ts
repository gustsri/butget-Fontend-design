// app/planning/revenue-calculation/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { PlanType } from "@prisma/client"; // ตรวจสอบว่ามี Enum นี้ใน schema แล้ว

export async function getRevenueSimulationData(fiscalYear: number) {
    // Logic ตรงนี้ดีแล้วครับ Query ตาม "academic_year" ตรงๆ ไม่ต้องผ่าน ID
    // และใช้ PlanType.PLAN ซึ่งถูกต้องสำหรับการ Simulation
    const rawPrograms = await prisma.academicProgram.findMany({
        where: { is_active: true },
        include: {
            EnrollmentInformation: {
                where: {
                    OR: [
                        { academic_year: fiscalYear - 1, semester: 1, plan_type: PlanType.PLAN },
                        { academic_year: fiscalYear - 1, semester: 2, plan_type: PlanType.PLAN },
                        { academic_year: fiscalYear, semester: 1, plan_type: PlanType.PLAN }
                    ]
                },
            },
        },
        orderBy: {
            program_name: "asc",
        },
    });

    const programs = rawPrograms.map(program => ({
        ...program,
        tuition_per_semester: Number(program.tuition_per_semester)
    }));

    return { programs, fiscalYear };
}