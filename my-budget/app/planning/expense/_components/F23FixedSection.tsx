"use client";

import React from "react";

// Mock Data
const fixedItems = [
  { id: "1.1", name: "1.1 สำรองจ่ายร้อยละ 15" },
  { id: "1.2", name: "1.2 สำรองจ่ายเกินกว่าร้อยละ 15 เท่ากับร้อยละ 3" },
  { id: "2", name: "2. งบยุทธศาสตร์ไม่น้อยกว่าร้อยละ 5", note: "(ส่วนงานวิชาการไปตั้งรองรับในส่วนของ impact)" },
  { id: "3", name: "3. ชดใช้เงินคงคลัง (ถ้ามี)" },
  { id: "4", name: "4. ค่าดูแลและบำรุงรักษา ร้อยละ 2.5 (Preventive Maintenance)" },
  { id: "5", name: "5. งบลงทุน (ไม่ซ้ำซ้อนกับข้อ 4)" },
  { id: "6", name: "6. งบประจำ" },
  { id: "7", name: "7. เงินสนับสนุนจากหน่วยงานภายนอก" },
];

export default function F23FixedSection() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-gray-800 text-white flex items-center justify-center text-xs">1</span>
          การจัดสรรตามประกาศสถาบันฯ
        </h3>
        <span className="text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded">Fix Cost</span>
      </div>

      <table className="w-full text-sm text-left">
        <thead className="bg-gray-100 text-gray-600 font-medium">
          <tr>
            <th className="px-6 py-3 w-3/4">รายการ</th>
            <th className="px-6 py-3 text-right">จำนวนเงิน (บาท)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {fixedItems.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-6 py-3">
                <div className="text-gray-800 font-medium">{item.name}</div>
                {item.note && <div className="text-xs text-gray-500 mt-0.5 ml-4">{item.note}</div>}
              </td>
              <td className="px-6 py-3 text-right">
                <span className="text-gray-400">-</span>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-gray-50 font-bold border-t border-gray-200">
          <tr>
            <td className="px-6 py-3 text-right">รวมประมาณการรายจ่ายคงที่</td>
            <td className="px-6 py-3 text-right">0</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}