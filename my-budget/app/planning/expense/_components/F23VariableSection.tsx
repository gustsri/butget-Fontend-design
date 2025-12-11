"use client";

import React from "react";

// Mock Data
const variableSections = [
  { 
    id: "edu", 
    name: "1) ด้านการศึกษา (Education)", 
    items: [
      { name: "กิจกรรมหลัก จัดการศึกษาด้านวิทยาศาสตร์และเทคโนโลยี" },
      { name: "สาขา เทคโนโลยีสารสนเทศ" },
      { name: "กิจกรรมรอง สนับสนุนการจัดการศึกษา" },
      { name: "- กิจกรรม บริการวิชาการ" },
      { name: "- กิจกรรม พัฒนาคุณภาพนักศึกษา" },
    ]
  },
  { id: "res", name: "2) ด้านการวิจัย (Academic)", items: [] },
  { id: "ind", name: "3) ด้านตอบโจทย์ภาคอุตสาหกรรม (Industrial)", items: [] },
  { id: "soc", name: "4) ด้านสังคม (Social)", items: [] },
];

export default function F23VariableSection() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-gray-800 text-white flex items-center justify-center text-xs">2</span>
          การจัดสรรด้านต่าง ๆ ดังนี้
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left min-w-[900px]">
          <thead className="bg-gray-100 text-gray-600 font-medium border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 w-[30%]">ด้าน / กิจกรรม</th>
              <th className="px-2 py-3 text-center w-[10%]">จัดสรรร้อยละ</th>
              <th className="px-2 py-3 text-right w-[15%] text-orange-600 bg-orange-50">จุดเน้น</th>
              <th className="px-2 py-3 text-right w-[15%] text-green-600 bg-green-50">โครงการ OKR</th>
              <th className="px-2 py-3 text-right w-[15%] text-purple-600 bg-purple-50">ค่าใช้จ่ายบริหาร</th>
              <th className="px-4 py-3 text-right w-[15%] font-bold">รวม (บาท)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {variableSections.map((section) => (
              <React.Fragment key={section.id}>
                {/* Header Row */}
                <tr className="bg-blue-50/50">
                  <td className="px-4 py-3 font-bold text-gray-900">{section.name}</td>
                  <td className="px-2 py-3 text-center">
                    <div className="relative inline-block">
                        <input 
                            type="number" 
                            className="w-16 text-center border border-gray-300 rounded px-1 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="0"
                        />
                        <span className="absolute right-1 top-1.5 text-xs text-gray-400">%</span>
                    </div>
                  </td>
                  <td className="px-2 py-3 text-right text-orange-600 font-medium bg-orange-50/30">#DIV/0!</td>
                  <td className="px-2 py-3 text-right text-green-600 font-medium bg-green-50/30">#DIV/0!</td>
                  <td className="px-2 py-3 text-right text-purple-600 font-medium bg-purple-50/30">#DIV/0!</td>
                  <td className="px-4 py-3 text-right font-bold">-</td>
                </tr>
                
                {/* Sub Items */}
                {section.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-2 pl-8 border-l-2 border-transparent hover:border-blue-500">
                        {item.name}
                      </td>
                      <td className="px-2 py-2"></td>
                      <td className="px-2 py-2 text-right text-gray-400">-</td>
                      <td className="px-2 py-2 text-right text-gray-400">-</td>
                      <td className="px-2 py-2 text-right text-gray-400">-</td>
                      <td className="px-4 py-2 text-right text-gray-400">-</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
          
          <tfoot className="border-t-2 border-gray-300 bg-gray-50 font-bold text-gray-900">
            <tr>
                <td className="px-4 py-3 text-right">รวมจัดสรรทุกด้าน (เป้าหมาย 100%)</td>
                <td className="px-2 py-3 text-center text-red-600">0%</td>
                <td colSpan={3}></td>
                <td className="px-4 py-3 text-right underline decoration-double">-</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}