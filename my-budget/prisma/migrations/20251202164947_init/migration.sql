-- CreateTable
CREATE TABLE "revenue_budgets" (
    "revenue_budget_id" SERIAL NOT NULL,
    "budget_year" INTEGER NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "revenue_budgets_pkey" PRIMARY KEY ("revenue_budget_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "revenue_budgets_budget_year_key" ON "revenue_budgets"("budget_year");

-- AddForeignKey
ALTER TABLE "student_fees" ADD CONSTRAINT "student_fees_revenue_budget_id_fkey" FOREIGN KEY ("revenue_budget_id") REFERENCES "revenue_budgets"("revenue_budget_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollment_information" ADD CONSTRAINT "enrollment_information_revenue_budget_id_fkey" FOREIGN KEY ("revenue_budget_id") REFERENCES "revenue_budgets"("revenue_budget_id") ON DELETE RESTRICT ON UPDATE CASCADE;
