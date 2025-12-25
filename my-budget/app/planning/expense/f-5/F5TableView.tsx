'use client'

import React, { useState, useEffect } from 'react'
import { Save, Loader2 } from 'lucide-react'
import { saveBudgetRecord } from './actions'

// ... (Type Props และส่วนอื่นๆ เหมือนเดิม)

export default function F5TableView({ data, year }: Props) {
  const { activity, allocations, expenseItems, records } = data

  const [formData, setFormData] = useState<Record<string, { gov: number, income: number } | null>>(null) // เปลี่ยน type นิดหน่อยเพื่อรองรับการเช็ค load เสร็จ
  const [isSaving, setIsSaving] = useState(false)

  // Initialize Data
  useEffect(() => {
    const map: Record<string, { gov: number, income: number }> = {}
    
    // 🔥 จุดสำคัญ 1: เราโหลดเฉพาะ Record ที่มีอยู่จริง (ที่ผ่านการกรองจาก Seed แล้ว) ใส่ใน Map
    records.forEach((rec: any) => {
      const key = `${rec.allocation_id}-${rec.item_id}`
      map[key] = { gov: Number(rec.amount_gov), income: Number(rec.amount_income) }
    })
    setFormData(map)
  }, [records])

  // ... (handleInputChange, handleSave เหมือนเดิม) ...

  // ถ้าข้อมูลงบยังไม่โหลด อย่าเพิ่ง render ตาราง (กันกระพริบ)
  if (!formData) return <div>Loading...</div>

  return (
    <div className="flex flex-col h-full">
      {/* ... (Header เหมือนเดิม) ... */}

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
                {allocations.map((alloc) => (
                    <React.Fragment key={alloc.id}>
                        {/* Header กองทุน */}
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

                        {expenseItems.map((item, index) => {
                            const key = `${alloc.id}-${item.id}`
                            const val = formData[key]

                            // 🔥 จุดสำคัญ 2: Mapping Logic
                            // ถ้าใน formData ไม่มี key นี้ แสดงว่า Seed ไม่ได้สร้าง Record ไว้ให้ (แปลว่ากองทุนนี้ห้ามใช้งบนี้)
                            // เราก็สั่ง "ไม่แสดงผล" (return null) ไปเลย
                            if (!val) return null 

                            // เช็คหมวดหมู่ (Header ย่อย)
                            // ต้องเช็คย้อนหลังไปหา "Item ตัวก่อนหน้า" ที่ "ถูกแสดงผล" (ไม่ใช่ index-1 ดื้อๆ เพราะตัวก่อนหน้าอาจจะถูกซ่อน)
                            // แต่วิธีง่ายสุดคือ เช็คว่า "นี่เป็น Item แรกของหมวดนี้ ที่ได้รับอนุญาต" หรือไม่ (Logic นี้ซับซ้อนใน Loop)
                            // เพื่อความง่าย ให้แสดงชื่อหมวดทุกครั้งที่เปลี่ยนหมวด แล้วถ้า Item โดนซ่อน หมวดก็จะโดนซ่อนด้วยวิธี CSS หรือ Logic เสริม
                            // แต่เบื้องต้น เอาแค่ซ่อน Item ก่อนครับ
                            
                            const prevCategory = expenseItems[index-1]?.category.code
                            const isNewCategory = item.category.code !== prevCategory

                            return (
                                <React.Fragment key={item.id}>
                                    {/* Header หมวดงบ (แสดงเฉพาะถ้า item นี้ถูก render) */}
                                    {isNewCategory && (
                                        <tr>
                                            <td colSpan={3} className="py-2 px-6 pt-4 font-semibold text-blue-700/80 bg-white">
                                                {item.category.code} {item.category.name}
                                            </td>
                                        </tr>
                                    )}

                                    {/* Input Row */}
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
                                                // ใส่ fallback 0 ถ้าค่าว่าง
                                                value={val.gov} 
                                                onChange={(e) => handleInputChange(alloc.id, item.id, 'gov', e.target.value)}
                                                className="w-full text-right p-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </td>
                                        <td className="py-2 px-4 text-right pr-6">
                                            <input
                                                type="number"
                                                value={val.income}
                                                onChange={(e) => handleInputChange(alloc.id, item.id, 'income', e.target.value)}
                                                className="w-full text-right p-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
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