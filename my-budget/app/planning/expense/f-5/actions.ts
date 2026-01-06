'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { BudgetStatus } from '@prisma/client'
import { unstable_noStore as noStore } from 'next/cache'; // ✅ 1. เพิ่ม import นี้
// ============================================================================
// 1. TYPE DEFINITIONS
// ============================================================================

export type BudgetNode = {
  itemId: number
  code: string
  name: string
  parent_id: number | null
  recordId?: number
  amountBudget: number
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

export type SaveBudgetParams = {
  allocationId: number
  itemId: number
  year: number
  amountBudget: number
  amountIncome: number
}

// ============================================================================
// 2. HELPER FUNCTIONS
// ============================================================================

function calculateTreeTotals(node: BudgetNode): { budget: number, income: number } {
  if (node.children.length === 0) {
    return { budget: node.amountBudget, income: node.amountIncome }
  }

  let sumBudget = 0
  let sumIncome = 0

  for (const child of node.children) {
    const childTotals = calculateTreeTotals(child)
    sumBudget += childTotals.budget
    sumIncome += childTotals.income
  }

  node.amountBudget += sumBudget
  node.amountIncome += sumIncome

  return { budget: node.amountBudget, income: node.amountIncome }
}

async function updateExpenseBudgetTotal(year: number) {
    const aggregator = await prisma.budgetRecord.aggregate({
        where: { academic_year: year },
        _sum: { amount_income: true } 
    })
    const total = Number(aggregator._sum.amount_income || 0)
    
    const budget = await prisma.expenseBudget.findUnique({ where: { budget_year: year } })
    if (budget) {
        await prisma.expenseBudget.update({
            where: { id: budget.id },
            data: { total_amount: total }
        })
    }
}

// ============================================================================
// 3. MAIN ACTIONS
// ============================================================================

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
    
    const itemMasterMap = new Map(allItems.map(i => [i.id, i]))

    const groupedData: AllocationGroup[] = allocations.map(alloc => {
      const allocRecords = records.filter(r => r.allocation_id === alloc.id)
      const recordMap = new Map(allocRecords.map(r => [r.item_id, r]))

      // ✅ กรองเฉพาะ Item ที่เกี่ยวข้อง (Pruning Tree) กลับมาใช้อีกครั้ง
      // เพื่อให้แสดงเฉพาะรายการที่มีใน Allocation นั้นๆ จริงๆ
      const visibleItemIds = new Set<number>()
      allocRecords.forEach(rec => {
        let currentId: number | null = rec.item_id
        while (currentId && itemMasterMap.has(currentId)) {
            visibleItemIds.add(currentId)
            const item = itemMasterMap.get(currentId)
            currentId = item?.parent_id ?? null
        }
      })

      // สร้าง Node จาก items ที่ visible เท่านั้น
      const nodes: BudgetNode[] = allItems
        .filter(item => visibleItemIds.has(item.id)) // กรองตรงนี้
        .map(item => {
          const rec = recordMap.get(item.id)
          return {
            itemId: item.id,
            code: item.code,
            name: item.name,
            parent_id: item.parent_id,
            recordId: rec?.id,
            amountBudget: rec ? Number(rec.amount_budget) : 0, 
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

      roots.forEach(root => calculateTreeTotals(root))

      return {
        allocationId: alloc.id,
        fundName: alloc.fund.name,
        fundCode: alloc.fund.code,
        tree: roots
      }
    })

    const budgetSummary = await getExpenseBudgetSummary(year)

    return {
      success: true,
      data: { 
        activity, 
        groupedData,
        status: budgetSummary?.status || 'draft',
        version: budgetSummary?.version || 1
      }
    }

  } catch (error) {
    console.error('Error fetching budget detail:', error)
    return { success: false, error: 'Internal Server Error' }
  }
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
          amount_budget: data.amountBudget,
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
          amount_budget: data.amountBudget,
          amount_income: data.amountIncome
        }
      })
    }

    await updateExpenseBudgetTotal(data.year)

    revalidatePath('/')
    return { success: true }

  } catch (error) {
    console.error('Save Error:', error)
    return { success: false, error: 'Failed to save' }
  }
}

export async function getExpenseBudgetSummary(year: number) {
  try {
    let expenseBudget = await prisma.expenseBudget.findUnique({
      where: { budget_year: year }
    })

    if (!expenseBudget) {
      expenseBudget = await prisma.expenseBudget.create({
        data: { budget_year: year, status: 'draft' }
      })
    }

    const aggregator = await prisma.budgetRecord.aggregate({
      where: { academic_year: year },
      _sum: {
        amount_budget: true,
        amount_income: true
      }
    })

    return {
      status: expenseBudget.status,
      version: expenseBudget.version,
      totalBudget: Number(aggregator._sum.amount_budget || 0),
      totalIncome: Number(aggregator._sum.amount_income || 0)
    }

  } catch (error) {
    console.error('Error fetching summary:', error)
    return null
  }
}

export async function updateExpenseBudgetStatus(year: number, status: BudgetStatus) {
  try {
    await prisma.expenseBudget.update({
      where: { budget_year: year },
      data: { 
        status: status,
        updated_at: new Date()
      }
    })
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Failed to update status:', error)
    return { success: false, error: 'ไม่สามารถบันทึกสถานะได้' }
  }
}

