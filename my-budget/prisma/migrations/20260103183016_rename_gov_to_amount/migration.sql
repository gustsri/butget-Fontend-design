/*
  Warnings:

  - You are about to drop the column `amount_gov` on the `budget_records` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "budget_records" DROP COLUMN "amount_gov",
ADD COLUMN     "amount_budget" DECIMAL(15,2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "expense_budgets" (
    "id" SERIAL NOT NULL,
    "budget_year" INTEGER NOT NULL,
    "total_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "status" "BudgetStatus" NOT NULL DEFAULT 'draft',
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expense_budgets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "expense_budgets_budget_year_key" ON "expense_budgets"("budget_year");
