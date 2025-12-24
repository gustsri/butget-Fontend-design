import React from 'react'
import { PrismaClient } from '@prisma/client'
import Link from 'next/link'

const prisma = new PrismaClient()

export default async function F5Layout({
  children,
}: {
  children: React.ReactNode
}) {
  // ดึงกิจกรรมระดับล่าง (Level 4 หรือ 5 ตามต้องการ) มาทำเมนู
  const activities = await prisma.projectActivity.findMany({
    where: { 
      level: 4, // กิจกรรมรอง
      is_active: true 
    },
    orderBy: { code: 'asc' }
  })

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* --- Sidebar ด้านซ้าย --- */}
      <aside className="w-72 bg-gray-50 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h2 className="font-bold text-gray-700">กิจกรรม (Activities)</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {activities.map((act) => (
            <Link
              key={act.id}
              href={`/planning/expense/f-5?activityId=${act.id}`}
              className="block px-3 py-2 text-sm text-gray-600 hover:bg-white hover:shadow-sm hover:text-blue-600 rounded-md transition-all"
            >
              <span className="font-mono bg-gray-200 px-1.5 rounded mr-2 text-xs text-gray-500">
                {act.code}
              </span>
              {act.name}
            </Link>
          ))}
        </div>
      </aside>

      {/* --- Content ด้านขวา --- */}
      <main className="flex-1 flex flex-col bg-white overflow-hidden">
        {children}
      </main>
    </div>
  )
}