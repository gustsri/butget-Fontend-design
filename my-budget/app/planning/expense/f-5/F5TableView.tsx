// app/planning/expense/f-5/F5TableView.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { Save, Loader2 } from 'lucide-react'
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

export default function F5TableView({ data, year }: Props) {
  const { activity, allocations, expenseItems, records } = data

  // State เก็บค่าเงิน (Key format: "allocationId-itemId")
  const [formData, setFormData] = useState<Record<string, { gov: number, income: number }>>({})
  const [isSaving, setIsSaving] = useState(false)

  // Initialize Data
  useEffect(() => {
    const map: Record<string, { gov: number, income: number }> = {}
    records.forEach((rec: any) => {
      const key = `${rec.allocation_id}-${rec.item_id}`
      map[key] = { gov: Number(rec.amount_gov), income: Number(rec.amount_income) }
    })
    setFormData(map)
  }, [records])

  // Input Handler
  const handleInputChange = (allocId: number, itemId: number, field: 'gov' | 'income', val: string) => {
    const key = `${allocId}-${itemId}`
    const current = formData[key] || { gov: 0, income: 0 }
    setFormData({
      ...formData,
      [key]: { ...current, [field]: parseFloat(val) || 0 }
    })
  }

  // Save Handler
  const handleSave = async () => {
    setIsSaving(true)
    try {
        const promises: Promise<any>[] = []
        
        // Loop ทุก Allocation
        allocations.forEach(alloc => {
            // Loop ทุก Item
            expenseItems.forEach(item => {
                const key = `${alloc.id}-${item.id}`
                const val = formData[key]
                
                // ถ้ามีค่า หรือ เคยมีค่า (เพื่อ update เป็น 0)
                if (val) {
                     promises.push(saveBudgetRecord({
                         allocationId: alloc.id,
                         itemId: item.id,
                         amountGov: val.gov,
                         amountIncome: val.income,
                         year: year // ส่งปีไปด้วย
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

  return (
    <div className="flex flex-col h-full">
      {/* Table Header Info */}
      <div className="p-6 border-b border-gray-200 flex justify-between items-start bg-white">
        <div>
           <div className="flex items-center gap-2 mb-1">
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-mono font-bold">
                {activity.code}
              </span>
              <span className="text-gray-500 text-sm">กิจกรรม (Activity)</span>
           </div>
           <h2 className="text-2xl font-bold text-gray-800">{activity.name}</h2>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow-sm hover:bg-blue-700 disabled:bg-blue-300 transition-all font-medium"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
        </button>
      </div>

      {/* Table Content - CSV Style */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-sm border-collapse">
            <thead className="bg-gray-100 text-gray-600 font-medium sticky top-0 z-10 shadow-sm">
                <tr>
                    <th className="p-3 text-left w-[40%] pl-6">รายการ</th>
                    <th className="p-3 text-right w-[15%]">เงินงบประมาณ</th>
                    <th className="p-3 text-right w-[15%]">เงินรายได้</th>
                </tr>
            </thead>
            <tbody>
                {/* Loop แต่ละกองทุน (Major Group) */}
                {allocations.map((alloc) => (
                    <React.Fragment key={alloc.id}>
                        {/* 1. Header กองทุน */}
                        <tr className="bg-gray-50 border-y border-gray-200">
                            <td colSpan={3} className="py-3 px-6">
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

                        {/* Loop รายการรายจ่าย */}
                        {expenseItems.map((item, index) => {
                            const prevCategory = expenseItems[index-1]?.category.code
                            const isNewCategory = item.category.code !== prevCategory
                            
                            const key = `${alloc.id}-${item.id}`
                            const val = formData[key] || { gov: 0, income: 0 }

                            return (
                                <React.Fragment key={item.id}>
                                    {/* 2. Header หมวดงบ (Sub-Group) - แสดงเมื่อขึ้นหมวดใหม่ */}
                                    {isNewCategory && (
                                        <tr>
                                            <td colSpan={3} className="py-2 px-6 pt-4 font-semibold text-blue-700/80">
                                                {item.category.code} {item.category.name}
                                            </td>
                                        </tr>
                                    )}

                                    {/* 3. Input Row */}
                                    <tr className="border-b border-gray-50 hover:bg-yellow-50/30 transition-colors">
                                        <td className="py-2 px-6 pl-10">
                                            <div className="flex gap-3">
                                                <span className="text-gray-400 font-mono text-xs w-20 pt-1">
                                                    {item.code}
                                                </span>
                                                <span className="text-gray-700">
                                                    {item.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-2 px-4 text-right">
                                            <input
                                                type="number"
                                                value={val.gov || ''}
                                                onChange={(e) => handleInputChange(alloc.id, item.id, 'gov', e.target.value)}
                                                className="w-full text-right p-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 bg-white hover:border-gray-400 focus:bg-white transition-all"
                                                placeholder="0.00"
                                            />
                                        </td>
                                        <td className="py-2 px-4 text-right pr-6">
                                            <input
                                                type="number"
                                                value={val.income || ''}
                                                onChange={(e) => handleInputChange(alloc.id, item.id, 'income', e.target.value)}
                                                className="w-full text-right p-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 bg-white hover:border-gray-400 focus:bg-white transition-all"
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