'use client'

import React, { useState, useEffect } from 'react'
import { saveBudgetRecord } from './actions'
import { Loader2 } from 'lucide-react'

// --- Type Definitions ---
type BudgetNode = {
    itemId: number
    code: string
    name: string
    level: number
    amountBudget: number
    amountIncome: number
    recordId?: number
    children: BudgetNode[]
}

type AllocationGroup = {
    allocationId: number
    fundName: string
    tree: BudgetNode[]
}

type Props = {
    data: { groupedData: AllocationGroup[] }
    year: number
    onBudgetUpdate?: (budget: number, income: number) => void
}

export default function F5TableView({ data, year, onBudgetUpdate }: Props) {
    const [groups, setGroups] = useState<AllocationGroup[]>(data.groupedData || [])
    const [savingMap, setSavingMap] = useState<Record<string, boolean>>({})

    // ✅ Helper: คำนวณยอดรวม (คำนวณสดจากข้อมูลล่าสุด)
    const calculateTotal = (currentGroups: AllocationGroup[]) => {
        let totalBudget = 0
        let totalIncome = 0

        const traverse = (nodes: BudgetNode[]) => {
            nodes.forEach(node => {
                if (node.children.length === 0) {
                    // แปลงเป็นตัวเลขให้ชัวร์ก่อนบวก
                    totalBudget += Number(node.amountBudget) || 0
                    totalIncome += Number(node.amountIncome) || 0
                } else {
                    traverse(node.children)
                }
            })
        }

        currentGroups.forEach(g => traverse(g.tree))
        return { totalBudget, totalIncome }
    }

    // ✅ Effect: ส่งค่าเริ่มต้นกลับไปทันทีที่โหลด
    useEffect(() => {
        if (onBudgetUpdate) {
            const { totalBudget, totalIncome } = calculateTotal(groups)
            console.log("🟢 [F5Table] Initial Total:", totalBudget, totalIncome)
            onBudgetUpdate(totalBudget, totalIncome)
        } else {
            console.warn("⚠️ [F5Table] Warning: onBudgetUpdate prop is missing!")
        }
    }, []) // Run once on mount

    // ✅ Effect: Sync ข้อมูลถ้ามีการเปลี่ยนจาก Server (เช่น เปลี่ยนปี)
    useEffect(() => {
        setGroups(data.groupedData || [])
        // คำนวณใหม่ด้วยเมื่อเปลี่ยนข้อมูล
        if(onBudgetUpdate && data.groupedData) {
             const { totalBudget, totalIncome } = calculateTotal(data.groupedData)
             onBudgetUpdate(totalBudget, totalIncome)
        }
    }, [data])


    // 1. ฟังก์ชันเปลี่ยนค่าหน้าจอทันที (Real-time UI)
    const handleLocalChange = (
        allocationId: number, 
        nodeId: number, 
        field: 'amountBudget' | 'amountIncome', 
        value: string
    ) => {
        // แปลงค่าว่างเป็น 0
        const numValue = value === '' ? 0 : parseFloat(value)

        // Clone & Update
        const newGroups = JSON.parse(JSON.stringify(groups))

        // Recursive Update
        const updateNode = (nodes: BudgetNode[]) => {
            for (let node of nodes) {
                if (node.itemId === nodeId) {
                    node[field] = numValue
                    return true
                }
                if (node.children.length > 0 && updateNode(node.children)) return true
            }
            return false
        }

        const targetGroup = newGroups.find((g: AllocationGroup) => g.allocationId === allocationId)
        if (targetGroup) updateNode(targetGroup.tree)

        // 1.1 อัปเดตตารางทันที
        setGroups(newGroups)

        // 1.2 คำนวณยอดรวมใหม่ทันที แล้วส่งไป Header
        if (onBudgetUpdate) {
            const { totalBudget, totalIncome } = calculateTotal(newGroups)
            // console.log("⚡ [F5Table] Real-time Update:", totalBudget, totalIncome) // ดู Log นี้
            onBudgetUpdate(totalBudget, totalIncome)
        }
    }

    // 2. ฟังก์ชันบันทึกเมื่อ "พิมพ์เสร็จแล้ว" (onBlur)
    const handleSave = async (
        allocationId: number,
        nodeId: number,
        field: 'amountBudget' | 'amountIncome',
        value: number
    ) => {
        const key = `${allocationId}-${nodeId}-${field}`
        setSavingMap(prev => ({ ...prev, [key]: true }))

        try {
            // หาค่าปัจจุบันของอีก field เพื่อส่งไปคู่กัน
            let currentBudget = 0
            let currentIncome = 0
            
            const findCurrentValues = (gs: AllocationGroup[]) => {
                for (const g of gs) {
                    if (g.allocationId === allocationId) {
                        const traverse = (nodes: BudgetNode[]) => {
                            for (const n of nodes) {
                                if (n.itemId === nodeId) {
                                    currentBudget = n.amountBudget
                                    currentIncome = n.amountIncome
                                    return
                                }
                                traverse(n.children)
                            }
                        }
                        traverse(g.tree)
                    }
                }
            }
            findCurrentValues(groups) // หาจาก state ปัจจุบัน

            console.log(`💾 [F5Table] Saving ID: ${nodeId} -> B:${currentBudget}, I:${currentIncome}`)

            await saveBudgetRecord({
                allocationId,
                itemId: nodeId,
                year,
                amountBudget: field === 'amountBudget' ? value : currentBudget,
                amountIncome: field === 'amountIncome' ? value : currentIncome
            })

        } catch (error) {
            console.error('Save failed', error)
        } finally {
            setSavingMap(prev => {
                const newState = { ...prev }
                delete newState[key]
                return newState
            })
        }
    }

    return (
        <div className="space-y-8">
            {groups.map((group) => (
                <div key={group.allocationId} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="font-bold text-gray-700">{group.fundName}</h3>
                        <span className="text-xs text-gray-400 bg-white px-2 py-1 rounded border">ID: {group.allocationId}</span>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50/50 text-gray-500 border-b border-gray-100">
                                    <th className="px-6 py-3 text-left font-medium w-1/2">รายการ (Expense Items)</th>
                                    <th className="px-4 py-3 text-right font-medium w-1/4">งบประมาณแผ่นดิน</th>
                                    <th className="px-4 py-3 text-right font-medium w-1/4">เงินรายได้</th>
                                </tr>
                            </thead>
                            <tbody>
                                <RecursiveRows 
                                    nodes={group.tree} 
                                    allocationId={group.allocationId} 
                                    handleLocalChange={handleLocalChange}
                                    handleSave={handleSave}
                                    savingMap={savingMap}
                                />
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
    )
}

function RecursiveRows({ nodes, allocationId, handleLocalChange, handleSave, savingMap }: any) {
    return (
        <>
            {nodes.map((node: BudgetNode) => {
                const isLeaf = node.children.length === 0
                const paddingLeft = node.level * 24 + 24 

                return (
                    <React.Fragment key={node.itemId}>
                        <tr className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${!isLeaf ? 'bg-gray-50/30 font-semibold text-gray-700' : ''}`}>
                            <td className="py-2 pr-4 relative" style={{ paddingLeft: `${paddingLeft}px` }}>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs text-gray-400 opacity-70">{node.code}</span>
                                    <span>{node.name}</span>
                                </div>
                            </td>
                            
                            {/* Input: งบประมาณ */}
                            <td className="px-4 py-2">
                                {isLeaf ? (
                                    <div className="relative">
                                        <input 
                                            type="number"
                                            value={node.amountBudget === 0 ? '' : node.amountBudget} 
                                            onChange={(e) => handleLocalChange(allocationId, node.itemId, 'amountBudget', e.target.value)}
                                            onBlur={(e) => handleSave(allocationId, node.itemId, 'amountBudget', parseFloat(e.target.value || '0'))}
                                            className="w-full text-right border border-gray-200 rounded px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            placeholder="0"
                                        />
                                        {savingMap[`${allocationId}-${node.itemId}-amountBudget`] && (
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                                <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-right text-gray-400 font-mono pr-3 opacity-50">
                                        -
                                    </div>
                                )}
                            </td>

                            {/* Input: เงินรายได้ */}
                            <td className="px-4 py-2">
                                {isLeaf ? (
                                    <div className="relative">
                                        <input 
                                            type="number"
                                            value={node.amountIncome === 0 ? '' : node.amountIncome}
                                            onChange={(e) => handleLocalChange(allocationId, node.itemId, 'amountIncome', e.target.value)}
                                            onBlur={(e) => handleSave(allocationId, node.itemId, 'amountIncome', parseFloat(e.target.value || '0'))}
                                            className="w-full text-right border border-gray-200 rounded px-3 py-1.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            placeholder="0"
                                        />
                                        {savingMap[`${allocationId}-${node.itemId}-amountIncome`] && (
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                                <Loader2 className="w-3 h-3 animate-spin text-orange-500" />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-right text-gray-400 font-mono pr-3 opacity-50">
                                        -
                                    </div>
                                )}
                            </td>
                        </tr>
                        
                        {node.children.length > 0 && (
                            <RecursiveRows 
                                nodes={node.children} 
                                allocationId={allocationId} 
                                handleLocalChange={handleLocalChange} 
                                handleSave={handleSave}
                                savingMap={savingMap}
                            />
                        )}
                    </React.Fragment>
                )
            })}
        </>
    )
}