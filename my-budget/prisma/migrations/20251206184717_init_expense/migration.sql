-- CreateTable
CREATE TABLE "expense_budgets" (
    "id" SERIAL NOT NULL,
    "academic_year" INTEGER NOT NULL,
    "total_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expense_budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense_items" (
    "id" SERIAL NOT NULL,
    "budget_id" INTEGER NOT NULL,
    "code" TEXT,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "is_header" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL,
    "gov_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "income_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expense_items_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "expense_items" ADD CONSTRAINT "expense_items_budget_id_fkey" FOREIGN KEY ("budget_id") REFERENCES "expense_budgets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
