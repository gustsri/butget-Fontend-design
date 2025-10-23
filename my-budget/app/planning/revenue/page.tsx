"use client";

import { useState } from "react";
import Sidebar from "@/components/shared/Sidebar";
import RowItem from "@/components/plan/RowItem";
import YearDropdown from "@/components/shared/year";
import mockRevenueData from "@/data/mockRevenueData.json";

export default function RevenuePage() {
  const [selectedYear, setSelectedYear] = useState<number>(2567);
  const yearData = mockRevenueData.find((d) => d.year === selectedYear);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
            {/* Top Bar with Logo and Title */}
            <div className="bg-gradient-to-r from-blue-800 to-blue-900 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-white">
                      ระบบสนับสนุนการจัดทำงบประมาณคณะเทคโนโลยีสารสนเทศ 
                      
                    </h1>
                  </div>
                </div>
                <YearDropdown
                  selectedYear={selectedYear}
                  onYearChange={(y) => setSelectedYear(Number(y))}
                />
              </div>
            </div>

            {/* Document Title Section */}
            <div className="bg-gradient-to-r from-blue-800 to-blue-900 px-8 py-5 border-b-4 border-orange-400">
              <h2 className="text-xl font-bold text-white text-center">
                จัดทำแผนงบประมาณรายรับ
              </h2>
              <p className="text-center text-blue-100 mt-2 text-sm">
                ประจำปีงบประมาณ พ.ศ. {selectedYear}
              </p>
            </div>
          </div>


          {/* Revenue Table */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            {yearData?.sections.map((section, idx) => (
              <div key={idx}>
                <RowItem label={section.title} type="head" />
                {section.items.map((item, i) => (
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

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>ระบบบริหารจัดการงบประมาณ - คณะเทคโนโลยีสารสนเทศ</p>
            <p className="mt-1">© 2567</p>
          </div>
        </div>
      </main>
    </div>
  );
}
