"use client";

import React, { useState, useMemo } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

// --- Type Definition ---
type ExpenseItem = {
  id: string;
  code: string;
  name: string;
  level: number; // 0=หมวดใหญ่, 1=ข้อย่อย, 2=แผนงาน, 3=กองทุน(Input)
  parentId: string | null;
  gov: number;
  income: number;
  isInput: boolean; // true = กรอกได้, false = รวมยอด
};

// --- Mock Data (จำลองโครงสร้างตามรูปภาพที่ส่งมา) ---
// ในของจริง ข้อมูลชุดนี้จะมาจากการ Join Table Structure + Allocation
const initialData: ExpenseItem[] = [
  // 1. งบบุคลากร
  { id: "1", code: "1", name: "1. งบบุคลากร", level: 0, parentId: null, gov: 0, income: 0, isInput: false },
    // 1.1 ค่าจ้าง
    { id: "1.1", code: "1.1", name: "1.1 ค่าจ้างลูกจ้างสัญญาจ้างพนักงานเงินรายได้", level: 1, parentId: "1", gov: 0, income: 0, isInput: false },
      { id: "1.1.P1", code: "", name: "แผนงานจัดการศึกษาอุดมศึกษา", level: 2, parentId: "1.1", gov: 0, income: 0, isInput: false },
        { id: "1.1.P1.F1", code: "", name: ": กองทุนทั่วไป", level: 3, parentId: "1.1.P1", gov: 0, income: 0, isInput: true }, // <-- จุดกรอกข้อมูล

  // 2. งบดำเนินงาน
  { id: "2", code: "2", name: "2. งบดำเนินงาน", level: 0, parentId: null, gov: 0, income: 0, isInput: false },
    // 2.1 ค่าตอบแทน
    { id: "2.1", code: "2.1", name: "2.1 ค่าตอบแทน", level: 1, parentId: "2", gov: 0, income: 0, isInput: false },
      { id: "2.1.P1", code: "", name: "แผนงานจัดการศึกษาอุดมศึกษา", level: 2, parentId: "2.1", gov: 0, income: 0, isInput: false },
        { id: "2.1.P1.F1", code: "", name: ": กองทุนทั่วไป", level: 3, parentId: "2.1.P1", gov: 0, income: 0, isInput: true },
        { id: "2.1.P1.F2", code: "", name: ": กองทุนเพื่อการศึกษา", level: 3, parentId: "2.1.P1", gov: 0, income: 0, isInput: true },
      { id: "2.1.P2", code: "", name: "แผนงานบริการวิชาการแก่ชุมชน", level: 2, parentId: "2.1", gov: 0, income: 0, isInput: false },
        { id: "2.1.P2.F1", code: "", name: ": กองทุนบริการวิชาการ", level: 3, parentId: "2.1.P2", gov: 0, income: 0, isInput: true },
    
    // 2.2 ค่าใช้สอย
    { id: "2.2", code: "2.2", name: "2.2 ค่าใช้สอย", level: 1, parentId: "2", gov: 0, income: 0, isInput: false },
      { id: "2.2.P1", code: "", name: "แผนงานจัดการศึกษาอุดมศึกษา", level: 2, parentId: "2.2", gov: 0, income: 0, isInput: false },
        { id: "2.2.P1.F1", code: "", name: ": กองทุนทั่วไป", level: 3, parentId: "2.2.P1", gov: 0, income: 0, isInput: true },
        { id: "2.2.P1.F2", code: "", name: ": กองทุนพัฒนาบุคลากร", level: 3, parentId: "2.2.P1", gov: 0, income: 0, isInput: true },
];

