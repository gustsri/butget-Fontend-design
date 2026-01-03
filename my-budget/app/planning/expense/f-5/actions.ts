'use server'

import { prisma } from '@/lib/prisma' 
import { revalidatePath } from 'next/cache'

// --- Type Definitions ---
export type BudgetNode = {
  itemId: number
  code: string
  name: string
  parent_id: number | null
  recordId?: number
  amountGov: number
  amountIncome: number
  details?: any
  level: number
  children: BudgetNode[]
}

export type AllocationGroup = {
  allocationId: number
  fundName: string
  fundCode: string
  tree: BudgetNode[]
}

// --- Helper: คำนวณยอดรวมจากลูกขึ้นไปหาพ่อ (Recursive Sum) ---
function calculateTreeTotals(node: BudgetNode): { gov: number, income: number } {
  // ถ้าไม่มีลูก (Leaf Node) ให้ใช้ค่าของตัวเองเลย
  if (node.children.length === 0) {
    return { gov: node.amountGov, income: node.amountIncome }
  }

  // ถ้ามีลูก ให้วนลูปรวมค่าจากลูก
  let sumGov = 0
  let sumIncome = 0

  for (const child of node.children) {
    const childTotals = calculateTreeTotals(child)
    sumGov += childTotals.gov
    sumIncome += childTotals.income
  }

  // เอาผลรวมจากลูก มาบวกทบกับค่าของตัวเอง (ปกติพ่อมักจะเป็น 0 แต่เผื่อไว้)
  node.amountGov += sumGov
  node.amountIncome += sumIncome

  return { gov: node.amountGov, income: node.amountIncome }
}

export async function getBudgetDetail(activityId: number, year: number) {
  try {
    const activity = await prisma.projectActivity.findUnique({
      where: { id: activityId }
    })
    if (!activity) return { success: false, error: 'Activity not found' }

    const allocations = await prisma.activityFundAllocation.findMany({
      where: { activity_id: activityId },
      include: { fund: true },
      orderBy: { fund: { code: 'asc' } }
    })

    if (allocations.length === 0) {
      return { success: true, data: { activity, groupedData: [] } }
    }

    const allocationIds = allocations.map(a => a.id)

    const records = await prisma.budgetRecord.findMany({
      where: {
        allocation_id: { in: allocationIds },
        academic_year: year
      }
    })

    const allItems = await prisma.expenseItemMaster.findMany({
      orderBy: { code: 'asc' }
    })
    
    // สร้าง Map เพื่อค้นหา Item Master ได้ไวๆ (ใช้ตอนกรอง)
    const itemMasterMap = new Map(allItems.map(i => [i.id, i]))

    const groupedData: AllocationGroup[] = allocations.map(alloc => {
      const allocRecords = records.filter(r => r.allocation_id === alloc.id)
      const recordMap = new Map(allocRecords.map(r => [r.item_id, r]))

      // --- LOGIC: กรองเฉพาะ Item ที่เกี่ยวข้อง ---
      const visibleItemIds = new Set<number>()
      allocRecords.forEach(rec => {
        let currentId: number | null = rec.item_id
        while (currentId && itemMasterMap.has(currentId)) {
            visibleItemIds.add(currentId)
            const item = itemMasterMap.get(currentId)
            currentId = item?.parent_id ?? null
        }
      })

      const nodes: BudgetNode[] = allItems
        .filter(item => visibleItemIds.has(item.id))
        .map(item => {
          const rec = recordMap.get(item.id)
          return {
            itemId: item.id,
            code: item.code,
            name: item.name,
            parent_id: item.parent_id,
            recordId: rec?.id,
            amountGov: rec ? Number(rec.amount_gov) : 0,
            amountIncome: rec ? Number(rec.amount_income) : 0,
            details: rec?.details,
            level: 0,
            children: []
          }
        })

      const nodeMap = new Map(nodes.map(n => [n.itemId, n]))
      const roots: BudgetNode[] = []

      nodes.forEach(node => {
        if (node.parent_id && nodeMap.has(node.parent_id)) {
          nodeMap.get(node.parent_id)!.children.push(node)
        } else {
          roots.push(node)
        }
      })

      const calculateLevel = (list: BudgetNode[], lvl: number) => {
        list.forEach(n => {
          n.level = lvl
          if (n.children.length > 0) calculateLevel(n.children, lvl + 1)
        })
      }
      calculateLevel(roots, 0)

      // ✅ เรียกใช้ฟังก์ชันคำนวณยอดรวม (Summation) ตรงนี้
      roots.forEach(root => calculateTreeTotals(root))

      return {
        allocationId: alloc.id,
        fundName: alloc.fund.name,
        fundCode: alloc.fund.code,
        tree: roots
      }
    })

    return { success: true, data: { activity, groupedData } }

  } catch (error) {
    console.error('Error:', error)
    return { success: false, error: 'Failed to fetch' }
  }
}

// 2. SAVE ACTION (เหมือนเดิม)
export type SaveBudgetParams = {
  allocationId: number
  itemId: number
  year: number
  amountGov: number
  amountIncome: number
}

export async function saveBudgetRecord(data: SaveBudgetParams) {
  try {
    const [alloc, item] = await Promise.all([
        prisma.activityFundAllocation.findUnique({ where: { id: data.allocationId } }),
        prisma.expenseItemMaster.findUnique({ where: { id: data.itemId } })
    ])

    if (!alloc || !item) throw new Error("Reference data not found")

    const existing = await prisma.budgetRecord.findFirst({
      where: {
        allocation_id: data.allocationId,
        item_id: data.itemId,
        academic_year: data.year
      }
    })

    if (existing) {
      await prisma.budgetRecord.update({
        where: { id: existing.id },
        data: {
          amount_gov: data.amountGov,
          amount_income: data.amountIncome,
          updated_at: new Date()
        }
      })
    } else {
      await prisma.budgetRecord.create({
        data: {
          academic_year: data.year,
          allocation_id: data.allocationId,
          item_id: data.itemId,
          category_id: item.category_id,
          fund_id: alloc.fund_id,
          amount_gov: data.amountGov,
          amount_income: data.amountIncome
        }
      })
    }

    revalidatePath('/planning/expense/f-5')
    return { success: true }

  } catch (error) {
    console.error('Save Error:', error)
    return { success: false, error: 'Failed to save' }
  }
}