import React from 'react'
import { PrismaClient } from '@prisma/client'
import ExpensePlannerClient from './ExpensePlannerClient'

const prisma = new PrismaClient()

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function F5Page({ searchParams }: PageProps) {
  const resolvedParams = await searchParams

  const currentYear = resolvedParams.year
    ? parseInt(resolvedParams.year as string)
    : 2569

  const activityId = resolvedParams.activityId
    ? parseInt(resolvedParams.activityId as string)
    : undefined

  // --- 1. Dashboard Data: ดึงโครงสร้างทั้งหมดแบบ Tree ---
  // ดึงตั้งแต่ "ด้าน" -> "แผน" -> "งาน" -> "กิจกรรมรอง" -> "กิจกรรมย่อย"
  const hierarchy = await prisma.strategicPlan.findMany({
    where: { level: 1 },
    include: {
      children: {
        include: {
          activities: {
            // ✅ จุดสำคัญ: ดึงเฉพาะ Level 3 (งาน) เท่านั้น
            where: { level: 3 },
            orderBy: { code: 'asc' },
            include: {
              children: { // Level 4
                orderBy: { code: 'asc' },
                include: {
                  children: { // Level 5
                    orderBy: { code: 'asc' }
                  }
                }
              }
            }
          }
        },
        orderBy: { code: 'asc' }
      }
    },
    orderBy: { code: 'asc' }
  })

  // --- 2. Detail Data: กรณีเลือกกิจกรรมแล้ว ---
  let detailData = null
  if (activityId) {
    const activity = await prisma.projectActivity.findUnique({
      where: { id: activityId }
    })

    // ดึงกองทุน + งบ + ยอดเงิน (เหมือนเดิม)
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
    const records = await prisma.budgetRecord.findMany({
      where: {
        allocation_id: { in: allocationIds },
        academic_year: currentYear
      }
    })

    detailData = { activity, allocations, expenseItems, records }
  }

  return (
    <ExpensePlannerClient
      currentYear={currentYear}
      hierarchy={hierarchy}
      detailData={detailData}
    />
  )
}