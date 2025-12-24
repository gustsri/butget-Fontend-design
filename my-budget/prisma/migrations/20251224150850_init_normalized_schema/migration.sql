/*
  Warnings:

  - You are about to drop the `expense_budgets` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `expense_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `structure_codes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "expense_items" DROP CONSTRAINT "expense_items_budget_id_fkey";

-- DropForeignKey
ALTER TABLE "expense_items" DROP CONSTRAINT "expense_items_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "expense_items" DROP CONSTRAINT "expense_items_structure_id_fkey";

-- DropForeignKey
ALTER TABLE "structure_codes" DROP CONSTRAINT "structure_codes_parent_id_fkey";

-- DropTable
DROP TABLE "expense_budgets";

-- DropTable
DROP TABLE "expense_items";

-- DropTable
DROP TABLE "structure_codes";

-- DropEnum
DROP TYPE "BudgetCategory";

-- DropEnum
DROP TYPE "InputType";

-- DropEnum
DROP TYPE "NodeType";

-- CreateTable
CREATE TABLE "strategic_plans" (
    "id" SERIAL NOT NULL,
    "code" TEXT,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "parent_id" INTEGER,

    CONSTRAINT "strategic_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_activities" (
    "id" SERIAL NOT NULL,
    "code" TEXT,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "plan_id" INTEGER,
    "parent_id" INTEGER,

    CONSTRAINT "project_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fund_masters" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "fund_masters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_categories" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "budget_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense_item_masters" (
    "id" SERIAL NOT NULL,
    "code" TEXT,
    "name" TEXT NOT NULL,
    "category_id" INTEGER NOT NULL,

    CONSTRAINT "expense_item_masters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_fund_allocations" (
    "id" SERIAL NOT NULL,
    "activity_id" INTEGER NOT NULL,
    "fund_id" INTEGER NOT NULL,

    CONSTRAINT "activity_fund_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_records" (
    "id" SERIAL NOT NULL,
    "academic_year" INTEGER NOT NULL,
    "allocation_id" INTEGER NOT NULL,
    "item_id" INTEGER NOT NULL,
    "amount_gov" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "amount_income" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budget_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fund_masters_code_key" ON "fund_masters"("code");

-- CreateIndex
CREATE UNIQUE INDEX "budget_categories_code_key" ON "budget_categories"("code");

-- CreateIndex
CREATE UNIQUE INDEX "activity_fund_allocations_activity_id_fund_id_key" ON "activity_fund_allocations"("activity_id", "fund_id");

-- CreateIndex
CREATE INDEX "budget_records_academic_year_idx" ON "budget_records"("academic_year");

-- AddForeignKey
ALTER TABLE "strategic_plans" ADD CONSTRAINT "strategic_plans_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "strategic_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_activities" ADD CONSTRAINT "project_activities_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "strategic_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_activities" ADD CONSTRAINT "project_activities_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "project_activities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_item_masters" ADD CONSTRAINT "expense_item_masters_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "budget_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_fund_allocations" ADD CONSTRAINT "activity_fund_allocations_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "project_activities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_fund_allocations" ADD CONSTRAINT "activity_fund_allocations_fund_id_fkey" FOREIGN KEY ("fund_id") REFERENCES "fund_masters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_records" ADD CONSTRAINT "budget_records_allocation_id_fkey" FOREIGN KEY ("allocation_id") REFERENCES "activity_fund_allocations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_records" ADD CONSTRAINT "budget_records_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "expense_item_masters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
