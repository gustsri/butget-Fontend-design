"use client";
import { useState } from "react";
import Sidebar from "@/components/shared/Sidebar";
import YearDropdown from "@/components/shared/year";
import DocumentList from "@/components/approval/appdisbursement";
import mockDisbursementData from "@/data/mockDisbursementData.json";

export default function DisbursementPage() {
  const currentYear = new Date().getFullYear() + 543;

  // ดึงปีทั้งหมดจาก mock
  const years = [...new Set(mockDisbursementData.map((doc) => Number(doc.year)))];
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);

  // ถ้ามีปีปัจจุบันใน mock → default = ปีปัจจุบัน, ถ้าไม่มี → default = "ทั้งหมด"
  const [selectedYear, setSelectedYear] = useState<number | "ทั้งหมด">(
    years.includes(currentYear) ? currentYear : "ทั้งหมด"
  );

  const handleDocumentClick = (documentId: number) => {
    window.location.href = `/appdisbursement/${documentId}`;
  };

  // filter ตามปี
  const filteredDocuments =
    selectedYear && selectedYear !== "ทั้งหมด"
      ? mockDisbursementData.filter((doc) => Number(doc.year) === selectedYear)
      : mockDisbursementData;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 ml-64 p-6">
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header Card (Top Bar + Section Header) */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
            {/* 🔹 Top Bar */}
            <div className="bg-gradient-to-r from-blue-800 to-blue-900 px-8 py-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">
                ระบบสนับสนุนการจัดทำงบประมาณคณะเทคโนโลยีสารสนเทศ
              </h1>

              <YearDropdown
                selectedYear={selectedYear}
                onYearChange={(year) => setSelectedYear(year)}
                startYear={minYear}
                endYear={maxYear}
              />
            </div>

            {/* 🔹 Section Header */}
            <div className="bg-gradient-to-r from-blue-800 to-blue-900 px-8 py-5 border-b-4 border-orange-400 text-center">
              <h2 className="text-xl font-bold text-white">
                อนุมัติการเบิกจ่ายงบประมาณ
              </h2>
              <p className="text-blue-100 mt-2 text-m">
                จัดการและอนุมัติคำขอเบิกจ่ายงบประมาณ
              </p>
            </div>
          </div>


          {/* Filter Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <YearDropdown
                selectedYear={selectedYear}
                onYearChange={(year) => setSelectedYear(year)}
                startYear={minYear}
                endYear={maxYear}
              />
              <div className="text-sm text-gray-500">
                รออนุมัติ {filteredDocuments.filter((doc) => doc.status === "pending").length} เอกสาร
              </div>
            </div>
          </div>

          {/* Document List */}
          <div className="p-6">
            <DocumentList
              documents={filteredDocuments}
              onDocumentClick={handleDocumentClick}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
