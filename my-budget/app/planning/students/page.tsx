"use client";
import { useState } from "react";
import Sidebar from "@/components/shared/Sidebar";
import YearDropdown from "@/components/shared/year";
import TableRow from "@/components/plan/TableRow";
import mockStudentData from "@/data/mockStudentData.json";

export default function Home() {
  const [editableCategory, setEditableCategory] = useState<"plan" | "actual">(
    "plan"
  );
  const [data, setData] = useState(mockStudentData);

  // group ข้อมูลตาม degree → department
  const groupedData = data.reduce((acc, item) => {
    if (!acc[item.degree]) acc[item.degree] = {};
    if (!acc[item.degree][item.department])
      acc[item.degree][item.department] = [];
    acc[item.degree][item.department].push(item);
    return acc;
  }, {} as Record<string, Record<string, typeof data>>);

  const handleEdit = (id: number, field: string, value: number) => {
    setData((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, [field]: Number(value) } : row
      )
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 ml-64 p-6">
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header: เลือกว่าจะให้แก้ แผน หรือ จริง */}
          <div className="flex items-center gap-2 border-b border-gray-200 p-4">
            <YearDropdown onYearChange={() => {}} />

            <span className="font-medium">เลือกแก้ไข:</span>
            <button
              onClick={() => setEditableCategory("plan")}
              className={`px-6 py-2 font-medium text-sm rounded-md transition-colors duration-200 ${
                editableCategory === "plan"
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              แผน
            </button>
            <button
              onClick={() => setEditableCategory("actual")}
              className={`px-6 py-2 font-medium text-sm rounded-md transition-colors duration-200 ${
                editableCategory === "actual"
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              จริง
            </button>
          </div>

          {/* Main Content */}
          <div className="p-6">
            {Object.keys(groupedData).map((degree) => (
              <div key={degree} className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  {degree}
                </h2>

                {Object.keys(groupedData[degree]).map((dept) => (
                  <div
                    key={dept}
                    className="overflow-x-auto bg-white rounded-lg shadow mb-6"
                  >
                    <h3 className="text-lg font-semibold text-gray-700 p-2">
                      {dept}
                    </h3>
                    <div className="min-w-full">
                      {/* Header */}
                      <TableRow category="หมวด" type="head" />

                      {/* แสดงทั้ง แผน และ จริง */}
                      {groupedData[degree][dept].map((item) => (
                        <TableRow
                          key={item.id}
                          category={item.category}
                          year1={item.year1}
                          year2={item.year2}
                          year3={item.year3}
                          year4={item.year4}
                          year5={item.year5}
                          year6={item.year6}
                          total={item.total}
                          highlight={
                            item.categoryType === "plan" ? "plan" : "actual"
                          }
                          editable={item.categoryType === editableCategory}
                          onEdit={(field, value) =>
                            handleEdit(item.id, field, value)
                          }
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
