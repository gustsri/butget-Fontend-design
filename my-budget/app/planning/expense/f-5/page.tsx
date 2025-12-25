import React from 'react'
import { PrismaClient } from '@prisma/client'
import ExpensePlannerClient from './ExpensePlannerClient' // ✅ Import ชื่อนี้

const prisma = new PrismaClient()

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function F5Page({ searchParams }: PageProps) {
  const resolvedParams = await searchParams
  const currentYear = resolvedParams.year
    ? parseInt(resolvedParams.year as string)
    : 2569

  // --- Dashboard Data: ดึงโครงสร้างทั้งหมดแบบ Tree ---
  const hierarchy = await prisma.strategicPlan.findMany({
    where: { level: 1 },
    include: {
      children: {
        include: {
          activities: {
            where: { level: 3 }, // ดึงเฉพาะ Level 3 (งาน) เป็นตัวตั้งต้น
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

  // ✅ เรียกใช้ Component ให้ตรงกับชื่อที่ Import
  // ตัด detailData ออก เพราะเราใช้ระบบกดแล้วโหลด (Accordion) แทนแล้ว
  return (
    <ExpensePlannerClient
      currentYear={currentYear}
      hierarchy={hierarchy}
    />
  )
}