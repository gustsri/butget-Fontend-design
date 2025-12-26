-- AlterTable
ALTER TABLE "budget_records" ADD COLUMN     "details" JSONB;

-- AlterTable
ALTER TABLE "expense_item_masters" ADD COLUMN     "form_type" TEXT NOT NULL DEFAULT 'simple';
