// "use client";

// import { useState, useEffect, useMemo } from "react";
// import Sidebar from "@/components/shared/Sidebar"; // ปรับ path ตามจริง
// import YearDropdown from "@/components/shared/year"; // ปรับ path ตามจริง
// import { Loader2, Save, RotateCcw } from "lucide-react";
// import { getExpenseData, saveExpenseItems, type ExpenseRow } from "./actions";

// export default function ExpensePage() {
//   const [year, setYear] = useState(2569);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);

//   // Data State
//   const [budgetId, setBudgetId] = useState<number | null>(null);
//   const [rows, setRows] = useState<ExpenseRow[]>([]);
//   const [originalRows, setOriginalRows] = useState<ExpenseRow[]>([]);

//   // Fetch Data เมื่อปีเปลี่ยน
//   useEffect(() => {
//     loadData();
//   }, [year]);

//   async function loadData() {
//     setLoading(true);
//     try {
//       const data = await getExpenseData(year);
//       setBudgetId(data.budget_id);
//       setRows(data.rows);
//       setOriginalRows(JSON.parse(JSON.stringify(data.rows))); // เก็บค่าตั้งต้นไว้เทียบ
//     } catch (e) {
//       console.error(e);
//     } finally {
//       setLoading(false);
//     }
//   }

//   // --- Logic คำนวณ Real-time (หัวใจสำคัญ) ---
//   const calculatedRows = useMemo(() => {
//     // Clone rows เพื่อไม่ให้กระทบ state หลักโดยตรงระหว่างคำนวณ
//     const map = new Map<number, ExpenseRow & { gov_sum: number; income_sum: number }>();

//     // Init: ใส่ค่า user input ลงไปก่อน
//     rows.forEach(r => {
//       map.set(r.structure_id, {
//         ...r,
//         gov_sum: r.is_header ? 0 : r.gov_amount,
//         income_sum: r.is_header ? 0 : r.income_amount
//       });
//     });

//     // Loop: บวกจาก Level ลึกสุด ขึ้นมาหา Level 0
//     const maxLevel = Math.max(...rows.map(r => r.level));
//     for (let l = maxLevel; l >= 0; l--) {
//       const currentLevelRows = rows.filter(r => r.level === l);
//       currentLevelRows.forEach(row => {
//         if (row.parent_id) {
//           const parent = map.get(row.parent_id);
//           const current = map.get(row.structure_id);
//           if (parent && current) {
//             parent.gov_sum += current.gov_sum;
//             parent.income_sum += current.income_sum;
//           }
//         }
//       });
//     }
//     // Return เป็น Array เรียงตามลำดับเดิม
//     return rows.map(r => map.get(r.structure_id)!);
//   }, [rows]);

//   // Handle Input Change
//   const handleInputChange = (id: number, field: 'gov_amount' | 'income_amount', value: string) => {
//     const numValue = parseFloat(value) || 0;
//     setRows(prev => prev.map(row =>
//       row.structure_id === id ? { ...row, [field]: numValue } : row
//     ));
//   };

//   // Save Function
//   const handleSave = async () => {
//     if (!budgetId) return;
//     setSaving(true);

//     // ส่งเฉพาะรายการที่เป็น Leaf Node (ตัวที่กรอกได้) ไปบันทึก
//     const itemsToSave = rows
//       .filter(r => !r.is_header)
//       .map(r => ({
//         structure_id: r.structure_id,
//         gov: r.gov_amount,
//         income: r.income_amount
//       }));

//     await saveExpenseItems(budgetId, itemsToSave);
//     await loadData(); // Reload เพื่อ update state ให้ sync กับ DB
//     setSaving(false);
//   };

//   // ตรวจสอบว่ามีการแก้ไขหรือไม่ (เพื่อเปิด/ปิดปุ่ม Save)
//   const hasChanges = JSON.stringify(rows) !== JSON.stringify(originalRows);
//   const totalBudget = calculatedRows.find(r => r.parent_id === null)?.gov_sum || 0;
//   const totalIncome = calculatedRows.find(r => r.parent_id === null)?.income_sum || 0;

//   return (
//     <div className="flex min-h-screen bg-gray-50">
//       <Sidebar />
//       <div className="ml-64 flex-1 flex flex-col">

