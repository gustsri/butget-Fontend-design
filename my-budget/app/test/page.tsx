"use client";
import { useRef } from "react";
import { Printer } from 'lucide-react';

// ข้อมูล JSON
const formData = {
  "แบบฟอร์ม": "ขออนุมัติการเบิกจ่าย",
  "ข้อมูลทั่วไป": {
    "ชื่อเรื่อง": "ขอจัดซื้อจัดจ้างป้ายไวนิล",
    "วันที่": "6 ตุลาคม 2568",
    "งบประมาณ": "งบดำเนินงาน",
    "เรียน": "คณบดีคณะเทคโนโลยีสารสนเทศ",
    "ผู้ขออนุมัติ": {
      "ชื่อ": "นาย A",
      "สังกัด": "งานประชาสัมพันธ์"
    },
    "เหตุผล": "เพื่อใช้สำหรับภาพถ่ายในงานต่าง ๆ ของคณะ"
  },
  "รายละเอียดรายการเบิกจ่าย": [
    {
      "ลำดับ": 1,
      "รายการ": "ป้ายไวนิลประชาสัมพันธ์ ขนาด 2.75 × 3.7 เมตร",
      "จำนวน": "1 หน่วย",
      "ราคาต่อหน่วย_บาท": 3000.00,
      "รวมเงิน_บาท": 3000.00,
      "กำหนดเวลาใช้": "-"
    }
  ],
  "รวมเป็นเงินทั้งหมด_บาท": 3000.00,
  "สถานะการอนุมัติ": {
    "ผู้จัดหา": {
      "สถานะ": "รอลงนาม",
      "ตำแหน่ง": "ผู้จัดหา"
    },
    "เจ้าหน้าที่พัสดุ": {
      "สถานะ": "รอการพิจารณา",
      "ตัวเลือก": ["เห็นด้วย", "ไม่เห็นด้วย"]
    },
    "เจ้าหน้าที่การเงิน": {
      "สถานะ": "รอการพิจารณา",
      "ตัวเลือก": ["เห็นด้วย", "ไม่เห็นด้วย"]
    }
  }
};

export default function FormDisplayPage() {
  const printRef = useRef(null);

  const handlePrint = () => {
    window.print();
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printArea, #printArea * {
            visibility: visible;
          }
          #printArea {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          .print-page {
            page-break-inside: avoid;
          }
        }
      `}</style>

      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          
          {/* Print Button */}
          <div className="mb-4 flex justify-end no-print">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
          </div>

          {/* Document */}
          <div id="printArea" className="bg-white shadow-md print-page">
            <div ref={printRef} className="p-12 text-black">
              
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-xl font-bold mb-2">
                  {formData.แบบฟอร์ม}
                </h1>
              </div>

              {/* ข้อมูลทั่วไป */}
              <div className="mb-6 space-y-2 text-sm">
                <div className="flex">
                  <span className="font-semibold w-32">ชื่อเรื่อง:</span>
                  <span className="flex-1">{formData.ข้อมูลทั่วไป.ชื่อเรื่อง}</span>
                </div>
                <div className="flex">
                  <span className="font-semibold w-32">วันที่:</span>
                  <span className="flex-1">{formData.ข้อมูลทั่วไป.วันที่}</span>
                </div>
                <div className="flex">
                  <span className="font-semibold w-32">งบประมาณ:</span>
                  <span className="flex-1">{formData.ข้อมูลทั่วไป.งบประมาณ}</span>
                </div>
                <div className="flex">
                  <span className="font-semibold w-32">เรียน:</span>
                  <span className="flex-1">{formData.ข้อมูลทั่วไป.เรียน}</span>
                </div>
                <div className="flex">
                  <span className="font-semibold w-32">ข้าพเจ้า:</span>
                  <span className="flex-1">
                    {formData.ข้อมูลทั่วไป.ผู้ขออนุมัติ.ชื่อ} สังกัด{formData.ข้อมูลทั่วไป.ผู้ขออนุมัติ.สังกัด}
                  </span>
                </div>
                <div className="flex">
                  <span className="font-semibold w-32">เหตุผล:</span>
                  <span className="flex-1">{formData.ข้อมูลทั่วไป.เหตุผล}</span>
                </div>
              </div>

              {/* ตาราง */}
              <div className="mb-8">
                <h3 className="font-semibold mb-3 text-sm">รายละเอียดรายการเบิกจ่าย</h3>
                <table className="w-full text-sm border-collapse border border-black">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-black px-2 py-2 text-center w-12">ลำดับ</th>
                      <th className="border border-black px-2 py-2 text-left">รายการ</th>
                      <th className="border border-black px-2 py-2 text-center w-20">จำนวน</th>
                      <th className="border border-black px-2 py-2 text-right w-28">ราคาต่อหน่วย</th>
                      <th className="border border-black px-2 py-2 text-right w-28">รวมเงิน (บาท)</th>
                      <th className="border border-black px-2 py-2 text-center w-28">กำหนดเวลาใช้</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.รายละเอียดรายการเบิกจ่าย.map((item, index) => (
                      <tr key={index}>
                        <td className="border border-black px-2 py-2 text-center">{item.ลำดับ}</td>
                        <td className="border border-black px-2 py-2">{item.รายการ}</td>
                        <td className="border border-black px-2 py-2 text-center">{item.จำนวน}</td>
                        <td className="border border-black px-2 py-2 text-right">{formatNumber(item.ราคาต่อหน่วย_บาท)}</td>
                        <td className="border border-black px-2 py-2 text-right">{formatNumber(item.รวมเงิน_บาท)}</td>
                        <td className="border border-black px-2 py-2 text-center">{item.กำหนดเวลาใช้}</td>
                      </tr>
                    ))}
                    <tr className="font-bold">
                      <td colSpan={4} className="border border-black px-2 py-2 text-right">
                        รวมเป็นเงินทั้งหมด
                      </td>
                      <td className="border border-black px-2 py-2 text-right">
                        {formatNumber(formData.รวมเป็นเงินทั้งหมด_บาท)}
                      </td>
                      <td className="border border-black px-2 py-2"></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* ลายเซ็น */}
              <div className="grid grid-cols-2 gap-8 text-sm">
                
                {/* ผู้จัดหา */}
                <div className="text-center">
                  <p className="mb-12">(ลงชื่อ) ...........................................</p>
                  <p className="font-semibold">{formData.สถานะการอนุมัติ.ผู้จัดหา.ตำแหน่ง}</p>
                </div>

                {/* เจ้าหน้าที่พัสดุ */}
                <div className="text-center">
                  <p className="font-semibold mb-2">เจ้าหน้าที่พัสดุ</p>
                  <div className="flex justify-center space-x-4 mb-6">
                    <span>☐ เห็นด้วย</span>
                    <span>☐ ไม่เห็นด้วย</span>
                  </div>
                  <p>(ลงชื่อ) ...........................................</p>
                </div>

                {/* เจ้าหน้าที่การเงิน - Full Width */}
                <div className="col-span-2 text-center mt-4">
                  <p className="font-semibold mb-2">เจ้าหน้าที่การเงิน</p>
                  <div className="flex justify-center space-x-4 mb-6">
                    <span>☐ เห็นด้วย</span>
                    <span>☐ ไม่เห็นด้วย</span>
                  </div>
                  <p>(ลงชื่อ) ...........................................</p>
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </>
  );
}