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
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-800 to-blue-900 text-white p-6">
            <h1 className="text-2xl font-bold text-center">เอกสารเบิกจ่ายที่สามารถอนุมัติได้</h1>
            <p className="text-center mt-2 text-blue-100">จัดการและอนุมัติคำขอเบิกจ่ายงบประมาณ</p>
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
