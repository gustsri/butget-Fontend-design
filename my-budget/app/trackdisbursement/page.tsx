"use client";
import { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/shared/Sidebar";
import YearDropdown from "@/components/shared/year";
import { Search, FileText } from "lucide-react";

// Mock data สำหรับการเบิกจ่าย
import mockTrackingData from "@/data/mockTrackingData.json";

export default function TrackingPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [filterYear, setFilterYear] = useState<number>();
  const [documents] = useState<typeof mockTrackingData>(
    mockTrackingData.filter((doc) => doc.type === "expense_request")
  );

  // Filter documents
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.submittedBy.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" || doc.currentStatus === selectedStatus;

    const matchesYear = !filterYear || doc.year === filterYear;

    return matchesSearch && matchesStatus && matchesYear;
  });

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <Sidebar />

      <main className="flex-1 ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
            {/* 🔹 Top Bar */}
            <div className="bg-gradient-to-r from-blue-800 to-blue-900 px-8 py-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">ระบบสนับสนุนการจัดทำงบประมาณคณะเทคโนโลยีสารสนเทศ</h1>
              </div>

              <YearDropdown
                selectedYear={filterYear}
                onYearChange={setFilterYear}
                startYear={2566}
                endYear={2570}
              />
            </div>

            {/* 🔹 Faculty Header Section */}
            <div className="bg-gradient-to-r from-blue-800 to-blue-900 px-8 py-5 border-b-4 border-orange-400">
              <h2 className="text-xl font-bold text-white text-center">
                ติดตามการอนุมัติเอกสาร
              </h2>
              <p className="text-blue-100 mt-2 text-center text-m">
                ตรวจสอบสถานะการอนุมัติโครงการและการเบิกจ่ายต่างๆ
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="ค้นหาการเบิกจ่าย..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="all">ทุกสถานะ</option>
                  <option value="approved">อนุมัติแล้ว</option>
                  <option value="rejected">ไม่อนุมัติ</option>
                </select>

                {/* Year Filter */}
                <YearDropdown
                  selectedYear={filterYear}
                  onYearChange={setFilterYear}
                  startYear={2566}
                  endYear={2570}
                  placeholder="เลือกปีงบประมาณ"
                />
              </div>
            </div>
          </div>

          {/* Document List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-100 text-gray-900">
                <tr>
                  <th className="px-6 py-3">เลขที่เอกสาร</th>
                  <th className="px-6 py-3">เรื่อง</th>
                  <th className="px-6 py-3">ผู้ยื่น</th>
                  <th className="px-6 py-3">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((doc) => (
                  <tr
                    key={doc.id}
                    className="border-t hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-6 py-3">
                      <Link href={`/trackdisbursement/${doc.id}`}>
                        {doc.documentNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-3">
                      <Link href={`/trackdisbursement/${doc.id}`}>
                        {doc.title}
                      </Link>
                    </td>
                    <td className="px-6 py-3">{doc.submittedBy}</td>
                    <td className="px-6 py-3">{doc.currentStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredDocuments.length === 0 && (
              <p className="p-6 text-center text-gray-500">
                ไม่พบข้อมูลการเบิกจ่าย
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
