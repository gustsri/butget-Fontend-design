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

export default function F5TableView({ data, year }: Props) {
    const { groupedData } = data
    const [edits, setEdits] = useState<Record<number, { gov: number, income: number }>>({})
    const [isSaving, setIsSaving] = useState(false)

    const handleChange = (recordId: number, field: 'gov' | 'income', val: string) => {
        setEdits(prev => ({
            ...prev,
            [recordId]: {
                ...prev[recordId],
                [field]: parseFloat(val) || 0
            }
        }))
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const promises = Object.entries(edits).map(async ([recId, val]) => {
                // ถ้าค่าไหนไม่ได้แก้ ให้ข้ามไป (หรือจะส่งไปเฉพาะค่าที่แก้ก็ได้)
                // ในที่นี้ต้องระวังเรื่องค่า default ที่ไม่ได้อยู่ใน edits
                // แต่เพื่อความง่าย เราส่งค่าที่มีใน edits ไป update
                await saveBudgetRecord({
                    recordId: parseInt(recId),
                    amountGov: val.gov,
                    amountIncome: val.income
                })
            })
            await Promise.all(promises)
            alert('บันทึกเรียบร้อย')
            setEdits({})
        } catch (e) {
            console.error(e)
            alert('เกิดข้อผิดพลาด')
        } finally {
            setIsSaving(false)
        }
    }

    // ถ้าไม่มีข้อมูลเลย
    if (groupedData.length === 0) {
        return <div className="p-4 text-gray-400 italic text-sm">ไม่พบการจัดสรรกองทุนสำหรับกิจกรรมนี้</div>
    }

    return (
        <div className="bg-white rounded-b-xl border-x border-b border-gray-200 shadow-sm animate-in slide-in-from-top-2">
            
            {/* Toolbar บันทึก */}
            {Object.keys(edits).length > 0 && (
                 <div className="bg-blue-50 px-4 py-2 border-b border-blue-100 flex justify-end sticky top-0 z-10">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-bold shadow hover:bg-blue-700 transition-all"
                    >
                        {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                        บันทึกการแก้ไข ({Object.keys(edits).length})
                    </button>
                 </div>
            )}

            <div className="p-4 space-y-6">
                {groupedData.map((group) => (
                    <div key={group.allocationId} className="border rounded-lg overflow-hidden">
                        {/* Header กองทุน */}
                        <div className="bg-gray-100 px-4 py-2 border-b flex justify-between items-center">
                            <span className="font-bold text-gray-700 text-sm">
                                💰 {group.fundName} ({group.fundCode})
                            </span>
                        </div>

                        {/* ตาราง */}
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-500 font-medium">
                                <tr>
                                    <th className="py-2 px-4 text-left w-1/2">รายการ</th>
                                    <th className="py-2 px-4 text-right">งบแผ่นดิน</th>
                                    <th className="py-2 px-4 text-right">งบรายได้</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {group.tree.length > 0 ? (
                                    group.tree.map((node) => (
                                        <RowItem 
                                            key={node.recordId} 
                                            node={node} 
                                            edits={edits} 
                                            onChange={handleChange} 
                                        />
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="text-center py-4 text-gray-400 text-xs">
                                            - ไม่มีรายการ -
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>
        </div>
    )
}

const RowItem = ({ node, edits, onChange }: { node: BudgetNode, edits: any, onChange: any }) => {
    const isParent = node.children && node.children.length > 0
    
    // Merge ค่าเดิมกับค่าที่กำลังแก้
    const currentGov = edits[node.recordId]?.gov !== undefined ? edits[node.recordId].gov : node.amountGov
    const currentIncome = edits[node.recordId]?.income !== undefined ? edits[node.recordId].income : node.amountIncome

    return (
        <>
            <tr className={`group hover:bg-blue-50/30 transition-colors ${isParent ? 'bg-gray-50/50 font-semibold text-gray-800' : 'text-gray-600'}`}>
                <td style={{ paddingLeft: `${node.level * 20 + 16}px` }} className="py-1.5 border-r border-dashed border-gray-100 relative">
                    {/* เส้นนำสายตา (Guide Line) */}
                    {node.level > 0 && (
                        <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200" style={{ left: `${(node.level * 20)}px` }}></div>
                    )}
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400 font-mono bg-gray-100 px-1 rounded">
                            {node.code}
                        </span>
                        <span className={isParent ? 'text-gray-800' : 'text-gray-600'}>{node.name}</span>
                    </div>
                </td>
                <td className="py-1 px-2 text-right">
                    {!isParent && (
                        <input
                            type="number"
                            value={currentGov}
                            onChange={(e) => onChange(node.recordId, 'gov', e.target.value)}
                            className="w-full text-right p-1 bg-transparent border-b border-transparent hover:border-blue-300 focus:border-blue-500 focus:bg-white outline-none transition-all text-sm font-mono"
                        />
                    )}
                </td>
                <td className="py-1 px-2 text-right">
                    {!isParent && (
                        <input
                            type="number"
                            value={currentIncome}
                            onChange={(e) => onChange(node.recordId, 'income', e.target.value)}
                            className="w-full text-right p-1 bg-transparent border-b border-transparent hover:border-blue-300 focus:border-blue-500 focus:bg-white outline-none transition-all text-sm font-mono"
                        />
                    )}
                </td>
            </tr>
            {node.children.map(child => (
                <RowItem key={child.recordId} node={child} edits={edits} onChange={onChange} />
            ))}
        </>
    )
}