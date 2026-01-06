/*
  Warnings:

  - The `credits` column on the `teaching_service_fees` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "teaching_service_fees" ADD COLUMN     "credits_structure" TEXT NOT NULL DEFAULT '0-0-0',
DROP COLUMN "credits",
ADD COLUMN     "credits" INTEGER NOT NULL DEFAULT 0;
