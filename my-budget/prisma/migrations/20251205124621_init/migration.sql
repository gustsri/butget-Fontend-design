-- CreateEnum
CREATE TYPE "DegreeLevel" AS ENUM ('bachelor', 'bachelor_master', 'master', 'phd');

-- CreateEnum
CREATE TYPE "ProgramType" AS ENUM ('normal', 'international');

-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('plan', 'actual');

-- CreateEnum
CREATE TYPE "BudgetStatus" AS ENUM ('draft', 'submitted', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "revenue_budgets" (
    "revenue_budget_id" SERIAL NOT NULL,
    "budget_year" INTEGER NOT NULL,
    "total_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "net_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "status" "BudgetStatus" NOT NULL DEFAULT 'draft',
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "revenue_budgets_pkey" PRIMARY KEY ("revenue_budget_id")
);

-- CreateTable
CREATE TABLE "revenue_sections" (
    "section_id" SERIAL NOT NULL,
    "revenue_budget_id" INTEGER NOT NULL,
    "section_name" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,

    CONSTRAINT "revenue_sections_pkey" PRIMARY KEY ("section_id")
);

-- CreateTable
CREATE TABLE "revenue_items" (
    "item_id" SERIAL NOT NULL,
    "section_id" INTEGER NOT NULL,
    "item_name" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "sort_order" INTEGER NOT NULL,
    "is_deduction" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "revenue_items_pkey" PRIMARY KEY ("item_id")
);

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

-- CreateTable
CREATE TABLE "enrollment_information" (
    "enrollment_id" SERIAL NOT NULL,
    "academic_program_id" INTEGER NOT NULL,
    "revenue_budget_id" INTEGER NOT NULL,
    "academic_year" INTEGER NOT NULL,
    "semester" INTEGER NOT NULL,
    "plan_type" "PlanType" NOT NULL,
    "year1_count" INTEGER NOT NULL DEFAULT 0,
    "year2_count" INTEGER NOT NULL DEFAULT 0,
    "year3_count" INTEGER NOT NULL DEFAULT 0,
    "year4_count" INTEGER NOT NULL DEFAULT 0,
    "year5_count" INTEGER NOT NULL DEFAULT 0,
    "year6_count" INTEGER NOT NULL DEFAULT 0,
    "graduates" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enrollment_information_pkey" PRIMARY KEY ("enrollment_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "revenue_budgets_budget_year_key" ON "revenue_budgets"("budget_year");

-- CreateIndex
CREATE UNIQUE INDEX "enrollment_information_academic_program_id_revenue_budget_i_key" ON "enrollment_information"("academic_program_id", "revenue_budget_id", "plan_type", "academic_year", "semester");

-- AddForeignKey
ALTER TABLE "revenue_sections" ADD CONSTRAINT "revenue_sections_revenue_budget_id_fkey" FOREIGN KEY ("revenue_budget_id") REFERENCES "revenue_budgets"("revenue_budget_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenue_items" ADD CONSTRAINT "revenue_items_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "revenue_sections"("section_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_fees" ADD CONSTRAINT "student_fees_academic_program_id_fkey" FOREIGN KEY ("academic_program_id") REFERENCES "academic_programs"("academic_program_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_fees" ADD CONSTRAINT "student_fees_revenue_budget_id_fkey" FOREIGN KEY ("revenue_budget_id") REFERENCES "revenue_budgets"("revenue_budget_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollment_information" ADD CONSTRAINT "enrollment_information_academic_program_id_fkey" FOREIGN KEY ("academic_program_id") REFERENCES "academic_programs"("academic_program_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollment_information" ADD CONSTRAINT "enrollment_information_revenue_budget_id_fkey" FOREIGN KEY ("revenue_budget_id") REFERENCES "revenue_budgets"("revenue_budget_id") ON DELETE RESTRICT ON UPDATE CASCADE;
