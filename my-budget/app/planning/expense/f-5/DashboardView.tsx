'use client'

import React, { useState } from 'react'
import { ChevronRight, ChevronDown, Folder, FileText, Loader2, Layers } from 'lucide-react'
import { getBudgetDetail } from './actions'
import F5TableView from './F5TableView'

type Props = {
  hierarchy: any[]
  currentYear: number
}

export default function DashboardView({ hierarchy, currentYear }: Props) {
  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {hierarchy.map((side) => (
        <div key={side.id} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* วนลูปแผนงาน (Plan) */}
            {side.children.map((plan: any) => (
                <div key={plan.id} className="mb-6">
                     {/* วนลูปงานหลัก (Job Level 3) - นี่คือ "Header Block" ที่คุณต้องการให้เสมอภาคกัน */}
                     {plan.activities.map((job: any) => (
                         <JobCard 
                            key={job.id} 
                            side={side} 
                            plan={plan} 
                            job={job} 
                            currentYear={currentYear} 
                         />
                     ))}
                </div>
            ))}
        </div>
      ))}
    </div>
  )
}

// Card แสดงงานหลัก (Job) และลูกๆ ของมัน
function JobCard({ side, plan, job, currentYear }: { side: any, plan: any, job: any, currentYear: number }) {
    // 1. ส่วน Header รวม (ด้าน > แผน > งาน)
    // ออกแบบให้ดูเหมือน Path หรือ Breadcrumb ที่อยู่ในระดับเดียวกัน
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-4">
            <div className="bg-gray-50 border-b border-gray-100 p-4">
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 font-mono mb-2">
                    <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">
                        {side.code} {side.name}
                    </span>
                    <ChevronRight className="w-3 h-3 text-gray-400" />
                    <span className="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded border border-purple-200">
                        {plan.code} {plan.name}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white p-1.5 rounded-lg border border-gray-200 shadow-sm">
                        <Layers className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-gray-800">{job.code} {job.name}</div>
                        <div className="text-xs text-gray-400">งานระดับปฏิบัติการ (Level 3)</div>
                    </div>
                </div>
            </div>

            {/* ส่วนเนื้อหา: แสดง Activity ลูก (Level 4/5) หรือ Fund Table */}
            <div className="p-0">
                {/* ถ้ามีลูก ให้ Recursive ต่อ */}
                {job.children && job.children.length > 0 ? (
                    <div className="flex flex-col divide-y divide-gray-100">
                        {job.children.map((child: any) => (
                            <ActivityRow key={child.id} node={child} level={4} currentYear={currentYear} />
                        ))}
                    </div>
                ) : (
                    // ถ้าไม่มีลูก (เป็น Leaf Activity เลย) -> แสดงตารางงบประมาณเลย
                    <LeafActivityContent nodeId={job.id} currentYear={currentYear} />
                )}
            </div>
        </div>
    )
}

// แสดงแถวกิจกรรมย่อย (Level 4, 5...)
function ActivityRow({ node, level, currentYear }: { node: any, level: number, currentYear: number }) {
    const hasChildren = node.children && node.children.length > 0
    const [isExpanded, setIsExpanded] = useState(false)

    // Indent แบบสวยงาม
    const paddingLeft = level === 4 ? 'pl-6' : 'pl-12'

    return (
        <div className="flex flex-col bg-white">
            <div 
                onClick={() => setIsExpanded(!isExpanded)}
                className={`flex items-center justify-between py-3 pr-4 border-l-4 border-transparent hover:border-l-blue-500 hover:bg-blue-50/50 cursor-pointer transition-all ${paddingLeft}`}
            >
                <div className="flex items-center gap-3">
                    {hasChildren ? (
                        <Folder className={`text-yellow-400 w-4 h-4`} />
                    ) : (
                        <FileText className={`text-green-500 w-4 h-4`} />
                    )}
                    <span className="font-mono text-xs text-gray-400">{node.code}</span>
                    <span className="text-sm text-gray-700 font-medium">{node.name}</span>
                </div>
                <div className="text-gray-300">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </div>
            </div>

            {/* ส่วนขยาย */}
            {isExpanded && (
                <div className="border-t border-gray-50 bg-gray-50/30">
                    {hasChildren ? (
                        <div className="flex flex-col divide-y divide-gray-50">
                            {node.children.map((child: any) => (
                                <ActivityRow key={child.id} node={child} level={level + 1} currentYear={currentYear} />
                            ))}
                        </div>
                    ) : (
                        // Leaf Node -> โหลดตารางงบประมาณ
                        <div className="pl-4">
                            <LeafActivityContent nodeId={node.id} currentYear={currentYear} />
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

// Component สำหรับโหลดและแสดงตารางงบ (F5TableView) ในจุดที่เป็น Leaf Node
function LeafActivityContent({ nodeId, currentYear }: { nodeId: number, currentYear: number }) {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [loaded, setLoaded] = useState(false)

    const loadData = async () => {
        if (loaded) return
        setLoading(true)
        const res = await getBudgetDetail(nodeId, currentYear)
        if (res.success) {
            setData(res.data)
        }
        setLoading(false)
        setLoaded(true)
    }

    // Auto load เมื่อ Component ถูก render (คือเมื่อ user กด expand parent มาแล้ว)
    // หรือจะทำปุ่ม "โหลดข้อมูล" ก็ได้ แต่ auto load สะดวกกว่า
    React.useEffect(() => {
        loadData()
    }, [])

    if (loading) return <div className="p-4 flex items-center gap-2 text-gray-400 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> กำลังโหลดข้อมูล...</div>

    if (!data) return null

    return (
        <div className="p-2">
            <F5TableView data={data} year={currentYear} />
        </div>
    )
}