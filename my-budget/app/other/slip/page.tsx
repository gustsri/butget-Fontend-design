"use client";
import { useState } from "react";
import Sidebar from "@/components/shared/Sidebar";
import YearDropdown from "@/components/shared/year";
import { Calendar, DollarSign, FileText } from "lucide-react";

// Mock data โครงการขอจัดทำป้ายไวนิล
const mockProjectData = [
  {
    id: 1,
    title: "คำขอเบิกจ่ายค่าป้ายไวนิล",
    description: "เอกสารคำขอเบิกจ่ายค่าป้ายไวนิล",
    requester: "นายเอ (งานประชาสัมพันธ์)",
    department: "งานประชาสัมพันธ์",
    date: "10 มกราคม 2568",
    term: "ไตรมาสที่ 1/2568",
    budget: 3000,
    status: "pending",
    docCode: "PAY-0003",
    year: 2568,
  },
  {
    id: 2,
    title: "คำขอเบิกจ่ายค่าป้ายไวนิลกิจกรรมวันแม่แห่งชาติ",
    description: "เอกสารคำขอเบิกจ่ายค่าป้ายกิจกรรมวันแม่แห่งชาติ",
    requester: "นางสาวบี (งานกิจกรรม)",
    department: "งานกิจกรรม",
    date: "15 สิงหาคม 2568",
    term: "ไตรมาสที่ 3/2568",
    budget: 4500,
    status: "approved",
    docCode: "PAY-0004",
    year: 2568,
  },
];

export default function DisbursementPage() {
  const currentYear = new Date().getFullYear() + 543;
  const years = [...new Set(mockProjectData.map((doc) => Number(doc.year)))];
  const [selectedYear, setSelectedYear] = useState<number | "ทั้งหมด">(
    years.includes(currentYear) ? currentYear : "ทั้งหมด"
  );

  const filteredDocuments =
    selectedYear && selectedYear !== "ทั้งหมด"
      ? mockProjectData.filter((doc) => Number(doc.year) === selectedYear)
      : mockProjectData;

  const handleDocumentClick = (id: number) => {
    window.location.href = `/other/slip/${id}`;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 ml-64 p-6">
        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-800 to-blue-900 text-white p-6">
            <h1 className="text-2xl font-bold text-center">
              โครงการเสนอขออนุมัติป้ายไวนิล
            </h1>
            <p className="text-center mt-2 text-blue-100">
              ตรวจสอบและอนุมัติโครงการที่เสนอขอจัดทำป้ายไวนิล
            </p>
          </div>

          {/* Filter */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <YearDropdown
              selectedYear={selectedYear}
              onYearChange={(year) => setSelectedYear(year)}
              startYear={Math.min(...years)}
              endYear={Math.max(...years)}
            />
            <div className="text-sm text-gray-500">
              รออนุมัติ{" "}
              {filteredDocuments.filter((doc) => doc.status === "pending").length}{" "}
              เอกสาร
            </div>
          </div>

          {/* Card List */}
          <div className="p-6 space-y-4">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                onClick={() => handleDocumentClick(doc.id)}
                className="flex justify-between items-center border border-gray-200 rounded-xl p-5 hover:shadow-md transition cursor-pointer"
              >
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      {doc.title}
                    </h2>
                    <p className="text-sm text-gray-500">{doc.description}</p>

                    <div className="flex items-center text-gray-600 text-sm mt-2 space-x-4">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {doc.term}
                      </span>
                      <span className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />฿
                        {doc.budget.toLocaleString()}
                      </span>
                    </div>

                    <div className="text-xs text-gray-400 mt-2">
                      สร้างเมื่อ: {doc.date}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      doc.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {doc.status === "approved" ? "อนุมัติแล้ว" : "รออนุมัติ"}
                  </span>
                  <div className="text-xs text-gray-400 mt-2">
                    รหัสเบิกจ่าย: {doc.docCode}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
