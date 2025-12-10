"use client";

import React, { useState, useEffect } from "react";
import { BanknotesIcon, BuildingLibraryIcon, CalculatorIcon } from "@heroicons/react/24/outline";

// โครงสร้างข้อมูลสำหรับตาราง (Initial Data)
const initialItems = [
  { id: 1, name: "1. เงินงบประมาณที่รัฐบาลจัดสรรให้", level: 0, gov: 0, income: 0, isHeader: false },
  { id: 2, name: "2. เงินรายได้สถาบันฯ", level: 0, gov: 0, income: 0, isHeader: true }, // เป็นหัวข้อเฉยๆ
  { id: 3, name: "- ค่าบำรุงการศึกษา ค่าธรรมเนียมต่างๆ", level: 1, gov: 0, income: 0, isHeader: false },
  { id: 4, name: "- เงินบริจาคและเงินอุดหนุนสมทบ", level: 1, gov: 0, income: 0, isHeader: false },
  { id: 5, name: "- รับโอนการรับนักศึกษาฯ", level: 1, gov: 0, income: 0, isHeader: false },
  { id: 6, name: "- รายได้จากการให้บริการวิชาการ", level: 1, gov: 0, income: 0, isHeader: false },
  { id: 7, name: "- เงินผลประโยชน์", level: 1, gov: 0, income: 0, isHeader: false },
  { id: 8, name: "- เงินอุดหนุนเงินบริจาค", level: 1, gov: 0, income: 0, isHeader: false },
];

export default function F3RevenueSection() {
  const [items, setItems] = useState(initialItems);

  // คำนวณยอดรวมเพื่อเอาไปโชว์ในการ์ดข้างบน (Derived State)
  const totalGov = items.reduce((sum, item) => sum + (item.gov || 0), 0);
  const totalIncome = items.reduce((sum, item) => sum + (item.income || 0), 0);
  const grandTotal = totalGov + totalIncome;

  // ฟังก์ชันอัปเดตค่าเมื่อ User พิมพ์ตัวเลข
  const handleInputChange = (id: number, field: 'gov' | 'income', value: string) => {
    // แปลง string เป็น number (ถ้าว่างให้เป็น 0)
    const numValue = value === "" ? 0 : parseFloat(value);

    setItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, [field]: numValue } : item
      )
    );
  };

  return (
    <div className="space-y-6">
      
      {/* ========================================== */}
      {/* ส่วนที่ 1: การ์ดสรุป (Update Real-time)    */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* การ์ด: เงินงบประมาณ */}
        <div className="bg-white p-4 rounded-xl border border-orange-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
            <BuildingLibraryIcon className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500">เงินงบประมาณแผ่นดิน</p>
            <p className="text-xl font-bold text-gray-900">
              {totalGov.toLocaleString()}
            </p>
          </div>
        </div>

        {/* การ์ด: เงินรายได้ */}
        <div className="bg-white p-4 rounded-xl border border-green-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <BanknotesIcon className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500">เงินรายได้สถาบันฯ</p>
            <p className="text-xl font-bold text-gray-900">
              {totalIncome.toLocaleString()}
            </p>
          </div>
        </div>

        {/* การ์ด: รวมทั้งสิ้น */}
        <div className="bg-blue-600 p-4 rounded-xl shadow-md text-white flex items-center justify-between transition-all hover:bg-blue-700">
          <div>
            <p className="text-blue-100 text-sm flex items-center gap-1">
              <CalculatorIcon className="w-4 h-4" /> รวมรายรับทั้งสิ้น
            </p>
            <p className="text-2xl font-bold mt-1">
              {grandTotal.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* ส่วนที่ 2: ตารางกรอกข้อมูล (Excel Style)    */}
      {/* ========================================== */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
          <h3 className="font-bold text-gray-700">1. ประมาณการรายรับ (กรอกข้อมูล)</h3>
          <span className="text-xs text-gray-400">หน่วย: บาท</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-600 border-b">
                <th className="py-3 px-4 text-left min-w-[300px]">รายการ</th>
                <th className="py-3 px-4 text-right w-48">เงินงบประมาณ</th>
                <th className="py-3 px-4 text-right w-48">เงินรายได้</th>
                <th className="py-3 px-4 text-right w-48 bg-gray-100 font-semibold text-gray-800">รวมทั้งสิ้น</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50 transition-colors">
                  {/* Col 1: ชื่อรายการ (Indented) */}
                  <td className="py-2 px-4">
                    <div 
                      style={{ paddingLeft: `${item.level * 1.5}rem` }} 
                      className={`${item.level === 0 ? "font-bold text-gray-800" : "text-gray-600"}`}
                    >
                      {item.name}
                    </div>
                  </td>

                  {/* Col 2: Input เงินงบประมาณ */}
                  <td className="py-2 px-4 text-right">
                    {!item.isHeader ? (
                      <input
                        type="number"
                        min="0"
                        className="w-full text-right border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="0"
                        value={item.gov || ""}
                        onChange={(e) => handleInputChange(item.id, 'gov', e.target.value)}
                      />
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>

                  {/* Col 3: Input เงินรายได้ */}
                  <td className="py-2 px-4 text-right">
                    {!item.isHeader ? (
                      <input
                        type="number"
                        min="0"
                        className="w-full text-right border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                        placeholder="0"
                        value={item.income || ""}
                        onChange={(e) => handleInputChange(item.id, 'income', e.target.value)}
                      />
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>

                  {/* Col 4: รวม (Auto Calculate) */}
                  <td className="py-2 px-4 text-right font-medium text-gray-700 bg-gray-50/50">
                     {item.isHeader ? "" : ((item.gov || 0) + (item.income || 0)).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
            
            {/* Footer Row (Total) */}
            <tfoot className="bg-gray-100 font-bold text-gray-900 border-t-2 border-gray-200">
              <tr>
                <td className="py-3 px-4 text-center">รวมรายรับทั้งสิ้น</td>
                <td className="py-3 px-4 text-right text-orange-700">{totalGov.toLocaleString()}</td>
                <td className="py-3 px-4 text-right text-green-700">{totalIncome.toLocaleString()}</td>
                <td className="py-3 px-4 text-right text-blue-700 underline decoration-double">{grandTotal.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}