'use client'

import React from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Calendar, Layout } from 'lucide-react'
import DashboardView from './DashboardView'

type Props = {
  currentYear: number
  hierarchy: any[]
}

export default function ExpensePlannerClient({ currentYear, hierarchy }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('year', e.target.value)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      {/* === HEADER === */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm h-16">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg shadow-sm">
                <Layout className="w-5 h-5 text-white" />
            </div>
            <div>
                <h1 className="text-lg font-bold text-gray-800 leading-none">ระบบจัดทำงบประมาณรายจ่าย (F-5)</h1>
                <p className="text-xs text-gray-500 mt-1">วางแผนและจัดสรรงบประมาณประจำปี</p>
            </div>
          </div>

          <div className="flex items-center bg-gray-100 rounded-lg p-1 border border-gray-200">
            <div className="flex items-center px-3 py-1 gap-2 border-r border-gray-300">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">ปีงบประมาณ</span>
            </div>
            <select 
                value={currentYear} 
                onChange={handleYearChange}
                className="bg-transparent text-sm font-bold text-blue-700 outline-none px-3 py-1 cursor-pointer hover:text-blue-800"
            >
                {[2570, 2569, 2568, 2567].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </header>

      {/* === CONTENT === */}
      <main className="flex-1 p-6">
        <DashboardView hierarchy={hierarchy} currentYear={currentYear} />
      </main>
    </div>
  )
}