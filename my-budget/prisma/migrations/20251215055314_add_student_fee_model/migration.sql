/*
  Warnings:

  - You are about to drop the `student_fees` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "student_fees" DROP CONSTRAINT "student_fees_academic_program_id_fkey";

-- AlterTable
ALTER TABLE "academic_programs" ADD COLUMN     "tuition_per_semester" DECIMAL(12,2) NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "student_fees";