//         {/* Header */}
//         <div className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-800">ประมาณการรายจ่าย (F5)</h1>
//             <p className="text-gray-500 text-sm">ปีงบประมาณ {year}</p>
//           </div>
//           <div className="flex items-center gap-4">
//             <div className="text-right text-sm mr-4">
//               <div className="text-gray-500">ยอดรวมทั้งสิ้น</div>
//               <div className="font-bold text-blue-600 text-lg">{(totalBudget + totalIncome).toLocaleString()} บาท</div>
//             </div>
//             <YearDropdown selectedYear={year} onChange={setYear} />
//             {hasChanges && (
//               <button
//                 onClick={handleSave}
//                 disabled={saving}
//                 className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
//               >
//                 {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
//                 บันทึก
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Table Area */}
//         <div className="flex-1 p-8 overflow-auto">
//           {loading ? (
//             <div className="flex justify-center items-center h-full text-gray-400">
//               <Loader2 className="animate-spin w-8 h-8" />
//             </div>
//           ) : (
//             <div className="bg-white rounded-xl shadow border overflow-hidden">
//               <table className="w-full text-sm">
//                 <thead className="bg-gray-100 text-gray-600 font-medium border-b">
//                   <tr>
//                     <th className="py-3 px-4 w-24 text-center">รหัส</th>
//                     <th className="py-3 px-4">รายการ</th>
//                     <th className="py-3 px-4 w-40 text-right">เงินงบประมาณ</th>
//                     <th className="py-3 px-4 w-40 text-right">เงินรายได้</th>
//                     <th className="py-3 px-4 w-40 text-right bg-gray-50">รวม</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-100">
//                   {calculatedRows.map((row) => {
//                     // Logic: ตัดสินใจว่าจะโชว์ยอดเงินรวมในบรรทัดนี้ไหม?
//                     // 1. ต้องเป็น Header (row.is_header)
//                     // 2. ต้องเป็นหัวข้อระดับใหญ่ (Level <= 5) เช่น กิจกรรม, กองทุน, หรือ หมวดรายจ่าย (1. งบบุคลากร)
//                     // 3. ถ้าเป็นหัวข้อย่อยลึกๆ (3.1, 3.1.1) ให้ซ่อนไว้ เพื่อไม่ให้รก
//                     const showHeaderSum = row.is_header && row.level <= 5;

//                     return (
//                       <tr
//                         key={row.structure_id}
//                         className={`transition-colors ${
//                           // แต่งสีพื้นหลัง: หัวข้อใหญ่เข้มหน่อย, หัวข้อย่อยจางลง
//                           row.is_header
//                             ? row.level <= 4 ? 'bg-blue-50' : 'bg-gray-50/50'
//                             : 'hover:bg-blue-50/30'
//                           }`}
//                       >
//                         {/* Column 1: รหัส */}
//                         <td className="py-2 px-4 text-center text-gray-400 font-mono text-xs">
//                           {/* แสดงรหัสเฉพาะหัวข้อใหญ่ หัวข้อย่อยมากๆ ไม่ต้องโชว์ก็ได้ถ้าอยากให้โล่ง */}
//                           {row.code}
//                         </td>

//                         {/* Column 2: ชื่อรายการ */}
//                         <td className="py-2 px-4">
//                           <div
//                             style={{ paddingLeft: `${row.level * 20}px` }}
//                             className={`
//               ${row.is_header ? 'font-semibold text-gray-800' : 'text-gray-600'}
//               ${row.level <= 4 ? 'text-base' : 'text-sm'} // หัวข้อใหญ่ตัวหนังสือใหญ่ขึ้น
//             `}
//                           >
//                             {row.name}
//                           </div>
//                         </td>

