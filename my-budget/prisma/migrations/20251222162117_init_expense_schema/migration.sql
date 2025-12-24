/*
  Warnings:

  - You are about to drop the column `createdAt` on the `expense_budgets` table. All the data in the column will be lost.
  - You are about to drop the column `total_amount` on the `expense_budgets` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `expense_budgets` table. All the data in the column will be lost.
  - The `status` column on the `expense_budgets` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `createdAt` on the `expense_items` table. All the data in the column will be lost.
  - You are about to drop the column `gov_amount` on the `expense_items` table. All the data in the column will be lost.
  - You are about to drop the column `income_amount` on the `expense_items` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `expense_items` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `structure_codes` table. All the data in the column will be lost.
  - You are about to drop the column `is_header` on the `structure_codes` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `structure_codes` table. All the data in the column will be lost.
  - The `category` column on the `structure_codes` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[academic_year]` on the table `expense_budgets` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `expense_budgets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `node_type` to the `structure_codes` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BudgetCategory" AS ENUM ('REVENUE', 'EXPENSE');

-- CreateEnum
CREATE TYPE "NodeType" AS ENUM ('PLAN', 'JOB', 'ACTIVITY', 'FUND', 'CATEGORY', 'ITEM');

-- CreateEnum
CREATE TYPE "InputType" AS ENUM ('HEADER', 'INPUT');

-- DropForeignKey
ALTER TABLE "expense_items" DROP CONSTRAINT "expense_items_structure_id_fkey";

-- DropIndex
DROP INDEX "expense_items_budget_id_structure_id_key";

-- AlterTable
ALTER TABLE "expense_budgets" DROP COLUMN "createdAt",
DROP COLUMN "total_amount",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "total_gov" DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN     "total_income" DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "BudgetStatus" NOT NULL DEFAULT 'draft';

-- AlterTable
ALTER TABLE "expense_items" DROP COLUMN "createdAt",
DROP COLUMN "gov_amount",
DROP COLUMN "income_amount",
DROP COLUMN "updatedAt",
ADD COLUMN     "amount_gov" DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN     "amount_income" DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN     "custom_name" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "parent_id" INTEGER,
ALTER COLUMN "structure_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "structure_codes" DROP COLUMN "createdAt",
DROP COLUMN "is_header",
DROP COLUMN "updatedAt",
ADD COLUMN     "input_type" "InputType" NOT NULL DEFAULT 'INPUT',
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "node_type" "NodeType" NOT NULL,
ALTER COLUMN "code" SET DATA TYPE TEXT,
ALTER COLUMN "name" SET DATA TYPE TEXT,
DROP COLUMN "category",
ADD COLUMN     "category" "BudgetCategory" NOT NULL DEFAULT 'EXPENSE';

-- CreateIndex
CREATE UNIQUE INDEX "expense_budgets_academic_year_key" ON "expense_budgets"("academic_year");

-- CreateIndex
CREATE INDEX "expense_items_budget_id_idx" ON "expense_items"("budget_id");

-- CreateIndex
CREATE INDEX "structure_codes_code_idx" ON "structure_codes"("code");

-- CreateIndex
CREATE INDEX "structure_codes_category_is_active_idx" ON "structure_codes"("category", "is_active");

-- AddForeignKey
ALTER TABLE "expense_items" ADD CONSTRAINT "expense_items_structure_id_fkey" FOREIGN KEY ("structure_id") REFERENCES "structure_codes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_items" ADD CONSTRAINT "expense_items_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "expense_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
