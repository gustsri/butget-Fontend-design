"use client";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  FileText,
  ArrowLeft,
  Paperclip,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Sidebar from "@/components/shared/Sidebar";

// mock data
const disbursementDetails: any = {
  "3": {
    title: "คำขอเบิกจ่ายค่าป้ายไวนิล",
    date: "2025-09-17",
    amount: 3000,
    files: ["บิลป้ายไวนิล.pdf"],
  },
};

export default function DisbursementDetail() {
  const { id } = useParams();
  const router = useRouter();
  const detail = disbursementDetails[id as string];

  // ✅ state สำหรับ modal และข้อมูลการคำนวณ
  const [showModal, setShowModal] = useState(false);
  const [inputAmount, setInputAmount] = useState<number | "">("");
  const [resultMessage, setResultMessage] = useState<string>("");

  if (!detail) {
    return <p className="p-6 text-black">ไม่พบข้อมูล</p>;
  }

  // ✅ ฟังก์ชันคำนวณผลต่าง
  const handleApprove = () => {
    if (inputAmount === "") {
      setResultMessage("กรุณากรอกจำนวนเงินก่อนดำเนินการ");
      return;
    }

    const approvedAmount = Number(inputAmount);
    const budget = detail.amount;
    const diff = approvedAmount - budget;

    if (diff > 0) {
      setResultMessage(
        `ยอดเงินเกินงบประมาณ ${diff.toLocaleString()} บาท ✅ ส่งให้เจ้าหน้าที่แผนปรับแก้`
      );
    } else if (diff < 0) {
      setResultMessage(
        `ยอดเงินไม่ถึงงบ เหลือคืน ${Math.abs(diff).toLocaleString()} บาท ✅`
      );
    } else {
      setResultMessage("ยอดตรงกับงบประมาณ ✅ ไม่มีเงินเหลือหรือเกิน");
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 ml-64 bg-gray-50 text-black">
        {/* ปุ่มกลับ */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 hover:underline mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> กลับ
        </button>

        <h1 className="text-xl font-bold mb-4">📄 รายละเอียดการเบิกจ่าย</h1>

        {/* 🔹 กล่องเนื้อหา 2 คอลัมน์ */}
        <div className="bg-white p-6 rounded-lg shadow flex flex-col lg:flex-row gap-6">
          {/* ✅ คอลัมน์ซ้าย */}
          <div className="flex-1 space-y-3 border-r border-gray-200 pr-6">
            <p>
              <strong>เลขที่เอกสาร:</strong> {detail.title}
            </p>
            <p>
              <strong>วันที่:</strong> {detail.date}
            </p>
            <p>
              <strong>จำนวนเงิน:</strong> {detail.amount.toLocaleString()} บาท
            </p>

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
          </div>

          {/* ✅ คอลัมน์ขวา */}
          <div className="flex-1 text-gray-900 border-l border-gray-200 pl-6">
            <h3 className="text-lg font-bold text-center mb-2">
              แบบฟอร์มขออนุมัติการเบิกจ่าย
            </h3>

            <div className="text-sm leading-7 space-y-1">
              <p>
                <span className="font-semibold">ชื่อเรื่อง:</span>{" "}
                ขอจัดซื้อจัดจ้างป้ายไวนิล
              </p>
              <p>
                <span className="font-semibold">วันที่:</span> 6 ตุลาคม 2568
              </p>
              <p>
                <span className="font-semibold">งบประมาณ:</span> งบดำเนินงาน
              </p>
              <p>
                <span className="font-semibold">เรียน:</span>{" "}
                คณบดีคณะเทคโนโลยีสารสนเทศ
              </p>
              <p>
                <span className="font-semibold">ข้าพเจ้า:</span> นาย A สังกัดงานประชาสัมพันธ์
              </p>
              <p>
                <span className="font-semibold">เหตุผล:</span>{" "}
                เพื่อใช้สำหรับภาพถ่ายในงานต่าง ๆ ของคณะ
              </p>
            </div>

            {/* ตารางรายการ */}
            <div className="mt-6">
              <h4 className="font-semibold mb-2">รายละเอียดรายการเบิกจ่าย</h4>
              <table className="w-full border text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border px-2 py-1 text-center w-12">ลำดับ</th>
                    <th className="border px-2 py-1">รายการ</th>
                    <th className="border px-2 py-1 text-center w-20">จำนวน</th>
                    <th className="border px-2 py-1 text-center w-28">ราคาต่อหน่วย</th>
                    <th className="border px-2 py-1 text-center w-28">รวมเงิน (บาท)</th>
                    <th className="border px-2 py-1 text-center w-32">กำหนดเวลาใช้</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border px-2 py-1 text-center">1</td>
                    <td className="border px-2 py-1">
                      ป้ายไวนิลประชาสัมพันธ์ ขนาด 2.75 × 3.7 เมตร
                    </td>
                    <td className="border px-2 py-1 text-center">1 หน่วย</td>
                    <td className="border px-2 py-1 text-right">3,000.00</td>
                    <td className="border px-2 py-1 text-right">3,000.00</td>
                    <td className="border px-2 py-1 text-center">-</td>
                  </tr>
                  <tr className="bg-gray-50 font-semibold">
                    <td colSpan={4} className="border px-2 py-1 text-right">
                      รวมเป็นเงินทั้งหมด
                    </td>
                    <td className="border px-2 py-1 text-right">3,000.00</td>
                    <td className="border px-2 py-1"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 🔹 ปุ่มอนุมัติ/ไม่อนุมัติ */}
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            <CheckCircle className="w-4 h-4" /> อนุมัติ
          </button>
          <button className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
            <XCircle className="w-4 h-4" /> ไม่อนุมัติ
          </button>
        </div>

        {/* ✅ Modal กรอกจำนวนเงิน */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-96">
              <h2 className="text-lg font-bold mb-4 text-center">
                อนุมัติการเบิกจ่าย
              </h2>

              <label className="block mb-2 text-sm">
                กรอกจำนวนเงินที่อนุมัติ (บาท)
              </label>
              <input
                type="number"
                value={inputAmount}
                onChange={(e) => setInputAmount(Number(e.target.value))}
                className="w-full border px-3 py-2 rounded-lg mb-4"
                placeholder="เช่น 3000"
              />

              <div className="flex justify-center gap-3">
                <button
                  onClick={handleApprove}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  คำนวณ
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setInputAmount("");
                    setResultMessage("");
                  }}
                  className="bg-gray-300 text-black px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  ปิด
                </button>
              </div>

              {/* แสดงผลลัพธ์ */}
              {resultMessage && (
                <p className="mt-4 text-center text-sm font-semibold text-blue-700">
                  {resultMessage}
                </p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