export default function F3ExpenseSection() {
  const [items, setItems] = useState<ExpenseItem[]>(initialData);

  // --- Logic การคำนวณ Recursive (ลูกส่งยอดให้แม่) ---
  // ใช้ useMemo เพื่อคำนวณใหม่เฉพาะตอน items เปลี่ยน
  const displayedItems = useMemo(() => {
    // 1. Copy ข้อมูลมาเพื่อคำนวณ
    const calculated = JSON.parse(JSON.stringify(items)) as ExpenseItem[];
    
    // 2. วนลูปจาก Level ลึกสุด (3) ขึ้นไปหา Level บนสุด (0)
    // เพื่อให้ยอดเงินถูกส่งต่อขึ้นไปเป็นทอดๆ (Roll-up)
    for (let lvl = 3; lvl >= 0; lvl--) {
      const currentLevelItems = calculated.filter(i => i.level === lvl);
      
      currentLevelItems.forEach(child => {
        if (child.parentId) {
          const parent = calculated.find(p => p.id === child.parentId);
          if (parent) {
            parent.gov += child.gov;
            parent.income += child.income;
          }
        }
      });
    }
    return calculated;
  }, [items]);

  // ฟังก์ชันอัปเดตข้อมูล (แก้ไขได้เฉพาะบรรทัดที่เป็น isInput=true)
  const handleInputChange = (id: string, field: 'gov' | 'income', value: string) => {
    const numValue = value === "" ? 0 : parseFloat(value);
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: numValue } : item
    ));
  };

  const totalExpense = displayedItems
    .filter(i => i.level === 0) // เอาเฉพาะหัวข้อใหญ่สุดมารวมกัน
    .reduce((sum, item) => sum + item.gov + item.income, 0);

  return (
    <div className="space-y-6 mt-8">
      {/* Header Section */}
      <div className="flex justify-between items-end border-b pb-2">
        <div>
          <h3 className="text-lg font-bold text-gray-800">2. ประมาณการรายจ่าย</h3>
          <p className="text-xs text-gray-500">กรอกข้อมูลเฉพาะช่องสีขาว (ช่องสีเทาจะคำนวณให้อัตโนมัติ)</p>
        </div>
        <div className="text-right">
          <span className="text-sm text-gray-500">รวมรายจ่ายทั้งสิ้น</span>
          <p className="text-2xl font-bold text-red-600">{totalExpense.toLocaleString()}</p>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700 border-b">
                <th className="py-3 px-4 text-left min-w-[350px]">รายการ</th>
                <th className="py-3 px-4 text-right w-40">เงินงบประมาณ</th>
                <th className="py-3 px-4 text-right w-40">เงินรายได้</th>
                <th className="py-3 px-4 text-right w-40 bg-gray-50 font-semibold">รวมทั้งสิ้น</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayedItems.map((item) => {
                const total = item.gov + item.income;
                // คำนวณ Indent ตาม Level (Level 0 ชิดซ้าย, Level 3 ย่อหน้าเยอะๆ)
                const paddingLeft = `${(item.level * 1.5) + 1}rem`;
                
                // Style พิเศษสำหรับหัวข้อแต่ละระดับ
                const isHeader = !item.isInput;
                const rowClass = isHeader ? "bg-gray-50 text-gray-800" : "bg-white hover:bg-blue-50";
                const textClass = item.level === 0 ? "font-bold text-base" : 
                                  item.level === 1 ? "font-semibold text-gray-700" :
                                  "text-gray-600";

                return (
                  <tr key={item.id} className={`${rowClass} transition-colors`}>
                    {/* รายการ (Hierarchy Name) */}
                    <td className="py-2 pr-4 border-r border-gray-100 relative">
                      <div 
                        style={{ paddingLeft }} 
                        className={`flex items-center ${textClass}`}
                      >
                        {/* ใส่ขีดนำหน้าเล็กน้อยเพื่อให้ดูเป็น Tree */}
                        {item.level > 0 && (
                           <span className="absolute left-0 w-full border-b border-dotted border-gray-300 -z-10" 
                                 style={{ left: `${(item.level * 1.5) - 0.5}rem`, width: '1rem', top: '50%' }}>
                           </span>
                        )}
                        {item.name}
                      </div>
                    </td>

                    {/* เงินงบประมาณ */}
                    <td className="py-1 px-2 text-right">
                      {item.isInput ? (
                        <input
                          type="number"
                          className="w-full text-right border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
                          placeholder="0"
                          value={item.gov || ""}
                          onChange={(e) => handleInputChange(item.id, 'gov', e.target.value)}
                        />
                      ) : (
                        <span className="font-medium text-gray-500 block py-1">{item.gov.toLocaleString()}</span>
                      )}
                    </td>

                    {/* เงินรายได้ */}
                    <td className="py-1 px-2 text-right">
                      {item.isInput ? (
                        <input
                          type="number"
                          className="w-full text-right border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-green-500 outline-none text-gray-800"
                          placeholder="0"
                          value={item.income || ""}
                          onChange={(e) => handleInputChange(item.id, 'income', e.target.value)}
                        />
                      ) : (
                        <span className="font-medium text-gray-500 block py-1">{item.income.toLocaleString()}</span>
                      )}
                    </td>

                    {/* รวมทั้งสิ้น */}
                    <td className="py-1 px-4 text-right bg-gray-50 font-semibold text-gray-700">
                      {total.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}