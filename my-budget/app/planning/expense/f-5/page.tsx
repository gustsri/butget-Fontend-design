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

  // ดึงข้อมูลลำดับชั้นทั้งหมด (Side -> Plan -> Activity Level 3 -> Children...)
  const hierarchy = await prisma.strategicPlan.findMany({
    where: { level: 1 }, // Level 1 = ด้าน
    include: {
      children: { // Level 2 = แผนงาน
        include: {
          activities: { // Level 3 = งานหลัก
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

  // หน้า Page หลักจะทำหน้าที่ส่ง Data ไปให้ Client Component จัดการ UI ทั้งหมด
  return (
    <ExpensePlannerClient
      currentYear={currentYear}
      hierarchy={hierarchy}
    />
  )
}