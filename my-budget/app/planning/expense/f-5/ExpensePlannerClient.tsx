// app/planning/expense/f-5/ExpensePlannerClient.tsx
'use client'

import React from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { 
  ArrowLeft, 
  Calendar, 
  ChevronRight, 
  LayoutGrid, 
  FileText 
} from 'lucide-react'
import F5TableView from './F5TableView' // เราจะสร้างไฟล์นี้ในข้อ 3

type Props = {
  currentYear: number
  hierarchy: any[]
  detailData: any | null
}

export default function ExpensePlannerClient({ currentYear, hierarchy, detailData }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // ฟังก์ชันเปลี่ยนปี
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('year', e.target.value)
    router.push(`${pathname}?${params.toString()}`)
  }

  // ฟังก์ชันเลือกกิจกรรม (เข้าสู่หน้า Detail)
  const handleSelectActivity = (actId: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('activityId', actId.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  // ฟังก์ชันกลับหน้าหลัก
  const handleBack = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('activityId')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50">
      {/* === HEADER (เหมือนหน้า Revenue) === */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <LayoutGrid size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">IT BUDGET PLANNING SYSTEM</h1>
            <p className="text-xs text-gray-500 font-medium">ระบบประมาณการรายจ่าย (F-5) ประจำปีงบประมาณ</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
            {/* Year Selector */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5 border border-gray-200">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600 font-medium">ปีงบประมาณ:</span>
                <select 
                    value={currentYear}
                    onChange={handleYearChange}
                    className="bg-transparent text-sm font-bold text-blue-700 outline-none cursor-pointer"
                >
                    {[2570, 2569, 2568].map(y => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>
            </div>
        </div>
      </header>

      {/* === CONTENT === */}
      <div className="flex-1 overflow-auto p-6">
        
        {/* CASE A: แสดงตาราง (Detail) เมื่อเลือกกิจกรรมแล้ว */}
        {detailData ? (
          <div className="max-w-7xl mx-auto">
            <button 
              onClick={handleBack}
              className="mb-4 flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              กลับไปหน้าเลือกกิจกรรม
            </button>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
               {/* ส่งปีไปด้วยเพื่อใช้ในการ save */}
               <F5TableView 
                 data={detailData} 
                 year={currentYear} 
               />
            </div>
          </div>

        ) : (
          /* CASE B: แสดง Dashboard (Hierarchy Cards) */
          <div className="max-w-5xl mx-auto space-y-8 pb-10">
            {hierarchy.map((side: any) => (
              <div key={side.id} className="space-y-4">
                {/* Level 1: ด้าน */}
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-l-4 border-blue-600 pl-3">
                  <span className="font-mono text-blue-600">{side.code}</span>
                  {side.name}
                </h2>

                <div className="grid gap-6 pl-4">
                  {side.children.map((plan: any) => (
                    <div key={plan.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                      {/* Level 2: แผนงาน */}
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-700 text-sm">
                           <span className="font-mono mr-2 bg-gray-200 px-1 rounded">{plan.code}</span>
                           {plan.name}
                        </h3>
                      </div>

                      <div className="p-4 space-y-4">
                        {plan.activities.map((job: any) => (
                          <div key={job.id}>
                             {/* Level 3: งาน */}
                             <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center">
                                <span className="mr-2">{job.code}</span>
                                {job.name}
                             </h4>

                             {/* Level 4: กิจกรรม (Cards) */}
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {job.children.map((act: any) => (
                                  <button
                                    key={act.id}
                                    onClick={() => handleSelectActivity(act.id)}
                                    className="group flex flex-col items-start p-3 rounded-lg border border-gray-100 hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-md transition-all text-left bg-white"
                                  >
                                    <div className="flex items-center justify-between w-full mb-2">
                                        <span className="font-mono text-xs font-medium bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded group-hover:bg-blue-100 group-hover:text-blue-700">
                                            {act.code}
                                        </span>
                                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-800 line-clamp-2">
                                        {act.name}
                                    </span>
                                  </button>
                                ))}
                                {job.children.length === 0 && (
                                    <div className="text-xs text-gray-400 italic p-2">ไม่มีกิจกรรมย่อย</div>
                                )}
                             </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}