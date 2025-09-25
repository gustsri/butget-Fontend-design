"use client";

import { useState } from "react";
import Sidebar from "@/components/shared/Sidebar";
import YearDropdown from "@/components/shared/year";
import RowItem from "@/components/plan/RowItem";
import mockExpenseData from "@/data/mockExpenseData.json";

export default function ExpensePage() {
  const [selectedYear, setSelectedYear] = useState<number>(2569);
  const yearData = mockExpenseData.find((d) => d.year === selectedYear);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 ml-64 p-6">
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-2 border-b border-gray-200 p-4">
            <YearDropdown onYearChange={(year) => setSelectedYear(year)} />
          </div>

          <div className="p-6">
            <div className="mb-8 text-gray-800">
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
                  คณะเทคโนโลยีสารสนเทศ
                </h1>
                <h2 className="text-xl font-semibold text-center text-gray-700 mb-1">
                  ประมาณการรายจ่ายเงินรายได้
                </h2>
                <p className="text-center text-gray-600">
                  ประจำปีงบประมาณ {selectedYear}
                </p>
              </div>

              {/* ตารางรายจ่าย */}
              <div className="space-y-6">
                {yearData?.sections.map((section, idx) => (
                  <div
                    key={idx}
                    className="divide-y divide-gray-200 bg-gray-50 rounded-lg"
                  >
                    <RowItem label={section.title} type="head" />
                    {section.items.map((item: any, i: number) => (
                      <div key={i} className="flex items-center">
                        {/* แสดงรหัสบัญชีถ้ามี */}
                        {item.accountCode && (
                          <span className="w-40 text-gray-500 text-sm font-mono px-2">
                            {item.accountCode}
                          </span>
                        )}
                        <div className="flex-1">
                          <RowItem
                            label={item.label}
                            value={item.value}
                            indent={item.indent}
                            highlight={item.highlight}
                            type={item.type}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
