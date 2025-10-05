"use client";

import { useState } from "react";
import Sidebar from "@/components/shared/Sidebar";
import YearDropdown from "@/components/shared/year";
import mockRevenueData from "@/data/mockRevenueData.json";

export default function RevenueAdjustPage() {
  const [selectedYear, setSelectedYear] = useState<number>(2567);
  const yearData = mockRevenueData.find((d) => d.year === selectedYear);
  const [sections, setSections] = useState(yearData?.sections || []);
  const [reason, setReason] = useState("");

  const totalOld = sections.reduce(
    (sum, s) => sum + s.items.reduce((x, i) => x + (i.value ?? 0), 0),
    0
  );
  const totalNew = sections.reduce(
    (sum, s) =>
      sum +
      s.items.reduce((x, i) => x + (i.newValue ?? i.value ?? 0), 0),
    0
  );
  const diff = totalNew - totalOld;
  const diffPercent =
    totalOld > 0 ? ((diff / totalOld) * 100).toFixed(2) : "0.00";

  const handleChange = (sectionTitle: string, itemLabel: string, value: number) => {
    setSections((prev) =>
      prev.map((sec) =>
        sec.title === sectionTitle
          ? {
              ...sec,
              items: sec.items.map((item) =>
                item.label === itemLabel ? { ...item, newValue: value } : item
              ),
            }
          : sec
      )
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      {/* Main */}
      <main className="flex-1 ml-64 p-6">
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header: YearDropdown */}
          <div className="flex items-center gap-2 border-b border-gray-200 p-4">
            <YearDropdown onYearChange={(year) => setSelectedYear(year)} />
          </div>

          {/* Main Content */}
          <div className="p-6">
            {/* Header Gradient */}
            <div className="bg-gradient-to-r from-blue-800 to-blue-900 text-white p-6">
              <h1 className="text-2xl font-bold text-center">
                คณะเทคโนโลยีสารสนเทศ
              </h1>
              <h2 className="text-center mt-2 text-blue-100">
                การปรับแผนประมาณการรายรับเงินรายได้
              </h2>
              <p className="text-center mt-2 text-blue-100">
                ประจำปีงบประมาณ {selectedYear}
              </p>
            </div>

            {/* ตาราง */}
            <div className="space-y-6 mt-6 text-gray-800">
              {sections.map((section) => (
                <div
                  key={section.title}
                  className="divide-y divide-gray-200 bg-gray-50 rounded-lg"
                >
                  {/* หัวข้อใหญ่ */}
                  <div className="bg-gray-100 font-semibold text-gray-800 px-3 py-2 rounded border border-gray-200">
                    {section.title}
                  </div>

                  {/* รายการย่อย */}
                  {section.items.map((item) => {
                    const isChanged =
                      item.newValue !== undefined &&
                      item.newValue !== item.value;

                    // สีพื้นหลังเฉพาะ highlight
                    let rowBg = "";
                    if (item.highlight === "deduct") rowBg = "bg-red-50";
                    if (item.highlight === "total") rowBg = "bg-green-50";

                    return (
                      <div
                        key={item.label}
                        className={`grid grid-cols-3 border-b items-center py-2 ${item.indent ? "pl-6" : ""
                          } ${rowBg}`}
                      >
                        <span className="font-medium">{item.label}</span>

                        {/* ค่าด้านซ้าย (แผนเดิม) */}
                        <span className="text-right pr-4">
                          {item.value
                            ? Number(item.value).toLocaleString()
                            : "-"}
                        </span>

                        {/* ช่องปรับค่า */}
                        <input
                          type="number"
                          className={`text-right border rounded p-1 pr-3 w-full appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400 ${isChanged ? "bg-yellow-100 border-yellow-400" : ""
                            }`}
                          value={item.newValue ?? item.value ?? 0}
                          onChange={(e) =>
                            handleChange(
                              section.title,
                              item.label,
                              Number(e.target.value)
                            )
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* รวมผล */}
            <div className="mt-8 border-t pt-4">
              <div className="flex justify-between font-medium">
                <span>รวมก่อนปรับ:</span>
                <span>{Number(totalOld).toLocaleString()} บาท</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>รวมหลังปรับ:</span>
                <span>
                  {Number(totalNew).toLocaleString()} บาท
                  <span
                    className={`ml-2 ${diff > 0
                        ? "text-green-600"
                        : diff < 0
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}
                  >
                    ({diff > 0 ? "+" : ""}
                    {Number(diff).toLocaleString()} / {diffPercent}%)
                  </span>
                </span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
                <div
                  className={`h-3 rounded-full transition-all duration-700 ${diff > 0
                      ? "bg-green-500"
                      : diff < 0
                        ? "bg-red-500"
                        : "bg-gray-400"
                    }`}
                  style={{
                    width: `${Math.min(
                      Math.abs((totalNew / totalOld) * 100),
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* เหตุผลการปรับ */}
            <div className="mt-6">
              <label className="block font-semibold mb-2 text-gray-800">
                📝 เหตุผลการปรับแผน
              </label>
              <textarea
                rows={4}
                className="w-full border rounded p-3 focus:ring-2 focus:ring-blue-400"
                placeholder="ระบุเหตุผล เช่น ปรับตามรายรับใหม่จากภาคพิเศษ..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