//                         {/* Column 3: เงินงบประมาณ */}
//                         <td className="py-2 px-4 text-right">
//                           {row.is_header ? (
//                             // --- HEADER ---
//                             showHeaderSum ? (
//                               <span className="font-bold text-gray-800">
//                                 {row.gov_sum > 0 ? row.gov_sum.toLocaleString() : '-'}
//                               </span>
//                             ) : (
//                               // ซ่อนตัวเลขสำหรับ Header ย่อย
//                               <span className="text-gray-300 text-[10px] opacity-0">-</span>
//                             )
//                           ) : (
//                             // --- INPUT ITEM ---
//                             <input
//                               type="text"
//                               className="w-full text-right border-gray-200 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
//                               value={row.gov_amount === 0 ? '' : row.gov_amount} // เป็น 0 ให้โล่ง
//                               onChange={e => handleInputChange(row.structure_id, 'gov_amount', e.target.value)}
//                               placeholder=""
//                             />
//                           )}
//                         </td>

//                         {/* Column 4: เงินรายได้ */}
//                         <td className="py-2 px-4 text-right">
//                           {row.is_header ? (
//                             // --- HEADER ---
//                             showHeaderSum ? (
//                               <span className="font-bold text-gray-800">
//                                 {row.income_sum > 0 ? row.income_sum.toLocaleString() : '-'}
//                               </span>
//                             ) : (
//                               <span className="text-gray-300 text-[10px] opacity-0">-</span>
//                             )
//                           ) : (
//                             // --- INPUT ITEM ---
//                             <input
//                               type="text"
//                               className="w-full text-right border-gray-200 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
//                               value={row.income_amount === 0 ? '' : row.income_amount}
//                               onChange={e => handleInputChange(row.structure_id, 'income_amount', e.target.value)}
//                               placeholder=""
//                             />
//                           )}
//                         </td>

//                         {/* Column 5: รวม (Total) */}
//                         <td className="py-2 px-4 text-right">
//                           {/* แสดงผลรวมเฉพาะบรรทัดที่โชว์ยอด หรือ บรรทัดที่เป็น Input */}
//                           {(showHeaderSum || !row.is_header) && (
//                             <span className={`font-medium ${row.is_header ? 'text-black' : 'text-gray-500'}`}>
//                               {(row.gov_sum + row.income_sum) > 0 ? (row.gov_sum + row.income_sum).toLocaleString() : '-'}
//                             </span>
//                           )}
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
import React from 'react'
import { PrismaClient } from '@prisma/client'
import Link from 'next/link'
import { clsx } from 'clsx' // ถ้ายังไม่มีให้ลง npm i clsx หรือใช้ template string ธรรมดา

const prisma = new PrismaClient()

// 1. Fetch เมนูด้านซ้าย (กิจกรรมทั้งหมด)
async function getActivities() {
  return await prisma.structureCode.findMany({
    where: { 
      node_type: 'ACTIVITY', // ดึงเฉพาะ level กิจกรรม
      category: 'EXPENSE' 
    },
    orderBy: { code: 'asc' }
  })
}

// 2. Fetch ข้อมูลตารางด้านขวา (เฉพาะกิจกรรมที่เลือก)
async function getBudgetItems(activityId: number | undefined) {
  if (!activityId) return []

  // Logic: ดึงลูกๆ ของ Activity ID นี้
  // (ในความจริงต้องดึงจาก ExpenseItem แต่ช่วง Dev ใช้ StructureCode ไปก่อนตามที่คุยกัน)
  const activityNode = await prisma.structureCode.findUnique({
    where: { id: activityId },
    include: {
        children: { // Level 4 (Fund)
            include: {
                children: { // Level 5 (Category)
                    include: {
                        children: { // Level 6 (Item Header)
                             include: {
                                children: true // Level 7 (Leaf Items) - จุดจบ
                             }
                        }
                    }
                }
            }
        }
    }
  })
  
  // หมายเหตุ: การใช้ include ซ้อนกันเยอะๆ แบบนี้เป็นแค่ตัวอย่าง 
  // ในงานจริงเรามักจะเขียน Recursive Query หรือ Flat List แล้วมาทำ Tree ใน JS
  return activityNode ? [activityNode] : []
}


