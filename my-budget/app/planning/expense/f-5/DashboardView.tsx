// app/planning/expense/f-5/DashboardView.tsx
'use client'

import React, { useState } from 'react'
import { ChevronRight, ChevronDown, FolderOpen, Layers, Loader2 } from 'lucide-react'
import { getBudgetDetail } from './actions'
import F5TableView from './F5TableView'

type Props = {
  hierarchy: any[]
  currentYear: number // รับปีเข้ามาด้วยเพื่อส่งไป query
}

export default function DashboardView({ hierarchy, currentYear }: Props) {
  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto">
      {hierarchy.map((side) => (
        <div key={side.id} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
           {/* Level 1: ด้าน */}
           <div className="flex items-center gap-3 border-b-2 border-blue-600 pb-2 mb-4">
              <span className="bg-blue-600 text-white text-sm font-bold font-mono px-2 py-1 rounded">
                {side.code}
              </span>
              <h3 className="text-xl font-bold text-gray-800">{side.name}</h3>
           </div>

           {/* List แผนงาน (เรียงลงมาทีละแถว) */}
           <div className="flex flex-col gap-4">
              {side.children.map((plan: any) => (
                 <PlanSection key={plan.id} plan={plan} currentYear={currentYear} />
              ))}
           </div>
        </div>
      ))}
    </div>
  )
}

function PlanSection({ plan, currentYear }: { plan: any, currentYear: number }) {
  // กรองเฉพาะ Level 3 เพื่อตั้งต้น
  const jobs = plan.activities.filter((act: any) => act.level === 3)

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
       {/* Level 2: แผนงาน Header */}
       <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center gap-3">
          <Layers className="w-5 h-5 text-gray-400" />
          <span className="font-mono text-xs bg-white border border-gray-200 text-gray-600 px-1.5 py-0.5 rounded">
            {plan.code}
          </span>
          <span className="font-bold text-gray-700">{plan.name}</span>
       </div>

       <div className="p-0">
          <div className="flex flex-col divide-y divide-gray-100">
            {jobs.map((job: any) => (
               <RecursiveRow key={job.id} node={job} level={3} currentYear={currentYear} />
            ))}
            {jobs.length === 0 && (
                <div className="p-4 text-gray-400 italic text-sm">ไม่มีรายการย่อย</div>
            )}
          </div>
       </div>
    </div>
  )
}

// Component แสดงแถวรายการ (รองรับการขยาย)
function RecursiveRow({ node, level, currentYear }: { node: any, level: number, currentYear: number }) {
  const hasChildren = node.children && node.children.length > 0
  
  // State สำหรับการ Expand
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [detailData, setDetailData] = useState<any>(null)

  // Function เมื่อกดที่แถว
  const handleToggle = async () => {
    if (hasChildren) {
      // กรณีมีลูก: แค่เปิด/ปิด เพื่อโชว์ลูก
      setIsExpanded(!isExpanded)
    } else {
      // กรณีไม่มีลูก (Leaf): ต้องโหลดตารางงบประมาณ (F5TableView)
      if (!isExpanded && !detailData) {
        setIsLoading(true)
        const res = await getBudgetDetail(node.id, currentYear)
        if (res.success) {
          setDetailData(res.data)
        }
        setIsLoading(false)
      }
      setIsExpanded(!isExpanded)
    }
  }

  // คำนวณ Indent ตาม Level
  const paddingLeft = level === 3 ? 'pl-4' : level === 4 ? 'pl-12' : 'pl-20'
  const bgColor = isExpanded ? 'bg-blue-50/50' : 'bg-white'

  return (
    <div className="flex flex-col">
      {/* 1. ตัวแถว (Row Item) */}
      <div 
        onClick={handleToggle}
        className={`
          flex items-center justify-between py-3 pr-4 cursor-pointer transition-colors border-l-4
          ${paddingLeft} ${bgColor} hover:bg-gray-50
          ${isExpanded ? 'border-l-blue-600' : 'border-l-transparent'}
        `}
      >
        <div className="flex items-center gap-3">
            {/* Icon แสดงประเภท */}
            {hasChildren ? (
                <FolderOpen className={`text-blue-400 ${level === 3 ? 'w-5 h-5' : 'w-4 h-4'}`} />
            ) : (
                <div className={`w-2 h-2 rounded-full ${level === 3 ? 'bg-orange-400' : 'bg-green-400'}`}></div>
            )}

            {/* รหัสและชื่อ */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span className="font-mono text-xs font-medium text-gray-500 bg-gray-100 px-1.5 rounded w-fit">
                    {node.code}
                </span>
                <span className={`text-gray-700 ${level === 3 ? 'font-bold' : 'font-medium text-sm'}`}>
                    {node.name}
                </span>
            </div>
        </div>

        {/* Icon ลูกศรขวาสุด */}
        <div className="text-gray-400">
           {isLoading ? (
             <Loader2 className="w-4 h-4 animate-spin" />
           ) : isExpanded ? (
             <ChevronDown className="w-5 h-5 text-blue-600" />
           ) : (
             <ChevronRight className="w-5 h-5" />
           )}
        </div>
      </div>

      {/* 2. ส่วนที่ขยายออกมา (Content Expanded) */}
      {isExpanded && (
        <div className="border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
           
           {/* CASE A: มีลูก -> วนลูปแสดงลูกต่อ */}
           {hasChildren && (
             <div className="flex flex-col divide-y divide-gray-100">
                {node.children.map((child: any) => (
                   <RecursiveRow key={child.id} node={child} level={level + 1} currentYear={currentYear} />
                ))}
             </div>
           )}

           {/* CASE B: ไม่มีลูก -> แสดงตาราง F5TableView */}
           {!hasChildren && detailData && (
             <div className="p-4 bg-gray-50 border-y border-gray-200 shadow-inner">
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                   {/* เรียกใช้ Table ตัวเดิม */}
                   <F5TableView data={detailData} year={currentYear} />
                </div>
             </div>
           )}
        </div>
      )}
    </div>
  )
}