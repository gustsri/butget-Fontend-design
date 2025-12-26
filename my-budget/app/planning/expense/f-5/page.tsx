import React from 'react'
import { PrismaClient } from '@prisma/client'
import ExpensePlannerClient from './ExpensePlannerClient' // Import ชื่อนี้

const prisma = new PrismaClient()

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function F5Page({ searchParams }: PageProps) {
  const resolvedParams = await searchParams

  const currentYear = resolvedParams.year
    ? parseInt(resolvedParams.year as string)
    : 2569

  // --- 1. Dashboard Data ---
  const hierarchy = await prisma.strategicPlan.findMany({
    where: { level: 1 },
    include: {
      children: {
        include: {
          activities: {
            where: { level: 3 },
            orderBy: { code: 'asc' },
            include: {
              children: {
                orderBy: { code: 'asc' },
                include: {
                  children: {
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

  // ✅ เรียกใช้ ExpensePlannerClient (ไม่ต้องมี Wrapper ต่อท้าย)
  return (
    <ExpensePlannerClient
      currentYear={currentYear}
      hierarchy={hierarchy}
    />
  )
}