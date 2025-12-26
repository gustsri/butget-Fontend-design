/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `expense_item_masters` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `category_id` to the `budget_records` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fund_id` to the `budget_records` table without a default value. This is not possible if the table is not empty.
  - Made the column `code` on table `expense_item_masters` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "budget_records" ADD COLUMN     "category_id" INTEGER NOT NULL,
ADD COLUMN     "fund_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "expense_item_masters" ADD COLUMN     "parent_id" INTEGER,
ALTER COLUMN "code" SET NOT NULL;

-- CreateIndex
CREATE INDEX "budget_records_category_id_idx" ON "budget_records"("category_id");

-- CreateIndex
CREATE INDEX "budget_records_fund_id_idx" ON "budget_records"("fund_id");

-- CreateIndex
CREATE UNIQUE INDEX "expense_item_masters_code_key" ON "expense_item_masters"("code");

-- AddForeignKey
ALTER TABLE "expense_item_masters" ADD CONSTRAINT "expense_item_masters_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "expense_item_masters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_records" ADD CONSTRAINT "budget_records_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "budget_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_records" ADD CONSTRAINT "budget_records_fund_id_fkey" FOREIGN KEY ("fund_id") REFERENCES "fund_masters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
