// app/planning/expense/f-5/page.tsx
import React from 'react'
import { PrismaClient } from '@prisma/client'
import ExpensePlannerClient from './ExpensePlannerClient'

const prisma = new PrismaClient()

// กำหนด Type ของ Props ให้ถูกต้องตาม Next.js เวอร์ชันใหม่
type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function F5Page({ searchParams }: PageProps) {
  // ✅ 1. แก้ไข Error: ต้อง await searchParams ก่อนใช้งาน
  const resolvedParams = await searchParams
  
  const currentYear = resolvedParams.year 
    ? parseInt(resolvedParams.year as string) 
    : 2569 // ค่า Default ปี

  const activityId = resolvedParams.activityId 
    ? parseInt(resolvedParams.activityId as string) 
    : undefined

  // --- ส่วนที่ 1: ดึงโครงสร้างสำหรับหน้า Dashboard (Hierarchy) ---
  // ดึง Level 1 (ด้าน) -> Level 2 (แผนงาน) -> Level 3 (งาน) -> Level 4 (กิจกรรม)
  const hierarchy = await prisma.strategicPlan.findMany({
    where: { level: 1 }, // เริ่มจาก "ด้าน"
    include: {
      children: { // แผนงาน
        include: {
          activities: { // งาน (Level 3)
             where: { level: 3 },
             include: {
               children: { // กิจกรรม (Level 4 - ตัวที่เราจะคลิก)
                 where: { level: 4 },
                 orderBy: { code: 'asc' }
               }
             }
          }
        }
      }
    },
    orderBy: { code: 'asc' }
  })

  // --- ส่วนที่ 2: ดึงข้อมูลสำหรับหน้า Table (เมื่อเลือกกิจกรรมแล้ว) ---
  let detailData = null

  if (activityId) {
    // 2.1 ข้อมูลกิจกรรม
    const activity = await prisma.projectActivity.findUnique({
      where: { id: activityId }
    })

    // 2.2 กองทุนที่ใช้ได้ (Allocations)
    const allocations = await prisma.activityFundAllocation.findMany({
      where: { activity_id: activityId },
      include: { fund: true },
      orderBy: { fund: { code: 'asc' } }
    })

    // 2.3 รายการบัญชีมาตรฐาน (Items)
    const expenseItems = await prisma.expenseItemMaster.findMany({
      include: { category: true },
      orderBy: [{ category: { code: 'asc' } }, { code: 'asc' }]
    })

    // 2.4 ตัวเลขที่เคยบันทึกไว้
    const allocationIds = allocations.map(a => a.id)
    const records = await prisma.budgetRecord.findMany({
      where: {
        allocation_id: { in: allocationIds },
        academic_year: currentYear
      }
    })

    detailData = {
      activity,
      allocations,
      expenseItems,
      records
    }
  }

  // ส่งข้อมูลทั้งหมดไปให้ Client Component จัดการแสดงผล
  return (
    <ExpensePlannerClient 
      currentYear={currentYear}
      hierarchy={hierarchy}
      detailData={detailData}
    />
  )
}