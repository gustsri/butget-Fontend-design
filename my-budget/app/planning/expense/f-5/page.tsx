import React from 'react'
import { PrismaClient } from '@prisma/client'
import BudgetForm from './BudgetForm' // เราจะสร้างไฟล์นี้ในข้อ 4

const prisma = new PrismaClient()

export default async function F5Page({
  searchParams,
}: {
  searchParams: { activityId?: string }
}) {
  const activityId = searchParams.activityId 
    ? parseInt(searchParams.activityId) 
    : undefined

  if (!activityId) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <p>กรุณาเลือกกิจกรรมจากเมนูด้านซ้าย</p>
      </div>
    )
  }

  // 1. ดึงข้อมูลกิจกรรม
  const activity = await prisma.projectActivity.findUnique({
    where: { id: activityId }
  })

  // 2. ดึงกองทุนที่กิจกรรมนี้มีสิทธิ์ใช้ (Tabs)
  const allocations = await prisma.activityFundAllocation.findMany({
    where: { activity_id: activityId },
    include: { fund: true },
    orderBy: { fund: { code: 'asc' } }
  })

  // 3. ดึงรายการบัญชีรายจ่ายมาตรฐาน (Rows)
  const expenseItems = await prisma.expenseItemMaster.findMany({
    include: { category: true },
    orderBy: [{ category: { code: 'asc' } }, { code: 'asc' }]
  })

  // 4. ดึงข้อมูลตัวเลขที่เคยบันทึกไว้ (Data)
  const allocationIds = allocations.map(a => a.id)
  const records = await prisma.budgetRecord.findMany({
    where: {
      allocation_id: { in: allocationIds },
      academic_year: 2569
    }
  })

  return (
    <div className="h-full flex flex-col">
      <header className="p-4 border-b bg-white shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-800">{activity?.name}</h1>
          <p className="text-sm text-gray-500 font-mono">Code: {activity?.code}</p>
        </div>
      </header>
      
      {/* ส่งข้อมูลทั้งหมดไปให้ Client Component จัดการต่อ */}
      <div className="flex-1 overflow-hidden">
        <BudgetForm 
          allocations={allocations}
          expenseItems={expenseItems}
          initialRecords={records}
        />
      </div>
    </div>
  )
}