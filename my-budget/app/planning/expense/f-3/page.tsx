"use client";

import React, { useState, useEffect } from "react";
import ExpenseHeader from "../_components/ExpenseHeader";
import { DocumentChartBarIcon, ArrowDownTrayIcon, PrinterIcon } from "@heroicons/react/24/outline";
import RevenueTable from "../_components/RevenueTable";
import F3RevenueSection from "../_components/F3RevenueSection";
// สมมติ Type ของข้อมูล F-5 (ปรับตาม Database จริงของคุณ)
type BudgetSummary = {
  category: string;
  amount: number;
  percentage: number;
};

export default function F5Page() {
  // 1. State สำหรับจัดการปีงบประมาณ
  const [selectedYearId, setSelectedYearId] = useState<number | null>(null);
  const [selectedYearVal, setSelectedYearVal] = useState<number>(new Date().getFullYear() + 543);

  // 2. State สำหรับข้อมูลในหน้า F-5
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<BudgetSummary[]>([]);

  // 3. ฟังก์ชันรับค่าเมื่อมีการเปลี่ยนปี (ส่งให้ Header)
  const handleYearChange = (id: number | null, year: number) => {
    setSelectedYearId(id);
    setSelectedYearVal(year);
    // เมื่อเปลี่ยนปี ให้สั่งโหลดข้อมูลใหม่
    fetchF5Data(id, year);
  };

  // ฟังก์ชันจำลองการดึงข้อมูล (Replace with your API call)
  const fetchF5Data = async (yearId: number | null, year: number) => {
    if (!yearId) {
      setData([]); // ถ้าไม่มี ID (ปีใหม่) ให้เคลียร์ค่า
      return;
    }

    setIsLoading(true);
    try {
      // simulate delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Mock Data (ข้อมูลตัวอย่าง)
      const mockData: BudgetSummary[] = [
        { category: "งบดำเนินการ", amount: 1500000, percentage: 40 },
        { category: "งบลงทุน", amount: 800000, percentage: 25 },
        { category: "งบอุดหนุน", amount: 500000, percentage: 15 },
        { category: "งบรายจ่ายอื่น", amount: 400000, percentage: 20 },
      ];
      setData(mockData);
    } catch (error) {
      console.error("Error fetching F-5:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // โหลดข้อมูลครั้งแรก ถ้ามีค่าเริ่มต้น
  useEffect(() => {
    if (selectedYearId) {
      fetchF5Data(selectedYearId, selectedYearVal);
    }
  }, []);

  return (
    <div className="min-h-screen pb-10">
      {/* 4. เรียกใช้ ExpenseHeader พร้อมส่ง Props จัดการปี */}
      <ExpenseHeader
        title="แบบ F-5: สรุปงบประมาณ"
        subtitle="รายงานสรุปประมาณการรายรับ-รายจ่ายประจำปี"
        selectedYear={selectedYearVal}    // ส่งค่าปีปัจจุบันไปแสดง
        onYearChange={handleYearChange}   // ส่งฟังก์ชันไปรอรับค่าเมื่อ user เปลี่ยนปี
      />

      {/* ส่วนแสดงเนื้อหาหลัก */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6 animate-fade-in">

        {/* หัวกระดาษรายงาน */}
        <div className="flex justify-between items-start mb-8 border-b pb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800">สรุปภาพรวมงบประมาณรายจ่าย</h2>
            <p className="text-gray-500 text-sm">
              ประจำปีงบประมาณ <span className="text-blue-600 font-bold text-lg">{selectedYearVal}</span>
            </p>
          </div>

        </div>
        {/* <RevenueTable>
        </RevenueTable> */}
        <F3RevenueSection></F3RevenueSection>
      </div>

    </div>
  );
}