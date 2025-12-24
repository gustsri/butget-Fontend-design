'use client'

import React from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { LayoutGrid, ArrowLeft, Calendar, FileText } from 'lucide-react'
import F5TableView from './F5TableView'
import DashboardView from './DashboardView' // สร้างไฟล์นี้ใหม่ในขั้นตอนที่ 3

type Props = {
  currentYear: number
  hierarchy: any[]
  detailData: any | null
}

export default function ExpensePlannerClient({ currentYear, hierarchy, detailData }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('year', e.target.value)
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleBack = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('activityId')
    router.push(`${pathname}?${params.toString()}`)
  }

  // Header เหมือนหน้า Revenue
  return (
    <div className="flex flex-col h-screen bg-gray-50">
       {/* === 1. HEADER === */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-20 h-16">
        <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white shadow-sm">
                <FileText size={20} />
            </div>
            <div>
                <h1 className="text-lg font-bold text-gray-800 leading-tight">IT BUDGET PLANNING SYSTEM</h1>
                <p className="text-xs text-gray-500 font-medium">ระบบสนับสนุนการจัดทำงบประมาณ (F-5)</p>
            </div>
        </div>

        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">ปีงบประมาณ:</span>
                <select 
                    value={currentYear} 
                    onChange={handleYearChange}
                    className="bg-transparent text-sm font-bold text-blue-700 outline-none cursor-pointer"
                >
                    {[2570, 2569, 2568].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
            </div>
        </div>
      </header>

      {/* === 2. CONTENT AREA === */}
      <main className="flex-1 overflow-auto p-6">
        {detailData ? (
          // View A: ตารางกรอกงบ (เมื่อเลือกกิจกรรมแล้ว)
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
             <button 
                onClick={handleBack}
                className="mb-4 flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors bg-white px-3 py-1.5 rounded-md border border-gray-200 shadow-sm"
             >
                <ArrowLeft className="w-4 h-4 mr-1" />
                ย้อนกลับไปหน้าเลือกกิจกรรม
             </button>
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <F5TableView data={detailData} year={currentYear} />
             </div>
          </div>
        ) : (
          // View B: Dashboard เลือกกิจกรรม (Hierarchy)
          <div className="max-w-6xl mx-auto pb-10">
             <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">เลือกรายการเพื่อจัดทำงบประมาณ</h2>
                <p className="text-gray-500">กรุณาเลือก กิจกรรม/โครงการ ที่ต้องการระบุรายละเอียดงบประมาณ</p>
             </div>
             
             {/* Component แสดงผลลำดับชั้น */}
             <DashboardView hierarchy={hierarchy} onSelect={(id) => {
                 const params = new URLSearchParams(searchParams.toString())
                 params.set('activityId', id.toString())
                 router.push(`${pathname}?${params.toString()}`)
             }} />
          </div>
        )}
      </main>
    </div>
  )
}