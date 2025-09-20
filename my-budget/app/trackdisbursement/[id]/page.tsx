"use client";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/shared/Sidebar";
import { FileText, ArrowLeft, Check, X, Paperclip } from "lucide-react";

// mock data
const disbursementDetails: any = {
  "1": {
    docNo: "BR-2025-001",
    date: "2025-09-15",
    amount: 15000,
    files: ["ใบเสร็จ.pdf", "ใบกำกับภาษี.pdf"],
  },
  "2": {
    docNo: "BR-2025-002",
    date: "2025-09-16",
    amount: 23000,
    files: ["สัญญา.pdf"],
  },
  "3": {
    docNo: "BR-2025-003",
    date: "2025-09-17",
    amount: 12000,
    files: ["บิลค่าเดินทาง.pdf"],
  },
};

export default function DisbursementDetail() {
  const { id } = useParams();
  const router = useRouter();

  const detail = disbursementDetails[id as string];

  if (!detail) {
    return <p className="p-6 text-black">ไม่พบข้อมูล</p>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 ml-64 bg-gray-50 text-black">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 hover:underline mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> กลับ
        </button>

        <h1 className="text-xl font-bold mb-4">📄 รายละเอียดการเบิกจ่าย</h1>

        <div className="bg-white p-6 rounded-lg shadow space-y-3">
          <p><strong>เลขที่เอกสาร:</strong> {detail.docNo}</p>
          <p><strong>วันที่:</strong> {detail.date}</p>
          <p><strong>จำนวนเงิน:</strong> {detail.amount.toLocaleString()} บาท</p>

          <div>
            <strong>ไฟล์แนบ:</strong>
            <ul className="list-disc ml-6 mt-2">
              {detail.files.map((file: string, index: number) => (
                <li key={index} className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4" /> {file}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-4 mt-6">
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Check className="w-4 h-4" /> อนุมัติ
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              <X className="w-4 h-4" /> ไม่อนุมัติ
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
