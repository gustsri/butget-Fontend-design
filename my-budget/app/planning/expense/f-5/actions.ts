'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

// Type Definitions
export type BudgetNode = {
  recordId: number
  itemId: number
  code: string
  name: string
  amountGov: number
  amountIncome: number
  details: any
  level: number
  children: BudgetNode[]
}

export type AllocationGroup = {
  allocationId: number
  fundName: string
  fundCode: string
  tree: BudgetNode[]
}

// 1. ดึงข้อมูลรายละเอียดงบ (สำหรับ Table View)
export async function getBudgetDetail(activityId: number, year: number) {
  try {
    const activity = await prisma.projectActivity.findUnique({
      where: { id: activityId }
    })

    // ดึง Allocation (กิจกรรมผูกกับกองทุนไหนบ้าง)
    const allocations = await prisma.activityFundAllocation.findMany({
      where: { activity_id: activityId },
      include: { fund: true },
      orderBy: { fund: { code: 'asc' } }
    })

    const allocationIds = allocations.map(a => a.id)

    // ดึง Records พร้อม Item และ Parent
    const rawRecords = await prisma.budgetRecord.findMany({
      where: {
        allocation_id: { in: allocationIds },
        academic_year: year
      },
      include: {
        item: {
          select: {
            id: true,
            code: true,
            name: true,
            parent_id: true
          }
        }
      },
      orderBy: { item: { code: 'asc' } }
    })

    // จัดกลุ่มข้อมูลตามกองทุน (Fund) และสร้าง Tree
    const groupedData: AllocationGroup[] = allocations.map(alloc => {
      const records = rawRecords.filter(r => r.allocation_id === alloc.id)
      return {
        allocationId: alloc.id,
        fundName: alloc.fund.name,
        fundCode: alloc.fund.code,
        tree: buildTree(records)
      }
    })

    return {
      success: true,
      data: { activity, groupedData }
    }

  } catch (error) {
    console.error(error)
    return { success: false, error: 'Failed to fetch details' }
  }
}

// Helper: สร้าง Tree Structure
function buildTree(records: any[]): BudgetNode[] {
  const map = new Map<number, BudgetNode>()
  const roots: BudgetNode[] = []

  // สร้าง Node
  records.forEach(rec => {
    map.set(rec.item.id, {
      recordId: rec.id,
      itemId: rec.item.id,
      code: rec.item.code,
      name: rec.item.name,
      amountGov: Number(rec.amount_gov),
      amountIncome: Number(rec.amount_income),
      details: rec.details,
      level: 0,
      children: []
    })
  })

  // เชื่อม Parent-Child
  records.forEach(rec => {
    const node = map.get(rec.item.id)!
    const parentId = rec.item.parent_id
    if (parentId && map.has(parentId)) {
      map.get(parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  })

  // คำนวณ Level เพื่อการแสดงผล
  const setLevel = (nodes: BudgetNode[], lvl: number) => {
    nodes.forEach(n => {
      n.level = lvl
      if (n.children.length > 0) setLevel(n.children, lvl + 1)
    })
  }
  setLevel(roots, 0)

  return roots
}

// 2. บันทึกข้อมูล
export type SaveBudgetParams = {
  recordId: number
  amountGov: number
  amountIncome: number
  details?: any
}

export async function saveBudgetRecord(data: SaveBudgetParams) {
  try {
    await prisma.budgetRecord.update({
      where: { id: data.recordId },
      data: {
        amount_gov: data.amountGov,
        amount_income: data.amountIncome,
        details: data.details ?? undefined,
        updated_at: new Date()
      }
    })
    revalidatePath('/budget') // เปลี่ยน path ให้ตรงกับ URL จริงของคุณ
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: 'Failed to save' }
  }
}