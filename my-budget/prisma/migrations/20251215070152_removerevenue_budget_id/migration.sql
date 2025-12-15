/*
  Warnings:

  - You are about to drop the column `revenue_budget_id` on the `enrollment_information` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[academic_program_id,academic_year,semester,plan_type]` on the table `enrollment_information` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "enrollment_information" DROP CONSTRAINT "enrollment_information_revenue_budget_id_fkey";

-- DropIndex
DROP INDEX "enrollment_information_academic_program_id_revenue_budget_i_key";

-- AlterTable
ALTER TABLE "enrollment_information" DROP COLUMN "revenue_budget_id";

-- CreateIndex
CREATE UNIQUE INDEX "enrollment_information_academic_program_id_academic_year_se_key" ON "enrollment_information"("academic_program_id", "academic_year", "semester", "plan_type");
