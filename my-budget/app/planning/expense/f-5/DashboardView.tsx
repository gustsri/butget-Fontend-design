// app/planning/expense/f-5/DashboardView.tsx
'use client'

import React from 'react'
import { ChevronRight, FolderOpen, Layers } from 'lucide-react'

export default function DashboardView({ hierarchy, onSelect }: { hierarchy: any[], onSelect: (id: number) => void }) {
    return (
        <div className="space-y-12 pb-20">
            {hierarchy.map((side) => (
                <div key={side.id} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {/* Level 1: ด้าน (Header ใหญ่) */}
                    <div className="flex items-center gap-3 border-b-2 border-blue-600 pb-3 mb-6">
                        <span className="bg-blue-600 text-white text-base font-bold font-mono px-3 py-1 rounded">
                            {side.code}
                        </span>
                        <h3 className="text-2xl font-bold text-gray-800">{side.name}</h3>
                    </div>

                    {/* Grid แสดงแผนงาน */}
                    <div className="grid grid-cols-1 gap-8">
                        {side.children.map((plan: any) => (
                            <PlanSection key={plan.id} plan={plan} onSelect={onSelect} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}

function PlanSection({ plan, onSelect }: { plan: any, onSelect: (id: number) => void }) {
    const jobs = plan.activities.filter((act: any) => act.level === 3)
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Level 2: แผนงาน (Header รอง) */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <Layers className="w-5 h-5 text-gray-400" />
                <span className="font-mono text-sm bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded shadow-sm">
                    {plan.code}
                </span>
                <span className="font-bold text-gray-700 text-lg">{plan.name}</span>
            </div>

            <div className="p-6">
                <div className="grid gap-6">
                    {plan.activities.map((job: any) => (
                        <RecursiveNode key={job.id} node={job} onSelect={onSelect} level={3} />
                    ))}
                    {plan.activities.length === 0 && (
                        <div className="text-gray-400 italic">ไม่มีรายการย่อย</div>
                    )}
                </div>
            </div>
        </div>
    )
}

// ตัวจัดการ Node แบบ Recursive (งาน -> กิจกรรมรอง -> กิจกรรมย่อย)
function RecursiveNode({ node, onSelect, level }: { node: any, onSelect: (id: number) => void, level: number }) {
    const hasChildren = node.children && node.children.length > 0

    // CASE A: ถ้ามีลูก -> แสดงเป็นหัวข้อ (Group Header) แล้ววนลูปแสดงลูกต่อ
    if (hasChildren) {
        return (
            <div className="space-y-3">
                {/* หัวข้อ Group */}
                <div className="flex items-center gap-2">
                    <FolderOpen className={`text-blue-300 ${level === 3 ? 'w-5 h-5' : 'w-4 h-4'}`} />
                    <span className="font-mono text-xs text-gray-400">{node.code}</span>
                    <span className={`font-bold text-gray-700 ${level === 3 ? 'text-base' : 'text-sm'}`}>
                        {node.name}
                    </span>
                </div>

                {/* Container ลูก */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pl-4 border-l-2 border-gray-100 ml-2">
                    {node.children.map((child: any) => (
                        <RecursiveNode key={child.id} node={child} onSelect={onSelect} level={level + 1} />
                    ))}
                </div>
            </div>
        )
    }

    // CASE B: ถ้าไม่มีลูก (Leaf Node) -> แสดงเป็น Card กดได้
    return (
        <button
            onClick={() => onSelect(node.id)}
            className="group flex flex-col items-start p-4 rounded-xl border border-gray-200 bg-white hover:border-blue-500 hover:shadow-md hover:bg-blue-50/10 transition-all text-left w-full relative"
        >
            <div className="flex items-center justify-between w-full mb-2">
                <span className="font-mono text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    {node.code}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-600 transition-transform group-hover:translate-x-1" />
            </div>

            <span className="text-sm font-medium text-gray-800 group-hover:text-blue-700 line-clamp-2">
                {node.name}
            </span>
        </button>
    )
}