'use client'

import React, { useState } from 'react'
import { Save, Loader2, RefreshCw } from 'lucide-react'
import { saveBudgetRecord, AllocationGroup, BudgetNode } from './actions'

type Props = {
    data: {
        activity: any
        groupedData: AllocationGroup[]
    }
    year: number
}

// State เก็บค่าที่ User กำลังพิมพ์
// Key Format: "allocationId-itemId"
type EditState = {
    gov: number
    income: number
}

export default function F5TableView({ data, year }: Props) {
    const { activity, groupedData } = data
    
    // เก็บค่าที่ User แก้ไขแต่ยังไม่ได้บันทึก
    const [edits, setEdits] = useState<Record<string, EditState>>({})
    const [isSaving, setIsSaving] = useState(false)

    // ฟังก์ชันเมื่อ User พิมพ์
    const handleChange = (allocId: number, itemId: number, field: 'gov' | 'income', val: string) => {
        const key = `${allocId}-${itemId}`
        const numVal = parseFloat(val) || 0

        setEdits(prev => {
            // ถ้ายังไม่มีใน edits ให้ไปดึงค่าเริ่มต้นจาก DOM หรือ Props (แต่มันยากที่จะดึงจาก props ในจุดนี้)
            // วิธีที่ดีกว่า: ให้ RowItem ส่งค่า current มาให้ หรือเรา merge ใน render
            // ในที่นี้เราจะเก็บเฉพาะ field ที่แก้ ส่วนอีก field ที่ไม่ได้แก้ เดี๋ยวจัดการตอน save
            
            const existing = prev[key] || { gov: undefined, income: undefined } 
            // Note: undefined หมายถึงยังไม่ได้แตะต้อง field นั้น
            
            return {
                ...prev,
                [key]: {
                    ...existing,
                    [field]: numVal
                }
            }
        })
    }

    // ฟังก์ชันบันทึก
    const handleSave = async () => {
        setIsSaving(true)
        try {
            // เราต้องวนลูป edits เพื่อบันทึก
            // แต่ปัญหาคือ: ใน edits อาจมีแค่ gov หรือ income อย่างใดอย่างหนึ่ง (ถ้า user แก้ช่องเดียว)
            // เราต้องรู้ค่า "อีกช่อง" เพื่อส่งไป update ให้ครบถ้วน
            
            // วิธีแก้: เนื่องจากเราไม่มี access โดยตรงไปยังค่าเดิม (original values) ในจุดนี้ง่ายๆ
            // เราจะใช้วิธีส่งเฉพาะค่าที่มีการเปลี่ยนแปลงไป และให้ Server Action ไป merge เอง? 
            // ไม่ได้ เพราะ Prisma update ต้องส่ง data 
            
            // **ทางออก**: ให้ส่งค่าที่ merge แล้วจาก RowItem ขึ้นมาตอน onSave หรือใช้ Ref
            // แต่เพื่อความง่ายและ code ไม่ซับซ้อน: 
            // เราจะใช้วิธี "Find Node" ใน groupedData เพื่อเอาค่าเดิมมา merge
            
            const promises = Object.entries(edits).map(async ([key, val]) => {
                const [allocIdStr, itemIdStr] = key.split('-')
                const allocId = parseInt(allocIdStr)
                const itemId = parseInt(itemIdStr)

                // ค้นหาค่าเดิมจาก groupedData
                let originalGov = 0
                let originalIncome = 0
                
                // (Logic ค้นหาแบบบ้านๆ อาจช้าถ้าข้อมูลเยอะมากๆ แต่สำหรับ F5 ปกติ OK)
                const group = groupedData.find(g => g.allocationId === allocId)
                if (group) {
                    const findNode = (nodes: BudgetNode[]): BudgetNode | undefined => {
                        for (const node of nodes) {
                            if (node.itemId === itemId) return node
                            if (node.children.length > 0) {
                                const found = findNode(node.children)
                                if (found) return found
                            }
                        }
                        return undefined
                    }
                    const node = findNode(group.tree)
                    if (node) {
                        originalGov = node.amountGov
                        originalIncome = node.amountIncome
                    }
                }

                // Merge ค่าใหม่ (ถ้ามี) กับค่าเดิม
                const finalGov = val.gov !== undefined ? val.gov : originalGov
                const finalIncome = val.income !== undefined ? val.income : originalIncome

                await saveBudgetRecord({
                    allocationId: allocId,
                    itemId: itemId,
                    year: year,
                    amountGov: finalGov,
                    amountIncome: finalIncome
                })
            })

            await Promise.all(promises)
            alert('บันทึกข้อมูลเรียบร้อย')
            setEdits({}) // Clear edits เพื่อให้ UI รีเฟรชจาก Server data (ที่ revalidate แล้ว)
            
        } catch (e) {
            console.error(e)
            alert('เกิดข้อผิดพลาดในการบันทึก')
        } finally {
            setIsSaving(false)
        }
    }

    if (!groupedData || groupedData.length === 0) {
        return (
            <div className="p-10 text-center border-2 border-dashed border-gray-300 rounded-xl">
                <p className="text-gray-500">กิจกรรมนี้ยังไม่ได้จัดสรรกองทุน (No Allocations)</p>
                <p className="text-sm text-gray-400 mt-2">กรุณาติดต่อผู้ดูแลระบบเพื่อเพิ่มสิทธิ์การใช้งบประมาณ</p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header / Toolbar */}
            <div className="bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 z-20">
                <div>
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        รายละเอียดงบประมาณ
                        <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            ปี {year}
                        </span>
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                        {activity?.code} {activity?.name}
                    </p>
                </div>
                
                {Object.keys(edits).length > 0 && (
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-all text-sm font-bold animate-in zoom-in-95 duration-200"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        บันทึกการแก้ไข ({Object.keys(edits).length})
                    </button>
                )}
            </div>

            {/* Content Area */}
            <div className="p-6 space-y-10 bg-gray-50/50 min-h-[500px]">
                {groupedData.map((group) => (
                    <div key={group.allocationId} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                        {/* Fund Header */}
                        <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex items-center gap-3">
                            <div className="bg-white border border-gray-300 text-gray-600 text-xs font-mono px-2 py-1 rounded shadow-sm">
                                {group.fundCode}
                            </div>
                            <h3 className="font-bold text-gray-700 text-sm">
                                {group.fundName}
                            </h3>
                        </div>

                        {/* Tree Table */}
                        <table className="w-full text-sm">
                            <thead className="bg-white text-gray-500 font-semibold border-b border-gray-100">
                                <tr>
                                    <th className="py-3 px-4 text-left w-1/2">รายการ</th>
                                    <th className="py-3 px-4 text-right w-1/4">งบแผ่นดิน</th>
                                    <th className="py-3 px-4 text-right w-1/4">งบรายได้</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {group.tree.length > 0 ? (
                                    group.tree.map(node => (
                                        <RowItem
                                            key={node.itemId}
                                            node={node}
                                            allocId={group.allocationId}
                                            edits={edits}
                                            onEdit={handleChange}
                                        />
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="text-center py-8 text-gray-400 italic">
                                            ไม่พบรายการ (Master Data ว่างเปล่า)
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

// --- Recursive Row Component ---
type RowProps = {
    node: BudgetNode
    allocId: number
    edits: Record<string, EditState>
    onEdit: (allocId: number, itemId: number, field: 'gov' | 'income', val: string) => void
}

const RowItem = ({ node, allocId, edits, onEdit }: RowProps) => {
    const isParent = node.children && node.children.length > 0
    const key = `${allocId}-${node.itemId}`
    
    // ดึงค่า: ถ้ามีใน edits เอาจาก edits, ถ้าไม่มีเอาจาก node (DB)
    // Note: edits[key]?.gov อาจเป็น undefined (ถ้า user แก้แต่ income) -> ต้อง fallback ไปหา node
    const currentGov = edits[key]?.gov !== undefined ? edits[key].gov : node.amountGov
    const currentIncome = edits[key]?.income !== undefined ? edits[key].income : node.amountIncome

    // Styling การย่อหน้า
    const indentPx = node.level * 24 + 16

    return (
        <>
            <tr className={`group transition-colors ${isParent ? 'bg-gray-50 font-bold text-gray-800' : 'hover:bg-blue-50/30 text-gray-600'}`}>
                {/* Column 1: ชื่อรายการ (Tree) */}
                <td className="py-2 pr-4 border-r border-dashed border-gray-100 relative">
                    {/* เส้นแนวตั้ง (Tree Line) */}
                    {node.level > 0 && (
                        <div 
                            className="absolute border-l border-gray-300 h-full top-0" 
                            style={{ left: `${indentPx - 14}px` }} 
                        />
                    )}
                    {/* ขีดแนวนอน (Tree Connector) */}
                    {node.level > 0 && (
                        <div 
                            className="absolute border-t border-gray-300 w-3 top-1/2 -mt-px" 
                            style={{ left: `${indentPx - 14}px` }} 
                        />
                    )}
                    
                    <div className="flex items-center gap-3" style={{ paddingLeft: `${indentPx}px` }}>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isParent ? 'bg-gray-200 text-gray-600' : 'bg-gray-100 text-gray-400'}`}>
                            {node.code}
                        </span>
                        <span>{node.name}</span>
                    </div>
                </td>

                {/* Column 2: งบแผ่นดิน */}
                <td className="py-1 px-2 text-right">
                    {!isParent && (
                        <input
                            type="number"
                            className="w-full text-right p-1.5 bg-transparent border border-transparent rounded hover:border-gray-300 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-mono text-sm placeholder-gray-300"
                            value={currentGov || ''} // ถ้า 0 ให้เป็น string ว่าง หรือจะโชว์ 0 ก็ได้
                            onChange={(e) => onEdit(allocId, node.itemId, 'gov', e.target.value)}
                            placeholder="0"
                        />
                    )}
                </td>

                {/* Column 3: งบรายได้ */}
                <td className="py-1 px-2 text-right">
                    {!isParent && (
                        <input
                            type="number"
                            className="w-full text-right p-1.5 bg-transparent border border-transparent rounded hover:border-gray-300 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-mono text-sm placeholder-gray-300"
                            value={currentIncome || ''}
                            onChange={(e) => onEdit(allocId, node.itemId, 'income', e.target.value)}
                            placeholder="0"
                        />
                    )}
                </td>
            </tr>

            {/* Render Children (Recursive) */}
            {node.children.map(child => (
                <RowItem 
                    key={child.itemId} 
                    node={child} 
                    allocId={allocId} 
                    edits={edits} 
                    onEdit={onEdit} 
                />
            ))}
        </>
    )
}