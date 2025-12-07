/*
  Warnings:

  - A unique constraint covering the columns `[budget_id,structure_id]` on the table `expense_items` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "expense_items_budget_id_structure_id_key" ON "expense_items"("budget_id", "structure_id");
