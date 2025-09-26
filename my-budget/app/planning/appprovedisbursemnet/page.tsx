"use client";
import Link from "next/link";
import Sidebar from "@/components/shared/Sidebar";
import { FileText, CheckCircle } from "lucide-react";

// mock data รายการเอกสารที่อนุมัติแล้ว
const approvedDocs = [
  { id: "1", docNo: "BR-2025-001", date: "2025-09-15" },
  { id: "2", docNo: "BR-2025-002", date: "2025-09-17" },
];

export default function ApprovedList() {
  return (
    <div className="flex min-h-screen bg-gray-50 text-black">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 ml-64 p-6">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <CheckCircle className="text-green-600 w-7 h-7" />
          เอกสารที่รอส่งใบเสร็จ
        </h1>

        <div className="bg-white shadow rounded-2xl p-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b text-left">
                <th className="p-3">เลขที่เอกสาร</th>
                <th className="p-3">วันที่อนุมัติ</th>
                <th className="p-3">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {approvedDocs.map((doc) => (
                <tr key={doc.id} className="border-b">
                  <td className="p-3">{doc.docNo}</td>
                  <td className="p-3">{doc.date}</td>
                  <td className="p-3">
                    <Link
                      href={`/planning/appprovedisbursemnet/${doc.id}`}
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <FileText className="w-4 h-4" />
                      ดูรายละเอียด / ส่งเอกสาร
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
