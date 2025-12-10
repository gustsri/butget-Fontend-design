"use client";

import React from "react";

// Mock Data: จำลองโครงสร้างข้อมูลให้เหมือน Excel
const revenueItems = [
  { id: 1, level: 0, name: "1. เงินงบประมาณที่รัฐบาลจัดสรรให้", isBold: true },
  { id: 2, level: 0, name: "2. เงินรายได้สถาบันฯ", isBold: true },
  { id: 3, level: 1, name: "- ค่าบำรุงการศึกษา ค่าธรรมเนียมต่างๆ" },
  { id: 4, level: 1, name: "- เงินบริจาคและเงินอุดหนุนสมทบ" },
  { id: 5, level: 1, name: "- รับโอนการรับนักศึกษารับตรงจากสำนักทะเบียนฯ" },
  { id: 6, level: 1, name: "- รายได้จากการให้บริการวิชาการ" },
  { id: 7, level: 1, name: "- เงินผลประโยชน์" },
  { id: 8, level: 1, name: "- เงินอุดหนุนเงินบริจาค" },
];

export default function RevenueTable() {
  return (
    <div className="bg-white p-6 shadow-sm rounded-lg border border-gray-200">
      {/* Header ของ Section */}
      <h3 className="text-lg font-bold text-gray-800 mb-4">รายรับ :-</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse border border-gray-300">
          {/* --- Table Head --- */}
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="border border-gray-300 px-4 py-2 text-left min-w-[300px]">รายการ</th>
              <th className="border border-gray-300 px-4 py-2 text-right w-40">เงินงบประมาณ</th>
              <th className="border border-gray-300 px-4 py-2 text-right w-40">เงินรายได้</th>
              <th className="border border-gray-300 px-4 py-2 text-right w-40 font-bold">รวมทั้งสิ้น</th>
            </tr>
          </thead>

          {/* --- Table Body --- */}
          <tbody>
            {revenueItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                {/* Column 1: ชื่อรายการ (มีการย่อหน้าตาม level) */}
                <td className="border border-gray-300 px-4 py-2 text-gray-800">
                  <div style={{ paddingLeft: `${item.level * 2}rem` }} className={item.isBold ? "font-bold" : ""}>
                    {item.name}
                  </div>
                </td>

                {/* Column 2: เงินงบประมาณ (Input หรือ Text) */}
                <td className="border border-gray-300 px-4 py-2 text-right">
                  0
                </td>

                {/* Column 3: เงินรายได้ (Input หรือ Text) */}
                <td className="border border-gray-300 px-4 py-2 text-right">
                  0
                </td>

                {/* Column 4: รวมทั้งสิ้น (สูตรคำนวณ) */}
                <td className="border border-gray-300 px-4 py-2 text-right bg-gray-50 font-medium">
                  0
                </td>
              </tr>
            ))}
          </tbody>

          {/* --- Table Footer (Total) --- */}
          <tfoot>
            <tr className="bg-gray-50 font-bold text-gray-900">
              <td className="border border-gray-300 px-4 py-3 text-center">
                รวมรายได้ทั้งสิ้น
              </td>
              <td className="border border-gray-300 px-4 py-3 text-right border-b-4 border-double border-b-gray-400">
                0
              </td>
              <td className="border border-gray-300 px-4 py-3 text-right border-b-4 border-double border-b-gray-400">
                0
              </td>
              <td className="border border-gray-300 px-4 py-3 text-right border-b-4 border-double border-b-gray-400">
                0
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}