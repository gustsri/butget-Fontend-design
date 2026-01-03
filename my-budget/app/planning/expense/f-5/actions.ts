'use server'

import { prisma } from '@/lib/prisma' // ✅ เรียกผ่าน Singleton เพื่อแก้ปัญหา Connection
import { revalidatePath } from 'next/cache'
import { BudgetStatus } from '@prisma/client'

// ============================================================================
// 1. TYPE DEFINITIONS
// ============================================================================

export type BudgetNode = {
  itemId: number
  code: string
  name: string
  parent_id: number | null
  recordId?: number
  amountBudget: number // ✅ เปลี่ยนชื่อจาก amountGov ให้ตรงความหมาย
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

// ============================================================================
// 2. HELPER FUNCTIONS
// ============================================================================

// ฟังก์ชันวนลูปรวมยอดจากลูกขึ้นไปหาพ่อ (Recursive Summation)
function calculateTreeTotals(node: BudgetNode): { budget: number, income: number } {
  // ถ้าไม่มีลูก (Leaf Node) ให้ใช้ค่าของตัวเอง
  if (node.children.length === 0) {
    return { budget: node.amountBudget, income: node.amountIncome }
  }

  // ถ้ามีลูก ให้วนลูปรวมค่าจากลูก
  let sumBudget = 0
  let sumIncome = 0

  for (const child of node.children) {
    const childTotals = calculateTreeTotals(child)
    sumBudget += childTotals.budget
    sumIncome += childTotals.income
  }

  // เอาผลรวมจากลูก มาบวกทบกับค่าของตัวเอง
  node.amountBudget += sumBudget
  node.amountIncome += sumIncome

  return { budget: node.amountBudget, income: node.amountIncome }
}

// อัปเดตยอดรวมทั้งปีลงตาราง ExpenseBudget
async function updateExpenseBudgetTotal(year: number) {
    const aggregator = await prisma.budgetRecord.aggregate({
        where: { academic_year: year },
        _sum: { amount_income: true } // ใช้ยอด Income เป็นยอดหลัก
    })
    const total = Number(aggregator._sum.amount_income || 0)
    
    // อัปเดตยอดรวมถ้ามี Record ของปีนั้นอยู่
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

// --- 3.1 ดึงข้อมูลรายละเอียดงบประมาณ (Tree View) ---
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

    // สร้าง Tree ข้อมูล แยกตามกองทุน
    const groupedData: AllocationGroup[] = allocations.map(alloc => {
      const allocRecords = records.filter(r => r.allocation_id === alloc.id)
      const recordMap = new Map(allocRecords.map(r => [r.item_id, r]))

      // Pruning Tree: กรองเฉพาะ Item ที่เกี่ยวข้อง
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
            // ✅ ใช้ field ใหม่: amount_budget
            amountBudget: rec ? Number(rec.amount_budget) : 0, 
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

      const calculateLevel = (list: BudgetNode[], lvl: number) => {
        list.forEach(n => {
          n.level = lvl
          if (n.children.length > 0) calculateLevel(n.children, lvl + 1)
        })
      }
      calculateLevel(roots, 0)

      // ✅ คำนวณผลรวมจากลูกขึ้นแม่
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

// --- 3.2 บันทึกข้อมูลรายบรรทัด (Save) ---
export type SaveBudgetParams = {
  allocationId: number
  itemId: number
  year: number
  amountBudget: number // ✅ รับค่า Budget Limit (Gov เดิม)
  amountIncome: number // รับค่า Plan Amount
}

export async function saveBudgetRecord(data: SaveBudgetParams) {
  try {
    const [alloc, item] = await Promise.all([
        prisma.activityFundAllocation.findUnique({ where: { id: data.allocationId } }),
        prisma.expenseItemMaster.findUnique({ where: { id: data.itemId } })
    ])

    if (!alloc || !item) throw new Error("Reference data not found")

    // Upsert Record
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
          amount_budget: data.amountBudget, // ✅ บันทึกเข้าช่อง Budget
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

    // อัปเดตยอดรวมทั้งปี
    await updateExpenseBudgetTotal(data.year)

    revalidatePath('/')
    return { success: true }

  } catch (error) {
    console.error('Save Error:', error)
    return { success: false, error: 'Failed to save' }
  }
}

// --- 3.3 ดึงยอดรวมและสถานะของปี (Summary) ---
export async function getExpenseBudgetSummary(year: number) {
  try {
    // 1. หาหรือสร้าง Master ExpenseBudget
    let expenseBudget = await prisma.expenseBudget.findUnique({
      where: { budget_year: year }
    })

    if (!expenseBudget) {
      expenseBudget = await prisma.expenseBudget.create({
        data: { budget_year: year, status: 'draft' }
      })
    }

    // 2. คำนวณยอดรวมจริงจาก Records ทั้งหมด
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

// --- 3.4 อัปเดตสถานะแผนรายจ่าย (บันทึกร่าง / ยื่นเสนอ) ---
export async function updateExpenseBudgetStatus(year: number, status: BudgetStatus) {
  try {
    const budget = await prisma.expenseBudget.findUnique({ where: { budget_year: year } })
    
    if (budget) {
        await prisma.expenseBudget.update({
            where: { id: budget.id },
            data: { 
                status: status,
                updated_at: new Date()
            }
        })
    } else {
        // ถ้ายังไม่มีปีนี้ (แปลกๆ แต่กันไว้) ให้สร้างใหม่
        await prisma.expenseBudget.create({
            data: { budget_year: year, status: status }
        })
    }

    revalidatePath('/')
    return { success: true }

  } catch (error) {
    console.error('Failed to update status:', error)
    return { success: false, error: 'ไม่สามารถบันทึกสถานะได้' }
  }
}

// --- 3.5 จัดการปีงบประมาณ (Years & Clone) ---
export async function getBudgetYears() {
  // ดึงจาก ExpenseBudget เป็นหลัก
  const years = await prisma.expenseBudget.findMany({
    orderBy: { budget_year: 'desc' },
    select: { id: true, budget_year: true }
  })
  return years.map(y => ({ id: y.id, year: y.budget_year }))
}

export async function createBudgetYear(targetYear: number) {
  try {
    // 1. เช็คว่ามีปีนี้หรือยัง
    const existing = await prisma.expenseBudget.findUnique({
      where: { budget_year: targetYear }
    })

    if (existing) {
      return { success: false, error: `ปีงบประมาณ ${targetYear} มีอยู่แล้ว` }
    }

    // 2. สร้าง ExpenseBudget ใหม่
    await prisma.expenseBudget.create({
      data: { budget_year: targetYear, status: 'draft', total_amount: 0 }
    })

    // 3. ✨ CLONE DATA Logic: คัดลอกโครงสร้างจากปีล่าสุด ✨
    const lastYearRecord = await prisma.budgetRecord.findFirst({
      orderBy: { academic_year: 'desc' },
      where: { academic_year: { lt: targetYear } } // หาปีที่น้อยกว่าปีใหม่
    })

    if (lastYearRecord) {
      const sourceYear = lastYearRecord.academic_year
      console.log(`Creating year ${targetYear} by cloning from ${sourceYear}...`)

      const sourceRecords = await prisma.budgetRecord.findMany({
        where: { academic_year: sourceYear }
      })

      if (sourceRecords.length > 0) {
        const newRecordsData = sourceRecords.map(rec => ({
          academic_year: targetYear,
          allocation_id: rec.allocation_id,
          item_id: rec.item_id,
          category_id: rec.category_id,
          fund_id: rec.fund_id,
          amount_budget: 0, // Reset เป็น 0 ให้กรอกใหม่
          amount_income: 0, // Reset เป็น 0 ให้กรอกใหม่
          details: rec.details
        }))

        // Batch Insert
        await prisma.budgetRecord.createMany({
          data: newRecordsData
        })
      }
    }

    revalidatePath('/')
    return { success: true, year: targetYear }

  } catch (error) {
    console.error('Failed to create budget year:', error)
    return { success: false, error: 'Failed to create budget year' }
  }
}