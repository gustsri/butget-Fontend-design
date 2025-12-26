// 'use client'

// import React, { useState, useEffect } from 'react'
// import { saveBudgetRecord } from './actions'

// type Props = {
//   allocations: any[]
//   expenseItems: any[]
//   initialRecords: any[]
// }

// export default function BudgetForm({ allocations, expenseItems, initialRecords }: Props) {
//   // State สำหรับเก็บ Tab ที่เลือกอยู่ (เก็บ allocation_id)
//   const [activeAllocationId, setActiveAllocationId] = useState<number | null>(null)
  
//   // State สำหรับเก็บค่าเงินที่ User กรอก (เพื่อความลื่นไหลของ UI)
//   // Key format: `${allocationId}-${itemId}` -> Value: { gov, income }
//   const [formData, setFormData] = useState<Record<string, { gov: number, income: number }>>({})
//   const [isSaving, setIsSaving] = useState(false)

//   // เลือก Tab แรกอัตโนมัติเมื่อข้อมูลมา
//   useEffect(() => {
//     if (allocations.length > 0 && !activeAllocationId) {
//       setActiveAllocationId(allocations[0].id)
//     }
//   }, [allocations, activeAllocationId])

//   // แปลง initialRecords มาใส่ใน formData State ตอนโหลดครั้งแรก
//   useEffect(() => {
//     const map: Record<string, { gov: number, income: number }> = {}
//     initialRecords.forEach(rec => {
//       const key = `${rec.allocation_id}-${rec.item_id}`
//       map[key] = { gov: Number(rec.amount_gov), income: Number(rec.amount_income) }
//     })
//     setFormData(map)
//   }, [initialRecords])

//   // Handler เมื่อ User พิมพ์ตัวเลข
//   const handleInputChange = (itemId: number, field: 'gov' | 'income', value: string) => {
//     if (!activeAllocationId) return
//     const key = `${activeAllocationId}-${itemId}`
//     const current = formData[key] || { gov: 0, income: 0 }
    
//     setFormData({
//       ...formData,
//       [key]: {
//         ...current,
//         [field]: parseFloat(value) || 0
//       }
//     })
//   }

//   // Handler กด Save
//   const handleSave = async () => {
//     if (!activeAllocationId) return
//     setIsSaving(true)

//     // วนลูป save ข้อมูลของ Tab ปัจจุบัน
//     const promises = expenseItems.map(item => {
//       const key = `${activeAllocationId}-${item.id}`
//       const data = formData[key]
      
//       // ถ้ามีข้อมูล (ไม่เป็น 0 ทั้งคู่) ให้บันทึก
//       if (data && (data.gov !== 0 || data.income !== 0)) {
//         return saveBudgetRecord({
//           allocationId: activeAllocationId,
//           itemId: item.id,
//           amountGov: data.gov,
//           amountIncome: data.income
//         })
//       }
//       return Promise.resolve()
//     })

//     await Promise.all(promises)
//     setIsSaving(false)
//     alert('บันทึกข้อมูลเรียบร้อยแล้ว')
//   }

//   if (!activeAllocationId) return <div>No Funds Allocated</div>

//   return (
//     <div className="flex flex-col h-full">
//       {/* --- TABS SECTION --- */}
//       <div className="flex border-b border-gray-200 px-4 bg-gray-50/50 space-x-1 pt-2">
//         {allocations.map((alloc) => (
//           <button
//             key={alloc.id}
//             onClick={() => setActiveAllocationId(alloc.id)}
//             className={`
//               px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-t border-x
//               ${activeAllocationId === alloc.id 
//                 ? 'bg-white border-gray-200 text-blue-600 border-b-white -mb-px relative z-10' 
//                 : 'bg-gray-100 border-transparent text-gray-500 hover:text-gray-700'}
//             `}
//           >
//             {alloc.fund.name}
//           </button>
//         ))}
//       </div>

//       {/* --- TOOLBAR --- */}
//       <div className="p-2 bg-gray-50 flex justify-end border-b">
//         <button 
//           onClick={handleSave}
//           disabled={isSaving}
//           className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 disabled:bg-blue-300 text-sm font-medium transition-colors"
//         >
//           {isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล (Save)'}
//         </button>
//       </div>

//       {/* --- TABLE SECTION --- */}
//       <div className="flex-1 overflow-y-auto p-4">
//         <table className="w-full border-collapse text-sm">
//           <thead>
//             <tr className="bg-gray-100 text-gray-700 border-y border-gray-200 sticky top-0 shadow-sm z-10">
//               <th className="p-3 text-left w-24">รหัสบัญชี</th>
//               <th className="p-3 text-left">รายการ</th>
//               <th className="p-3 text-right w-40">เงินงบประมาณ</th>
//               <th className="p-3 text-right w-40">เงินรายได้</th>
//             </tr>
//           </thead>
//           <tbody>
//             {expenseItems.map((item, index) => {
//               // เช็คว่าต้องขึ้นหัวข้อหมวดหมู่ใหม่ไหม
//               const prevItem = expenseItems[index - 1]
//               const isNewCategory = !prevItem || prevItem.category.id !== item.category.id
              
//               const key = `${activeAllocationId}-${item.id}`
//               const data = formData[key] || { gov: 0, income: 0 }

//               return (
//                 <React.Fragment key={item.id}>
//                   {/* Category Header */}
//                   {isNewCategory && (
//                     <tr className="bg-blue-50/50">
//                       <td colSpan={4} className="p-2 font-bold text-gray-700 border-b border-blue-100 mt-2">
//                         {item.category.code} - {item.category.name}
//                       </td>
//                     </tr>
//                   )}
                  
//                   {/* Item Row */}
//                   <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
//                     <td className="p-2 pl-4 text-gray-500 font-mono">{item.code}</td>
//                     <td className="p-2 text-gray-800">{item.name}</td>
//                     <td className="p-2 text-right">
//                       <input 
//                         type="number"
//                         value={data.gov || ''}
//                         onChange={(e) => handleInputChange(item.id, 'gov', e.target.value)}
//                         className="w-full text-right p-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
//                         placeholder="0"
//                       />
//                     </td>
//                     <td className="p-2 text-right">
//                       <input 
//                         type="number"
//                         value={data.income || ''}
//                         onChange={(e) => handleInputChange(item.id, 'income', e.target.value)}
//                         className="w-full text-right p-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
//                         placeholder="0"
//                       />
//                     </td>
//                   </tr>
//                 </React.Fragment>
//               )
//             })}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   )
// }