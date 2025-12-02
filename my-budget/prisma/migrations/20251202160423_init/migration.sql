-- CreateEnum
CREATE TYPE "DegreeLevel" AS ENUM ('bachelor', 'bachelor_master', 'master', 'phd');

-- CreateEnum
CREATE TYPE "ProgramType" AS ENUM ('normal', 'international');

-- CreateTable
CREATE TABLE "academic_programs" (
    "academic_program_id" SERIAL NOT NULL,
    "program_name" VARCHAR(255) NOT NULL,
    "degree_level" "DegreeLevel" NOT NULL,
    "program_type" "ProgramType" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academic_programs_pkey" PRIMARY KEY ("academic_program_id")
);

-- CreateTable
CREATE TABLE "student_fees" (
    "student_fee_id" SERIAL NOT NULL,
    "academic_program_id" INTEGER NOT NULL,
    "revenue_budget_id" INTEGER NOT NULL,
    "tuition_per_semester" DECIMAL(12,2) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_fees_pkey" PRIMARY KEY ("student_fee_id")
);

-- AddForeignKey
ALTER TABLE "student_fees" ADD CONSTRAINT "student_fees_academic_program_id_fkey" FOREIGN KEY ("academic_program_id") REFERENCES "academic_programs"("academic_program_id") ON DELETE RESTRICT ON UPDATE CASCADE;
