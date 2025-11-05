"use client";

import { useMemo, useState } from "react";
import Sidebar from "@/components/shared/Sidebar";
import RowItem from "@/components/plan/RowItem";
import YearDropdown from "@/components/shared/year";
import mockRevenueData from "@/data/mockRevenueData.json";

type Item = {
  label: string;
  value?: number;
  indent?: boolean;
  highlight?: "deduct" | "total";
  type?: "row" | "head";
};

type Section = {
  title: string;
  items: Item[];
};

type YearBlock = {
  year: number;
  sections: Section[];
};

export default function RevenuePage() {
  // เก็บข้อมูลเป็น state เพื่อให้แก้ไขได้
  const [data, setData] = useState<YearBlock[]>(mockRevenueData as YearBlock[]);
  const [selectedYear, setSelectedYear] = useState<number>(2567);

  const yearData = useMemo(
    () => data.find((d) => d.year === selectedYear),
    [data, selectedYear]
  );

  // อัปเดตค่า value แบบ immutable
  const handleEdit = (sectionIdx: number, itemIdx: number, nextValue: number) => {
    setData((prev) =>
      prev.map((y) => {
        if (y.year !== selectedYear) return y;
        return {
          ...y,
          sections: y.sections.map((s, sIdx) => {
            if (sIdx !== sectionIdx) return s;
            return {
              ...s,
              items: s.items.map((it, iIdx) => {
                if (iIdx !== itemIdx) return it;
                return { ...it, value: nextValue };
              }),
            };
          }),
        };
      })
    );
  };

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
            {yearData?.sections.map((section, sIdx) => (
              <div key={sIdx}>
                <RowItem label={section.title} type="head" />
                {section.items.map((item, iIdx) => (
                  <RowItem
                    key={`${sIdx}-${iIdx}`}
                    label={item.label}
                    value={item.value}
                    indent={!!item.indent}
                    highlight={item.highlight}
                    type={item.type}
                    editable={item.type !== "head"} // ให้แก้ไขได้ทุกรายการที่ไม่ใช่ head
                    onEdit={(val) => handleEdit(sIdx, iIdx, val)}
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
