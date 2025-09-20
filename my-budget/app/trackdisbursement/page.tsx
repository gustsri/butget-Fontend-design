"use client";
import Link from "next/link";
import Sidebar from "@/components/shared/Sidebar";
import { FileText, Calendar } from "lucide-react";

// mock data
const disbursementDocs = [
  { id: "1", docNo: "BR-2025-001", date: "2025-09-15", amount: 15000 },
  { id: "2", docNo: "BR-2025-002", date: "2025-09-16", amount: 23000 },
  { id: "3", docNo: "BR-2025-003", date: "2025-09-17", amount: 12000 },
];

export default function DisbursementPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 ml-64 bg-gray-50 text-black">
        <h1 className="text-2xl font-bold mb-6">📑 รายการเบิกจ่าย</h1>

        <div className="space-y-4">
          {disbursementDocs.map((doc) => (
            <Link
              key={doc.id}
              href={`/trackdisbursement/${doc.id}`}
              className="block p-4 bg-white rounded-lg shadow hover:bg-gray-100 transition"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    {doc.docNo}
                  </p>
                  <p className="text-sm flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> {doc.date}
                  </p>
                </div>
                <p className="font-bold">{doc.amount.toLocaleString()} บาท</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
