-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('plan', 'actual');

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
CREATE UNIQUE INDEX "enrollment_information_academic_program_id_revenue_budget_i_key" ON "enrollment_information"("academic_program_id", "revenue_budget_id", "plan_type", "academic_year", "semester");

-- AddForeignKey
ALTER TABLE "enrollment_information" ADD CONSTRAINT "enrollment_information_academic_program_id_fkey" FOREIGN KEY ("academic_program_id") REFERENCES "academic_programs"("academic_program_id") ON DELETE RESTRICT ON UPDATE CASCADE;
