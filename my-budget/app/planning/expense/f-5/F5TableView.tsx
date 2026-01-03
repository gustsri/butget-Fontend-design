'use client'

import React, { useState } from 'react'
import { saveBudgetRecord, AllocationGroup, BudgetNode } from './actions'
import { Loader2 } from 'lucide-react'

type Props = {
    data: {
        activity: any
        groupedData: AllocationGroup[]
    }
    year: number
}

// ใช้เก็บสถานะการบันทึกของแต่ละ Record (เพื่อโชว์ Loading เล็กๆ)
type SavingState = Record<string, boolean>

export default function F5TableView({ data, year }: Props) {
    const { groupedData } = data
    const [savingMap, setSavingMap] = useState<SavingState>({})

    // ✅ ฟังก์ชัน Save ทันทีเมื่อ Blur (เปลี่ยนโฟกัสออกจากช่อง Input)
    const handleBlur = async (allocId: number, itemId: number, field: 'budget' | 'income', val: string, currentOtherVal: number) => {
        const numVal = parseFloat(val) || 0
        const key = `${allocId}-${itemId}`

        setSavingMap(prev => ({ ...prev, [key]: true })) // เริ่มหมุนติ้วๆ เฉพาะช่องนี้

        try {
            await saveBudgetRecord({
                allocationId: allocId,
                itemId: itemId,
                year: year,
                // ต้องส่งไปทั้งคู่: ค่าใหม่ (numVal) และค่าเดิมของอีกช่อง (currentOtherVal)
                amountBudget: field === 'budget' ? numVal : currentOtherVal,
                amountIncome: field === 'income' ? numVal : currentOtherVal
            })
        } catch (error) {
            console.error("Save failed", error)
            alert("บันทึกไม่สำเร็จ กรุณาลองใหม่")
        } finally {
            setSavingMap(prev => ({ ...prev, [key]: false })) // หยุดหมุน
        }
    }

    if (!groupedData || groupedData.length === 0) return <div>ไม่พบข้อมูล</div>

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 space-y-8 bg-gray-50/30">
                {groupedData.map((group) => (
                    <div key={group.allocationId} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex items-center gap-3 justify-between">
                            <div className="flex items-center gap-3">
                                <span className="bg-white border border-gray-300 text-gray-600 text-xs font-mono px-2 py-1 rounded shadow-sm">
                                    {group.fundCode}
                                </span>
                                <h3 className="font-bold text-gray-700 text-sm">{group.fundName}</h3>
                            </div>
                        </div>

                        <table className="w-full text-sm">
                            <thead className="bg-white text-gray-500 font-semibold border-b border-gray-100">
                                <tr>
                                    <th className="py-3 px-4 text-left w-[60%]">รายการ</th>
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
                                        savingMap={savingMap}
                                        onSave={handleBlur}
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

// --- Component แถวรายการ ---
const RowItem = ({ node, allocId, savingMap, onSave }: any) => {
    const isParent = node.children && node.children.length > 0
    const key = `${allocId}-${node.itemId}`
    const isSaving = savingMap[key]

    // Local State สำหรับ Input เพื่อให้พิมพ์ลื่นๆ ไม่กระตุก
    const [budgetVal, setBudgetVal] = useState(node.amountBudget || '')
    const [incomeVal, setIncomeVal] = useState(node.amountIncome || '')

    const indentPx = node.level * 24 + 16

    return (
        <>
            <tr className={`group transition-colors ${isParent ? 'bg-gray-100 font-bold text-gray-900' : 'hover:bg-blue-50/30 text-gray-600'}`}>
                {/* Name */}
                <td className="py-2 pr-4 border-r border-dashed border-gray-100 relative">
                    <div className="flex items-center gap-3" style={{ paddingLeft: `${indentPx}px` }}>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isParent ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-400'}`}>
                            {node.code}
                        </span>
                        <span>{node.name}</span>
                        {/* Loading Indicator เล็กๆ หลังชื่อรายการ */}
                        {isSaving && <Loader2 className="w-3 h-3 animate-spin text-green-500 ml-2" />}
                    </div>
                </td>

                {/* Budget Column (Gov) */}
                <td className="py-1 px-2 text-right relative">
                    {!isParent ? (
                        <input
                            type="number"
                            className="w-full text-right p-1.5 bg-transparent border border-transparent rounded hover:border-blue-300 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-mono text-slate-600"
                            placeholder="-"
                            value={budgetVal}
                            onChange={(e) => setBudgetVal(e.target.value)}
                            // ✅ Auto Save เมื่อกด Tab ออก หรือคลิกที่อื่น
                            onBlur={(e) => onSave(allocId, node.itemId, 'budget', e.target.value, parseFloat(incomeVal) || 0)}
                        />
                    ) : (
                        <div className="pr-2 text-blue-700/70">{node.amountBudget > 0 ? node.amountBudget.toLocaleString() : '-'}</div>
                    )}
                </td>

                {/* Income Column */}
                <td className="py-1 px-2 text-right relative">
                    {!isParent ? (
                        <input
                            type="number"
                            className="w-full text-right p-1.5 bg-transparent border border-transparent rounded hover:border-orange-300 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all font-mono font-bold text-orange-700"
                            placeholder="-"
                            value={incomeVal}
                            onChange={(e) => setIncomeVal(e.target.value)}
                            // ✅ Auto Save เมื่อกด Tab ออก หรือคลิกที่อื่น
                            onBlur={(e) => onSave(allocId, node.itemId, 'income', e.target.value, parseFloat(budgetVal) || 0)}
                        />
                    ) : (
                        <div className="pr-2 text-orange-700">{node.amountIncome > 0 ? node.amountIncome.toLocaleString() : '-'}</div>
                    )}
                </td>
            </tr>

            {node.children.map((child: any) => (
                <RowItem key={child.itemId} node={child} allocId={allocId} savingMap={savingMap} onSave={onSave} />
            ))}
        </>
    )
}