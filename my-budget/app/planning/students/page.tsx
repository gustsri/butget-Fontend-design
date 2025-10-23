"use client";
import { useState } from "react";
import Sidebar from "@/components/shared/Sidebar";
import YearDropdown from "@/components/shared/year";
import TableRow from "@/components/plan/TableRow";
import mockStudentData from "@/data/mockStudentData.json";

export default function Home() {
  const [editableCategory, setEditableCategory] = useState<"plan" | "actual">("plan");
  const [data, setData] = useState(mockStudentData);

  // group ข้อมูลตาม degree → department
  const groupedData = data.reduce((acc, item) => {
    if (!acc[item.degree]) acc[item.degree] = {};
    if (!acc[item.degree][item.department]) acc[item.degree][item.department] = [];
    acc[item.degree][item.department].push(item);
    return acc;
  }, {} as Record<string, Record<string, typeof data>>);

  const [openDegrees, setOpenDegrees] = useState<Record<string, boolean>>({});
  const [openDepts, setOpenDepts] = useState<Record<string, boolean>>({});

  const toggleDegree = (degree: string) => {
    setOpenDegrees((prev) => ({ ...prev, [degree]: !(prev[degree] ?? true) }));
  };

  const toggleDept = (dept: string) => {
    setOpenDepts((prev) => ({ ...prev, [dept]: !(prev[dept] ?? true) }));
  };

  const handleEdit = (id: number, field: string, value: number) => {
    setData((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: Number(value) } : row))
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 ml-64 p-6">
        <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header Card (รวม Top Bar + Faculty Header) */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
            {/* 🔹 Top Bar */}
            <div className="bg-gradient-to-r from-blue-800 to-blue-900 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h1 className="text-2xl font-bold text-white">
                    ระบบสนับสนุนการจัดทำงบประมาณคณะเทคโนโลยีสารสนเทศ
                  </h1>
                </div>

                <YearDropdown onYearChange={() => { }} />
              </div>
            </div>

            {/* 🔹 Faculty Header Section */}
            <div className="bg-gradient-to-r from-blue-800 to-blue-900 px-8 py-6 border-b-4 border-orange-400 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">ติดตามการใช้จ่ายงบประมาณ</h2>
                <h1 className="text-blue-200 text-xl mt-1">ประจำปีงบประมาณ 2567</h1>
              </div>

              {/* 🔹 ปุ่ม แผน / จริง */}
              <div className="flex items-center gap-3">
                <span className="font-medium text-blue-100">เลือกดูข้อมูล:</span>
                <button
                  onClick={() => setEditableCategory("plan")}
                  className={`px-4 py-2 font-medium text-sm rounded-md transition-colors duration-200 ${editableCategory === "plan"
                      ? "bg-white text-blue-700 shadow-md"
                      : "bg-blue-600 text-blue-100 hover:bg-blue-700"
                    }`}
                >
                  แผน
                </button>
                <button
                  onClick={() => setEditableCategory("actual")}
                  className={`px-4 py-2 font-medium text-sm rounded-md transition-colors duration-200 ${editableCategory === "actual"
                      ? "bg-white text-blue-700 shadow-md"
                      : "bg-blue-600 text-blue-100 hover:bg-blue-700"
                    }`}
                >
                  จริง
                </button>
              </div>
            </div>
          </div>


          {/* Main Content */}
          <div className="p-6">
            {Object.keys(groupedData).map((degree) => (
              <div key={degree} className="mb-8">
                {/* ปุ่ม degree */}
                <div
                  className="flex items-center gap-2 mb-4 cursor-pointer"
                  onClick={() => toggleDegree(degree)}
                >
                  <h2 className="text-lg font-bold text-gray-800">{degree}</h2>
                  <span className="text-gray-400">
                    {openDegrees[degree] ?? true ? "▲" : "▼"}
                  </span>
                </div>

                {(openDegrees[degree] ?? true) &&
                  Object.keys(groupedData[degree]).map((dept) => (
                    <div key={dept} className="bg-gray-50 rounded-lg p-6 mb-6 border">
                      {/* ปุ่ม department */}
                      <div
                        className="flex items-center gap-2 mb-4 cursor-pointer"
                        onClick={() => toggleDept(dept)}
                      >
                        <h3 className="text-base font-semibold text-gray-700">
                          วท.บ. ({dept})
                        </h3>
                        <span className="text-gray-400">
                          {openDepts[dept] ?? true ? "▲" : "▼"}
                        </span>
                      </div>

                      {(openDepts[dept] ?? true) && (
                        <div className="bg-white rounded-lg p-4">
                          <TableRow category="หมวด" type="head" />

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
                              highlight={item.categoryType === "plan" ? "plan" : "actual"}
                              editable={item.categoryType === editableCategory}
                              onEdit={(field, value) => handleEdit(item.id, field, value)}
                            />
                          ))}
                        </div>
                      )}
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
