/*
  Warnings:

  - You are about to drop the column `code` on the `expense_items` table. All the data in the column will be lost.
  - You are about to drop the column `is_header` on the `expense_items` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `expense_items` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `expense_items` table. All the data in the column will be lost.
  - Added the required column `structure_id` to the `expense_items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "expense_budgets" ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "expense_items" DROP COLUMN "code",
DROP COLUMN "is_header",
DROP COLUMN "level",
DROP COLUMN "name",
ADD COLUMN     "structure_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "structure_codes" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(20),
    "name" VARCHAR(255) NOT NULL,
    "level" INTEGER NOT NULL,
    "is_header" BOOLEAN NOT NULL DEFAULT false,
    "parent_id" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "structure_codes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "structure_codes" ADD CONSTRAINT "structure_codes_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "structure_codes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_items" ADD CONSTRAINT "expense_items_structure_id_fkey" FOREIGN KEY ("structure_id") REFERENCES "structure_codes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
