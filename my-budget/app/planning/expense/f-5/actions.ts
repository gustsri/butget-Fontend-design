'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

export type SaveBudgetParams = {
  allocationId: number
  itemId: number
  amountGov: number
  amountIncome: number
  year: number
  details?: any
}

export async function getBudgetDetail(activityId: number, year: number) {
  try {
    const activity = await prisma.projectActivity.findUnique({
      where: { id: activityId }
    })

    const allocations = await prisma.activityFundAllocation.findMany({
      where: { activity_id: activityId },
      include: { fund: true },
      orderBy: { fund: { code: 'asc' } }
    })

    const expenseItems = await prisma.expenseItemMaster.findMany({
      include: { category: true },
      orderBy: [{ category: { code: 'asc' } }, { code: 'asc' }]
    })

    const allocationIds = allocations.map(a => a.id)
    
    // ✅ จุดสำคัญ: ต้องประกาศตัวแปร rawRecords ตรงนี้
    const rawRecords = await prisma.budgetRecord.findMany({
      where: {
        allocation_id: { in: allocationIds },
        academic_year: year
      }
    })
    
    // แปลง Decimal เป็น Number
    const records = rawRecords.map(rec => ({
      ...rec,
      amount_gov: rec.amount_gov.toNumber(),
      amount_income: rec.amount_income.toNumber(),
      details: rec.details // ส่ง details กลับไปด้วย
    }))

    return {
      success: true,
      data: { activity, allocations, expenseItems, records }
    }
  } catch (error) {
    console.error(error)
    return { success: false, error: 'Failed to fetch details' }
  }
}

export async function saveBudgetRecord(data: SaveBudgetParams) {
  try {
    const existingRecord = await prisma.budgetRecord.findFirst({
      where: {
        allocation_id: data.allocationId,
        item_id: data.itemId,
        academic_year: data.year
      }
    })

    if (existingRecord) {
      await prisma.budgetRecord.update({
        where: { id: existingRecord.id },
        data: {
          amount_gov: data.amountGov,
          amount_income: data.amountIncome,
          details: data.details ?? undefined
        }
      })
    } else {
      await prisma.budgetRecord.create({
        data: {
          academic_year: data.year,
          allocation_id: data.allocationId,
          item_id: data.itemId,
          amount_gov: data.amountGov,
          amount_income: data.amountIncome,
          details: data.details ?? undefined
        }
      })
    }

    revalidatePath('/planning/expense/f-5')
    return { success: true }

  } catch (error) {
    console.error('Error saving budget:', error)
    return { success: false, error: 'Failed to save data' }
  }
}