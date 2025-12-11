"use client";

import React, { useState, useEffect } from "react";
import ExpenseHeader from "../_components/ExpenseHeader";
import F3RevenueSection from "../_components/F3RevenueSection"; // Import Component รายรับ
import F3ExpenseSection from "../_components/F3ExpenseSection"; // Import Component รายจ่าย
import { SaveIcon } from "lucide-react"; // หรือ import จาก heroicons ก็ได้

export default function F3Page() {
  // 1. State สำหรับจัดการปีงบประมาณ
  const [selectedYearId, setSelectedYearId] = useState<number | null>(null);
  const [selectedYearVal, setSelectedYearVal] = useState<number>(new Date().getFullYear() + 543);
  
  // State สำหรับสถานะการบันทึก
  const [isSaving, setIsSaving] = useState(false);

  // 2. ฟังก์ชันรับค่าเมื่อมีการเปลี่ยนปี (ส่งให้ Header)
  const handleYearChange = (id: number | null, year: number) => {
    console.log("F-3 Page: ปีเปลี่ยนเป็น", year);
    setSelectedYearId(id);
    setSelectedYearVal(year);
    // ในอนาคต: เรียกฟังก์ชัน fetchF3Data(id) ตรงนี้เพื่อดึงข้อมูลเก่ามาแสดง
  };

  // 3. ฟังก์ชันจำลองการกดบันทึก
  const handleSave = async () => {
    setIsSaving(true);
    // จำลอง Delay การส่งข้อมูลไป Server
    await new Promise(resolve => setTimeout(resolve, 1500));
    alert(`บันทึกข้อมูลแผน F-3 ประจำปี ${selectedYearVal} เรียบร้อยแล้ว!`);
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24"> 
      {/* pb-24 เว้นที่ด้านล่างเผื่อสำหรับปุ่ม Save Bar */}

      {/* --- 1. Header --- */}
      <ExpenseHeader
        title="แบบ F-3: จัดสรรงบรายได้"
        subtitle="บันทึกและจัดสรรงบประมาณรายได้ให้กับแต่ละรายจ่าย"
        selectedYear={selectedYearVal}
        onYearChange={handleYearChange}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8 animate-fade-in">
        
        {/* --- 2. ส่วนรายรับ (Revenue) --- */}
        <section id="revenue-section">
           {/* ในอนาคตเราจะส่ง props: initialData={revenueData} เข้าไปตรงนี้ */}
           <F3RevenueSection />
        </section>

        {/* เส้นกั้นบางๆ */}
        <hr className="border-gray-200" />

        {/* --- 3. ส่วนรายจ่าย (Expense) --- */}
        <section id="expense-section">
           {/* ในอนาคตเราจะส่ง props: initialData={expenseData} เข้าไปตรงนี้ */}
           <F3ExpenseSection />
        </section>

      </div>

      {/* --- 4. Sticky Bottom Bar (ปุ่มบันทึก) --- */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-20">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-sm text-gray-500">
            <div>สถานะ: <span className="text-orange-500 font-medium">กำลังแก้ไข (Draft)</span></div>
            <div className="text-xs">แก้ไขล่าสุด: เมื่อสักครู่</div>
          </div>
          
          <div className="flex gap-3">
            <button 
              className="px-6 py-2.5 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium transition-colors"
              onClick={() => window.location.reload()} // ปุ่มยกเลิกจำลอง
            >
              ยกเลิก
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-8 py-2.5 rounded-lg text-white bg-blue-600 hover:bg-blue-700 font-medium shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <SaveIcon className="w-5 h-5" /> {/* ถ้าไม่มี icon ให้ลบออกหรือใช้ text แทน */}
                  บันทึกข้อมูล
                </>
              )}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}