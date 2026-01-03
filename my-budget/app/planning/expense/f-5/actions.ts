'use server'

import { prisma } from '@/lib/prisma' 
import { revalidatePath } from 'next/cache'

// --- Type Definitions ---
export type BudgetNode = {
  itemId: number
  code: string
  name: string
  parent_id: number | null
  // ข้อมูล Transaction
  recordId?: number
  amountGov: number
  amountIncome: number
  details?: any
  // ลำดับชั้น
  level: number
  children: BudgetNode[]
}

export type AllocationGroup = {
  allocationId: number
  fundName: string
  fundCode: string
  tree: BudgetNode[]
}

// 1. GET DATA (Filtered Tree Approach)
export async function getBudgetDetail(activityId: number, year: number) {
  try {
    // 1.1 ตรวจสอบ Activity
    const activity = await prisma.projectActivity.findUnique({
      where: { id: activityId }
    })
    if (!activity) return { success: false, error: 'Activity not found' }

    // 1.2 ดึง Allocation
    const allocations = await prisma.activityFundAllocation.findMany({
      where: { activity_id: activityId },
      include: { fund: true },
      orderBy: { fund: { code: 'asc' } }
    })

    if (allocations.length === 0) {
      return { success: true, data: { activity, groupedData: [] } }
    }

    const allocationIds = allocations.map(a => a.id)

    // 1.3 ดึง Records ทั้งหมด
    const records = await prisma.budgetRecord.findMany({
      where: {
        allocation_id: { in: allocationIds },
        academic_year: year
      }
    })

    // 1.4 ดึง Master Data ทั้งหมด (เพื่อใช้ไต่หา Parent)
    const allItems = await prisma.expenseItemMaster.findMany({
      orderBy: { code: 'asc' }
    })
    
    // สร้าง Map เพื่อให้ค้นหา Item Master ได้ไวๆ (ใช้ตอนไต่หาพ่อ)
    const itemMasterMap = new Map(allItems.map(i => [i.id, i]))

    // 1.5 สร้าง Tree ข้อมูล แยกตามกองทุน (พร้อม Logic ตัดกิ่ง)
    const groupedData: AllocationGroup[] = allocations.map(alloc => {
      // กรอง Record เฉพาะของกองทุนนี้
      const allocRecords = records.filter(r => r.allocation_id === alloc.id)
      const recordMap = new Map(allocRecords.map(r => [r.item_id, r]))

      // --- LOGIC ใหม่: หาว่า Item ไหนบ้างที่ "เกี่ยวข้อง" กับกองทุนนี้ ---
      // (Item ที่มี Record + พ่อๆ ของมันทั้งหมด)
      const visibleItemIds = new Set<number>()

      allocRecords.forEach(rec => {
        let currentId: number | null = rec.item_id
        // ไต่ขึ้นไปหาพ่อเรื่อยๆ จนกว่าจะสุดทาง
        while (currentId && itemMasterMap.has(currentId)) {
            visibleItemIds.add(currentId)
            const item = itemMasterMap.get(currentId)
            currentId = item?.parent_id ?? null
        }
      })

      // ถ้าไม่มี Record เลย (เช่น เพิ่งสร้าง) ให้แสดงทั้งหมด หรือ ไม่แสดงเลย?
      // ในกรณีนี้ ถ้าไม่มี record เลย จะแสดงว่างๆ เพื่อให้รู้ว่าไม่มีงบ
      // แต่ถ้าอยากให้แสดงโครงเปล่า ให้ข้าม Logic filter นี้ไป
      // (ในที่นี้ใช้ Filter เพื่อแก้ปัญหา "ข้อมูลซ้ำซ้อน")
      
      const nodes: BudgetNode[] = allItems
        .filter(item => visibleItemIds.has(item.id)) // ✅ กรองเฉพาะตัวที่เกี่ยว
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

      // ประกอบร่าง Tree
      const nodeMap = new Map(nodes.map(n => [n.itemId, n]))
      const roots: BudgetNode[] = []

      nodes.forEach(node => {
        if (node.parent_id && nodeMap.has(node.parent_id)) {
          nodeMap.get(node.parent_id)!.children.push(node)
        } else {
          roots.push(node)
        }
      })

      // คำนวณ Level
      const calculateLevel = (list: BudgetNode[], lvl: number) => {
        list.forEach(n => {
          n.level = lvl
          if (n.children.length > 0) calculateLevel(n.children, lvl + 1)
        })
      }
      calculateLevel(roots, 0)

      return {
        allocationId: alloc.id,
        fundName: alloc.fund.name,
        fundCode: alloc.fund.code,
        tree: roots
      }
    })

    return {
      success: true,
      data: { activity, groupedData }
    }

  } catch (error) {
    console.error('Error fetching budget:', error)
    return { success: false, error: 'Internal Server Error' }
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