"use client";

import { useState } from "react";
import Sidebar from "@/components/shared/Sidebar";
import YearDropdown from "@/components/shared/year";
import RowItem from "@/components/plan/RowItem";
import mockRevenueData from "@/data/mockRevenueData.json";

export default function RevenuePage() {
  const [selectedYear, setSelectedYear] = useState<number>(2567);

  // ดึงข้อมูลปีที่เลือกจาก mockRevenueData
  const yearData = mockRevenueData.find((d) => d.year === selectedYear);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 ml-64 p-6">
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header: YearDropdown */}
          <div className="flex items-center gap-2 border-b border-gray-200 p-4">
            <YearDropdown onYearChange={(year) => setSelectedYear(year)} />
          </div>

          {/* Main Content */}
          <div className="p-6">
            <div className="mb-8 text-gray-800">
              {/* Header ของหน้า */}
              <div className="bg-gradient-to-r from-blue-800 to-blue-900 text-white p-6">
                 <h1 className="text-2xl font-bold text-center">
                  คณะเทคโนโลยีสารสนเทศ
                </h1>
                <h2 className="text-center mt-2 text-blue-100">
                  ประมาณการรายรับเงินรายได้
                </h2>
                <p className="text-center mt-2 text-blue-100">
                  ประจำปีงบประมาณ {selectedYear}
                </p>
              </div>

              {/* รายการรายรับ (loop JSON) */}
              <div className="space-y-6">
                {yearData?.sections.map((section, idx) => (
                  <div
                    key={idx}
                    className="divide-y divide-gray-200 bg-gray-50 rounded-lg"
                  >
                    {/* หัวข้อใหญ่ */}
                    <RowItem label={section.title} type="head" />

                    {/* รายการย่อย */}
                    {section.items.map((item: any, i: number) => (
                      <RowItem
                        key={i}
                        label={item.label}
                        value={item.value}
                        indent={item.indent}
                        highlight={item.highlight}
                        type={item.type}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* พื้นที่ Section อื่น ๆ */}
            <div className="mb-8">
              {/* <p>Section จะอยู่ที่นี่</p> */}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