export async function getBudgetYears() {
  noStore(); // 👈 ใส่บรรทัดนี้เพื่อบังคับให้ดึงข้อมูลจาก DB สดๆ ทุกครั้ง ห้าม Cache

  try {
    const years = await prisma.expenseBudget.findMany({
      orderBy: { budget_year: 'desc' },
      select: { 
        id: true, 
        budget_year: true,
        status: true 
      }
    })
    
    // Log ดูว่าดึงได้กี่ปี (ดูใน Terminal)
    console.log(`[getBudgetYears] Found ${years.length} years in DB`);

    return years.map(y => ({ 
        id: y.id, 
        year: y.budget_year 
    }))
  } catch (error) {
    console.error("Failed to fetch budget years:", error);
    return [];
  }
}

// actions.ts (ทับ function createBudgetYear เดิม)

export async function createBudgetYear(targetYear: number) {
  console.log(`🚀 [START] กำลังเริ่มสร้างปีงบประมาณ: ${targetYear}`)

  try {
    // 1. เช็ค/สร้าง Header
    let expenseBudget = await prisma.expenseBudget.findUnique({
      where: { budget_year: targetYear }
    })

    if (!expenseBudget) {
      console.log(`Checking... ไม่พบ Header ปี ${targetYear}, กำลังสร้างใหม่...`)
      expenseBudget = await prisma.expenseBudget.create({
        data: { budget_year: targetYear, status: 'draft', total_amount: 0 }
      })
    } else {
      console.log(`Checking... พบ Header ปี ${targetYear} แล้ว`)
    }

    // 2. เช็ครายการข้างใน
    const existingRecordsCount = await prisma.budgetRecord.count({
      where: { academic_year: targetYear }
    })
    console.log(`Count... พบรายการเดิมจำนวน: ${existingRecordsCount} รายการ`)

    if (existingRecordsCount > 0) {
      console.log(`✅ จบการทำงาน: ปีนี้มีข้อมูลอยู่แล้ว ไม่ต้องทำอะไร`)
      return { success: true, year: targetYear, message: 'Year already has data' }
    }

    // 3. เริ่มกระบวนการสร้างข้อมูล (เพราะรายการเป็น 0)
    console.log(`🔄 เริ่มกระบวนการ Clone/Create ข้อมูล...`)

    // หาปีเก่า
    const lastYearRecord = await prisma.budgetRecord.findFirst({
      orderBy: { academic_year: 'desc' },
      where: { academic_year: { lt: targetYear } }
    })

    if (lastYearRecord) {
      // --- CASE A: มีปีเก่า (Clone) ---
      const sourceYear = lastYearRecord.academic_year
      console.log(`CASE A: เจอปีเก่า (${sourceYear}) -> จะทำการ Clone`)

      const sourceRecords = await prisma.budgetRecord.findMany({
        where: { academic_year: sourceYear }
      })
      console.log(`   - เจอข้อมูลต้นฉบับ ${sourceRecords.length} รายการ`)

      if (sourceRecords.length > 0) {
        const newRecordsData = sourceRecords.map(rec => ({
          academic_year: targetYear,
          allocation_id: rec.allocation_id,
          item_id: rec.item_id,
          category_id: rec.category_id,
          fund_id: rec.fund_id,
          amount_budget: 0,
          amount_income: 0,
          details: rec.details
        }))

        const result = await prisma.budgetRecord.createMany({ data: newRecordsData })
        console.log(`   - 🎉 สร้างข้อมูลสำเร็จ: ${result.count} รายการ`)
      }

    } else {
      // --- CASE B: ไม่มีปีเก่า (Cold Start) ---
      console.log(`CASE B: ไม่เจอปีเก่า -> จะสร้างจาก Master Data`)

      const allAllocations = await prisma.activityFundAllocation.findMany()
      const allItems = await prisma.expenseItemMaster.findMany()

      console.log(`   - Master Allocations: ${allAllocations.length} รายการ`)
      console.log(`   - Master Items: ${allItems.length} รายการ`)

      if (allAllocations.length === 0 || allItems.length === 0) {
          console.error(`❌ ERROR: Master Data ว่างเปล่า! ไม่สามารถสร้างรายการได้`)
          return { success: false, error: 'Master Data (Allocation/Item) is empty' }
      }

      const newRecordsData = []
      for (const alloc of allAllocations) {
          for (const item of allItems) {
              // กรองเฉพาะ Item ที่เป็นลูก (ไม่มีลูกต่อ) หรือสร้างทั้งหมดตามต้องการ
              // ในที่นี้สร้างหมดเพื่อให้แน่ใจว่ามีข้อมูล
              newRecordsData.push({
                  academic_year: targetYear,
                  allocation_id: alloc.id,
                  item_id: item.id,
                  category_id: item.category_id,
                  fund_id: alloc.fund_id,
                  amount_budget: 0,
                  amount_income: 0
              })
          }
      }

      console.log(`   - เตรียมข้อมูลสำหรับสร้าง: ${newRecordsData.length} รายการ`)
      
      if (newRecordsData.length > 0) {
          // createMany อาจจะรับได้จำกัด ถ้าเยอะมากอาจต้องแบ่ง batch แต่ลองยัดหมดก่อน
          const result = await prisma.budgetRecord.createMany({ data: newRecordsData })
          console.log(`   - 🎉 สร้างข้อมูลสำเร็จ (Cold Start): ${result.count} รายการ`)
      }
    }

    revalidatePath('/')
    return { success: true, year: targetYear }

  } catch (error) {
    console.error('❌ CRITICAL ERROR:', error)
    return { success: false, error: 'Failed to create budget year' }
  }
}