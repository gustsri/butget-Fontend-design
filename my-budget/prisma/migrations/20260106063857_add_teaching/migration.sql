-- CreateTable
CREATE TABLE "teaching_service_fees" (
    "id" SERIAL NOT NULL,
    "course_code" VARCHAR(20) NOT NULL,
    "course_name" VARCHAR(255) NOT NULL,
    "year_level" VARCHAR(10) NOT NULL,
    "student_regular" INTEGER NOT NULL DEFAULT 0,
    "student_special" INTEGER NOT NULL DEFAULT 0,
    "credits" VARCHAR(20) NOT NULL,
    "fee_regular" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "fee_special" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "fee_sum" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "grand_total" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teaching_service_fees_pkey" PRIMARY KEY ("id")
);
