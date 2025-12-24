'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

// Type สำหรับข้อมูลที่จะบันทึก
export type SaveBudgetParams = {
  allocationId: number
  itemId: number
  amountGov: number
  amountIncome: number
}

export async function saveBudgetRecord(data: SaveBudgetParams) {
  const CURRENT_YEAR = 2569 // ในระบบจริงควรดึงจาก Config หรือ Session

  try {
    // ใช้ upsert: ถ้ามีให้แก้ ถ้าไม่มีให้สร้าง
    // เนื่องจากเราไม่ได้ทำ Unique Key แบบ 3 ตัว (allocation+item+year) ไว้ใน Schema
    // เราจะใช้ logic findFirst แล้วตัดสินใจแทน

    const existingRecord = await prisma.budgetRecord.findFirst({
      where: {
        allocation_id: data.allocationId,
        item_id: data.itemId,
        academic_year: CURRENT_YEAR
      }
    })

    if (existingRecord) {
      await prisma.budgetRecord.update({
        where: { id: existingRecord.id },
        data: {
          amount_gov: data.amountGov,
          amount_income: data.amountIncome
        }
      })
    } else {
      await prisma.budgetRecord.create({
        data: {
          academic_year: CURRENT_YEAR,
          allocation_id: data.allocationId,
          item_id: data.itemId,
          amount_gov: data.amountGov,
          amount_income: data.amountIncome
        }
      })
    }

    // Revalidate เพื่อให้หน้าจอ update ข้อมูลล่าสุด (ถ้าจำเป็น)
    revalidatePath('/planning/expense/f-5')
    return { success: true }
    
  } catch (error) {
    console.error('Error saving budget:', error)
    return { success: false, error: 'Failed to save data' }
  }
}