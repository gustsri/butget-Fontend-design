'use client'

import React, { useState } from 'react'
import { Save, Loader2 } from 'lucide-react'
import { saveBudgetRecord, AllocationGroup, BudgetNode } from './actions'

type Props = {
    data: {
        activity: any
        groupedData: AllocationGroup[]
    }
    year: number
}

type EditState = {
    gov: number
    income: number
}

export default function F5TableView({ data, year }: Props) {
    const { groupedData } = data
    const [edits, setEdits] = useState<Record<string, EditState>>({})
    
    // ... (logic handleChange เดิม) ...
    const handleChange = (allocId: number, itemId: number, field: 'gov' | 'income', val: string) => {
        const key = `${allocId}-${itemId}`
        const numVal = parseFloat(val) || 0
        setEdits(prev => {
            const existing = prev[key] || { gov: undefined, income: undefined } 
            return {
                ...prev,
                [key]: { ...existing, [field]: numVal }
            }
        })
    }

    if (!groupedData || groupedData.length === 0) return <div>ไม่พบข้อมูล</div>

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 space-y-8 bg-gray-50/30">
                {groupedData.map((group) => (
                    <div key={group.allocationId} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex items-center gap-3">
                            <span className="bg-white border border-gray-300 text-gray-600 text-xs font-mono px-2 py-1 rounded shadow-sm">
                                {group.fundCode}
                            </span>
                            <h3 className="font-bold text-gray-700 text-sm">{group.fundName}</h3>
                        </div>

                        <table className="w-full text-sm">
                            <thead className="bg-white text-gray-500 font-semibold border-b border-gray-100">
                                <tr>
                                    <th className="py-3 px-4 text-left w-[60%]">รายการ</th>
                                    {/* ✅ เหลือแค่ 2 คอลัมน์ตามต้องการ */}
                                    <th className="py-3 px-4 text-right w-[20%] text-blue-600">งบแผ่นดิน (กำกับ)</th>
                                    <th className="py-3 px-4 text-right w-[20%] text-orange-600">เงินรายได้ (แผน)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {group.tree.map(node => (
                                    <RowItem
                                        key={node.itemId}
                                        node={node}
                                        allocId={group.allocationId}
                                        edits={edits}
                                        onEdit={handleChange}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>
        </div>
    )
}

// --- Recursive Row Component ---
const RowItem = ({ node, allocId, edits, onEdit }: any) => {
    const isParent = node.children && node.children.length > 0
    const key = `${allocId}-${node.itemId}`
    
    // หาค่าปัจจุบัน
    const currentGov = edits[key]?.gov !== undefined ? edits[key].gov : node.amountGov
    const currentIncome = edits[key]?.income !== undefined ? edits[key].income : node.amountIncome
    
    const indentPx = node.level * 24 + 16

    return (
        <>
            <tr className={`group transition-colors ${isParent ? 'bg-gray-100 font-bold text-gray-900' : 'hover:bg-blue-50/30 text-gray-600'}`}>
                {/* Name Column */}
                <td className="py-2 pr-4 border-r border-dashed border-gray-100 relative">
                    <div className="flex items-center gap-3" style={{ paddingLeft: `${indentPx}px` }}>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isParent ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-400'}`}>
                            {node.code}
                        </span>
                        <span>{node.name}</span>
                    </div>
                </td>

                {/* Gov Column (Budget Limit) */}
                <td className="py-1 px-2 text-right">
                    {!isParent ? (
                        <input
                            type="number"
                            className="w-full text-right p-1.5 bg-transparent border border-transparent rounded hover:border-blue-300 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-mono text-slate-600"
                            value={currentGov || ''}
                            onChange={(e) => onEdit(allocId, node.itemId, 'gov', e.target.value)}
                            placeholder="-"
                        />
                    ) : (
                        <div className="pr-2 text-blue-700/70">{currentGov > 0 ? currentGov.toLocaleString() : '-'}</div>
                    )}
                </td>

                {/* Income Column (Actual Plan) */}
                <td className="py-1 px-2 text-right">
                    {!isParent ? (
                        <input
                            type="number"
                            className="w-full text-right p-1.5 bg-transparent border border-transparent rounded hover:border-orange-300 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all font-mono font-bold text-orange-700"
                            value={currentIncome || ''}
                            onChange={(e) => onEdit(allocId, node.itemId, 'income', e.target.value)}
                            placeholder="-"
                        />
                    ) : (
                        <div className="pr-2 text-orange-700">{currentIncome > 0 ? currentIncome.toLocaleString() : '-'}</div>
                    )}
                </td>
            </tr>

            {/* Children */}
            {node.children.map((child: any) => (
                <RowItem key={child.itemId} node={child} allocId={allocId} edits={edits} onEdit={onEdit} />
            ))}
        </>
    )
}