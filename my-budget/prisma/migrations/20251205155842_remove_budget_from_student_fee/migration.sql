/*
  Warnings:

  - You are about to drop the column `revenue_budget_id` on the `student_fees` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "student_fees" DROP CONSTRAINT "student_fees_revenue_budget_id_fkey";

-- AlterTable
ALTER TABLE "student_fees" DROP COLUMN "revenue_budget_id";
