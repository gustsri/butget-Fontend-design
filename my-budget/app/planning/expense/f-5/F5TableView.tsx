'use client'

import React, { useState, useEffect } from 'react'
import { Save, Loader2, Calculator } from 'lucide-react'
import { saveBudgetRecord } from './actions'

type Props = {
    data: {
        activity: any
        allocations: any[]
        expenseItems: any[]
        records: any[]
    }
    year: number
}

type RecordState = {
    gov: number
    income: number
    details: any
}

export default function F5TableView({ data, year }: Props) {
    const { activity, allocations, expenseItems, records } = data
    const [formData, setFormData] = useState<Record<string, RecordState | null>>(null)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        const map: Record<string, RecordState> = {}
        records.forEach((rec: any) => {
            const key = `${rec.allocation_id}-${rec.item_id}`
            map[key] = {
                gov: Number(rec.amount_gov),
                income: Number(rec.amount_income),
                details: rec.details || {}
            }
        })
        setFormData(map)
    }, [records])

    const handleAmountChange = (allocId: number, itemId: number, field: 'gov' | 'income', val: string) => {
        const key = `${allocId}-${itemId}`
        const current = formData[key]
        if (!current) return

        setFormData({
            ...formData,
            [key]: { ...current, [field]: parseFloat(val) || 0 }
        })
    }

    const handleDetailChange = (allocId: number, itemId: number, field: string, value: string) => {
        const key = `${allocId}-${itemId}`
        const current = formData[key]
        if (!current) return

        const newDetails = { ...current.details, [field]: value }

        let newGov = current.gov
        if (field === 'rate' || field === 'months') {
             const rate = parseFloat(newDetails.rate) || 0
             const months = parseFloat(newDetails.months) || 0
             if (rate > 0 && months > 0) {
                 newGov = rate * months
             }
        }

        setFormData({
            ...formData,
            [key]: {
                ...current,
                details: newDetails,
                gov: newGov
            }
        })
    }

    const renderSpecialSlot = (allocId: number, item: any, currentVal: any) => {
        if (item.form_type !== 'salary') {
            return <span className="text-gray-300 text-xs">-</span>
        }

        const details = currentVal?.details || {}

        return (
            <div className="flex flex-col items-end gap-1">
                <div className="flex items-center bg-blue-50 border border-blue-200 rounded px-2 py-1 shadow-sm">
                    <input 
                        className="w-20 text-right bg-transparent outline-none text-xs border-b border-gray-300 focus:border-blue-500 font-mono text-blue-700"
                        placeholder="อัตรา"
                        value={details.rate || ''}
                        onChange={(e) => handleDetailChange(allocId, item.id, 'rate', e.target.value)}
                    />
                    <span className="text-gray-400 text-xs mx-1">x</span>
                    <input 
                        className="w-10 text-center bg-transparent outline-none text-xs border-b border-gray-300 focus:border-blue-500 font-mono text-blue-700"
                        placeholder="เดือน"
                        value={details.months || ''}
                        onChange={(e) => handleDetailChange(allocId, item.id, 'months', e.target.value)}
                    />
                </div>
                <div className="text-[10px] text-gray-400 pr-1 flex items-center gap-1">
                    <Calculator className="w-3 h-3" />
                    คำนวณอัตโนมัติ
                </div>
            </div>
        )
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const promises: Promise<any>[] = []
            allocations.forEach(alloc => {
                expenseItems.forEach(item => {
                    const key = `${alloc.id}-${item.id}`
                    const val = formData[key]
                    if (val) {
                        promises.push(saveBudgetRecord({
                            allocationId: alloc.id,
                            itemId: item.id,
                            amountGov: val.gov,
                            amountIncome: val.income,
                            year: year,
                            details: val.details
                        }))
                    }
                })
            })
            await Promise.all(promises)
            alert('บันทึกข้อมูลเรียบร้อยแล้ว')
        } catch (error) {
            console.error(error)
            alert('เกิดข้อผิดพลาดในการบันทึก')
        } finally {
            setIsSaving(false)
        }
    }

    if (!formData) return <div className="p-8 text-center text-gray-500 animate-pulse">กำลังโหลดข้อมูล...</div>

    return (
        <div className="flex flex-col h-full bg-white shadow-sm rounded-lg border border-gray-200">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white sticky top-0 z-20 rounded-t-lg">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-mono font-bold border border-blue-200">
                            {activity.code}
                        </span>
                        <span className="text-gray-500 text-sm">รายละเอียดงบประมาณ</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">{activity.name}</h2>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 disabled:bg-blue-300 transition-all font-medium text-sm"
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto pb-4">
                <table className="w-full min-w-[1000px] text-sm border-collapse">
                    <thead className="bg-gray-50 text-gray-600 font-medium sticky top-[73px] z-10 shadow-sm border-b border-gray-200">
                        <tr>
                            <th className="p-3 text-left w-[40%] pl-6">รายการ</th>
                            <th className="p-3 text-right w-[20%]">รายละเอียดการคำนวณ</th>
                            <th className="p-3 text-right w-[20%]">เงินงบประมาณ</th>
                            <th className="p-3 text-right w-[20%] pr-6">เงินรายได้</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allocations.map((alloc) => (
                            <React.Fragment key={alloc.id}>
                                <tr className="bg-gray-100/50 border-y border-gray-200">
                                    <td colSpan={4} className="py-2 px-6">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-gray-800 text-white px-1.5 py-0.5 rounded text-xs font-mono">
                                                {alloc.fund.code}
                                            </span>
                                            <span className="font-bold text-gray-800 text-base">
                                                {alloc.fund.name}
                                            </span>
                                        </div>
                                    </td>
                                </tr>

                                {expenseItems.map((item, index) => {
                                    const key = `${alloc.id}-${item.id}`
                                    const val = formData[key]
                                    if (!val) return null

                                    const prevCategory = expenseItems[index - 1]?.category.code
                                    const isNewCategory = item.category.code !== prevCategory

                                    return (
                                        <React.Fragment key={item.id}>
                                            {isNewCategory && (
                                                <tr>
                                                    <td colSpan={4} className="py-2 px-6 pt-4 font-bold text-blue-800 bg-white border-b border-gray-100">
                                                        {item.category.code} {item.category.name}
                                                    </td>
                                                </tr>
                                            )}

                                            <tr className="border-b border-gray-50 hover:bg-blue-50/10 transition-colors group">
                                                {/* 1. ชื่อรายการ */}
                                                <td className="py-3 px-6 pl-10 align-top">
                                                    <div className="flex gap-3">
                                                        <span className="text-gray-400 font-mono text-xs w-20 pt-1">
                                                            {item.code}
                                                        </span>
                                                        <div className="flex flex-col">
                                                            <span className="text-gray-700 font-medium leading-relaxed">
                                                                {item.name}
                                                            </span>
                                                            {item.form_type === 'salary' && (
                                                                <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded w-fit">
                                                                    <Calculator className="w-3 h-3" />
                                                                    สูตรคำนวณ
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* 2. ช่องคำนวณพิเศษ (อยู่แยก column ไม่ซ้อน) */}
                                                <td className="py-2 px-4 text-right align-top">
                                                    {renderSpecialSlot(alloc.id, item, val)}
                                                </td>

                                                {/* 3. เงินงบประมาณ */}
                                                <td className="py-2 px-4 text-right align-top">
                                                    <input
                                                        type="number"
                                                        value={val.gov || ''}
                                                        readOnly={item.form_type === 'salary'}
                                                        onChange={(e) => handleAmountChange(alloc.id, item.id, 'gov', e.target.value)}
                                                        className={`w-full text-right p-2 border rounded transition-all outline-none focus:ring-2 focus:ring-blue-500
                                                            ${item.form_type === 'salary' 
                                                                ? 'bg-gray-100 text-gray-600 font-bold border-gray-200 cursor-not-allowed' 
                                                                : 'border-gray-300 bg-white'
                                                            }
                                                        `}
                                                        placeholder="0.00"
                                                    />
                                                </td>

                                                {/* 4. เงินรายได้ */}
                                                <td className="py-2 px-4 text-right pr-6 align-top">
                                                    <input
                                                        type="number"
                                                        value={val.income || ''}
                                                        onChange={(e) => handleAmountChange(alloc.id, item.id, 'income', e.target.value)}
                                                        className="w-full text-right p-2 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                                        placeholder="0.00"
                                                    />
                                                </td>
                                            </tr>
                                        </React.Fragment>
                                    )
                                })}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}