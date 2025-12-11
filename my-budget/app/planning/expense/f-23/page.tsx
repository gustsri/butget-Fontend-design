"use client";

import React, { useState } from "react";
import ExpenseHeader from "../_components/ExpenseHeader";
import F23FixedSection from "../_components/F23FixedSection"; // Import Component ที่เราเพิ่งสร้าง
import F23VariableSection from "../_components/F23VariableSection"; // Import Component ที่เราเพิ่งสร้าง
import { BanknotesIcon, ChartPieIcon } from "@heroicons/react/24/outline";

export default function F23Page() {
  // State จัดการปี (เหมือนหน้าอื่น ๆ)
  const [selectedYearVal, setSelectedYearVal] = useState<number>(new Date().getFullYear() + 543);
  const [selectedYearId, setSelectedYearId] = useState<number | null>(null);

  const handleYearChange = (id: number | null, year: number) => {
    setSelectedYearId(id);
    setSelectedYearVal(year);
    // ในอนาคตใส่ Logic โหลดข้อมูลที่นี่
  };

  // Mock ยอดเงินรวม
  const totalIncome = 50000000;

  return (
    <div className="min-h-screen pb-20 bg-gray-50">
      {/* 1. Header */}
      <ExpenseHeader 
        title="แบบ F-23: สรุปงบประมาณรายจ่าย" 
        subtitle="สรุปยอดจัดสรรรายจ่าย แยกตามพันธกิจและนโยบาย"
        selectedYear={selectedYearVal}
        onYearChange={handleYearChange}
      />

      {/* Container หลัก */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* 2. Top Card Summary (ยอดเงินตั้งต้น) */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-6 flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
              <BanknotesIcon className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-gray-500 text-sm font-medium">รายได้ทุกประเภท (หลังหัก 35% เข้าส่วนกลางแล้ว)</h2>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {totalIncome.toLocaleString()} <span className="text-base font-normal text-gray-500">บาท</span>
              </p>
            </div>
          </div>
          <div className="text-right">
             <div className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full inline-block">
               รอการจัดสรร
             </div>
          </div>
        </div>

        {/* 3. เรียกใช้ Component ย่อย */}
        <F23FixedSection />
        
        <F23VariableSection />

        {/* 4. Grand Total Footer */}
        <div className="bg-gray-900 text-white rounded-xl p-6 flex justify-between items-center shadow-lg animate-fade-in-up">
           <div className="flex items-center gap-3">
             <ChartPieIcon className="w-8 h-8 text-blue-400" />
             <div>
               <h3 className="text-lg font-bold">รวมประมาณการรายจ่ายทั้งสิ้น (1) + (2)</h3>
               <p className="text-sm text-gray-400">ต้องเท่ากับรายได้สุทธิ</p>
             </div>
           </div>
           <div className="text-3xl font-bold">
             0 <span className="text-lg font-normal text-gray-400">บาท</span>
           </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-4">
          หมายเหตุ : การตั้งงบประมาณให้ปัดเศษเป็นจำนวนเต็ม 3 ตัวท้าย
        </p>

      </div>
    </div>
  );
}