// --- Main Page Component ---
export default async function F5Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // อ่านค่า ?activityId=... จาก URL
  const selectedActivityId = searchParams.activityId 
    ? parseInt(searchParams.activityId as string) 
    : undefined

  // Parallel Data Fetching
  const activities = await getActivities()
  const budgetData = await getBudgetItems(selectedActivityId)

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* --- LEFT SIDEBAR: รายชื่อกิจกรรม --- */}
      <aside className="w-80 border-r border-gray-200 bg-gray-50 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h2 className="font-bold text-gray-700">รายการกิจกรรม (Activities)</h2>
          <p className="text-xs text-gray-500">เลือกกิจกรรมเพื่อกรอกงบประมาณ</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {activities.map((act) => {
            const isActive = selectedActivityId === act.id
            return (
              <Link
                key={act.id}
                href={`/planning/expense/f-5?activityId=${act.id}`}
                className={clsx(
                  "block px-3 py-2.5 rounded-md text-sm transition-colors",
                  isActive 
                    ? "bg-blue-100 text-blue-700 font-medium border border-blue-200" 
                    : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                )}
              >
                <div className="flex items-start gap-2">
                  <span className="font-mono text-xs bg-gray-200 px-1 rounded mt-0.5">
                    {act.code}
                  </span>
                  <span>{act.name}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </aside>

      {/* --- RIGHT CONTENT: ตารางงบประมาณ --- */}
      <main className="flex-1 flex flex-col bg-white overflow-hidden">
        {selectedActivityId ? (
          <>
            {/* Header ส่วนขวา */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center shadow-sm z-10">
              <h1 className="text-xl font-bold text-gray-800">
                {activities.find(a => a.id === selectedActivityId)?.name}
              </h1>
              <div className="space-x-2">
                 <span className="text-sm text-gray-500 mr-2">Status: Draft</span>
                 <button className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 text-sm">
                    บันทึกข้อมูล
                 </button>
              </div>
            </div>

            {/* Table Area */}
            <div className="flex-1 overflow-auto p-6">
                {/* เรียกใช้ Component ตารางที่คุณทำไว้ หรือ Render ตรงนี้ */}
                {/* ผมใส่ Placeholder ไว้ก่อน เพื่อให้เห็นภาพ */}
                <BudgetTableTree data={budgetData} />
            </div>
          </>
        ) : (
          // Empty State (ยังไม่ได้เลือกกิจกรรม)
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
            <p className="text-lg font-medium">กรุณาเลือกกิจกรรมทางด้านซ้าย</p>
            <p className="text-sm">เพื่อเริ่มดำเนินการจัดทำงบรายจ่าย (F-5)</p>
          </div>
        )}
      </main>
    </div>
  )
}

// --- Component ย่อยสำหรับ Render Tree (Recursive แบบง่าย) ---
// หมายเหตุ: ของจริงควรแยกไฟล์
function BudgetTableTree({ data }: { data: any[] }) {
    if (!data || data.length === 0) return <div className="text-gray-500">ไม่พบรายการย่อย</div>

    // Recursive function เพื่อ loop render children
    const renderNode = (nodes: any[]) => {
        return nodes.map((node) => (
            <React.Fragment key={node.id}>
                <tr className={node.node_type === 'HEADER' || node.input_type === 'HEADER' ? "bg-gray-50" : ""}>
                    <td className="border p-2 font-mono text-sm align-top">{node.code}</td>
                    <td className="border p-2 text-sm">
                        <div style={{ paddingLeft: `${(node.level - 3) * 20}px` }} 
                             className={node.input_type === 'HEADER' ? "font-semibold" : ""}>
                            {node.name}
                        </div>
                    </td>
                    <td className="border p-2 text-right">
                        {node.input_type === 'INPUT' ? (
                            <input className="w-full text-right border rounded px-1" placeholder="0.00" />
                        ) : '-'}
                    </td>
                </tr>
                {/* Recursive Call */}
                {node.children && node.children.length > 0 && renderNode(node.children)}
            </React.Fragment>
        ))
    }

    return (
        <table className="w-full border-collapse border border-gray-200">
            <thead>
                <tr className="bg-gray-100 text-gray-700">
                    <th className="border p-2 w-32 text-left">รหัส</th>
                    <th className="border p-2 text-left">รายการ</th>
                    <th className="border p-2 w-40 text-right">จำนวนเงิน</th>
                </tr>
            </thead>
            <tbody>
                {renderNode(data)} 
                {/* หมายเหตุ: data[0].children เพราะ node แรกคือกิจกรรมแม่ */}
                {data[0]?.children ? renderNode(data[0].children) : null}
            </tbody>
        </table>
    )
}