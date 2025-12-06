"use client";
import { useRef } from "react";
import { Download, Printer } from 'lucide-react';

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

  // ฟังก์ชัน Print (ใช้ได้กับทุก Browser)
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

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          
          {/* Header - ซ่อนตอน Print */}
          <div className="mb-6 flex items-center justify-between no-print">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{formData.แบบฟอร์ม}</h1>
                <p className="text-sm text-gray-600">แสดงข้อมูลจาก JSON</p>
              </div>
            </div>

            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-lg font-medium transition-all bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl text-white"
            >
              <Printer className="w-5 h-5" />
              <span>Print / Save as PDF</span>
            </button>
          </div>

          {/* Main Content */}
          <div id="printArea" className="bg-white rounded-xl shadow-xl overflow-hidden print-page">
            <div ref={printRef} className="p-10">
              
              {/* Title */}
              <div className="text-center mb-8 border-b-2 border-blue-600 pb-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {formData.แบบฟอร์ม}
                </h2>
                <div className="inline-block bg-blue-50 px-4 py-1 rounded-full">
                  <span className="text-sm text-blue-800 font-medium">
                    {formData.ข้อมูลทั่วไป.วันที่}
                  </span>
                </div>
              </div>

              {/* ข้อมูลทั่วไป */}
              <div className="mb-8 bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">1</span>
                  ข้อมูลทั่วไป
                </h3>
                
                <div className="space-y-3 text-gray-700">
                  <div className="flex">
                    <span className="font-semibold w-32">ชื่อเรื่อง:</span>
                    <span className="flex-1">{formData.ข้อมูลทั่วไป.ชื่อเรื่อง}</span>
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
              </div>

              {/* รายละเอียดรายการเบิกจ่าย */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">2</span>
                  รายละเอียดรายการเบิกจ่าย
                </h3>
                
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full text-sm border-collapse">
                    <thead className="bg-blue-600 text-white">
                      <tr>
                        <th className="border border-gray-300 px-4 py-3 text-center w-16">ลำดับ</th>
                        <th className="border border-gray-300 px-4 py-3 text-left">รายการ</th>
                        <th className="border border-gray-300 px-4 py-3 text-center w-24">จำนวน</th>
                        <th className="border border-gray-300 px-4 py-3 text-right w-32">ราคาต่อหน่วย</th>
                        <th className="border border-gray-300 px-4 py-3 text-right w-32">รวมเงิน (บาท)</th>
                        <th className="border border-gray-300 px-4 py-3 text-center w-32">กำหนดเวลาใช้</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {formData.รายละเอียดรายการเบิกจ่าย.map((item, index) => (
                        <tr key={index}>
                          <td className="border border-gray-300 px-4 py-3 text-center font-medium">{item.ลำดับ}</td>
                          <td className="border border-gray-300 px-4 py-3">{item.รายการ}</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">{item.จำนวน}</td>
                          <td className="border border-gray-300 px-4 py-3 text-right">{formatNumber(item.ราคาต่อหน่วย_บาท)}</td>
                          <td className="border border-gray-300 px-4 py-3 text-right font-semibold">{formatNumber(item.รวมเงิน_บาท)}</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">{item.กำหนดเวลาใช้}</td>
                        </tr>
                      ))}
                      <tr className="bg-blue-50 font-bold">
                        <td colSpan={4} className="border border-gray-300 px-4 py-3 text-right text-gray-800">
                          รวมเป็นเงินทั้งหมด
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-right text-blue-800 text-lg">
                          {formatNumber(formData.รวมเป็นเงินทั้งหมด_บาท)}
                        </td>
                        <td className="border border-gray-300 px-4 py-3"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* สถานะการอนุมัติ */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                  <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">3</span>
                  สถานะการอนุมัติ
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* ผู้จัดหา */}
                  <div className="border-2 border-gray-200 rounded-lg p-5 bg-gray-50">
                    <div className="text-center mb-4">
                      <div className="inline-block bg-yellow-100 px-3 py-1 rounded-full mb-2">
                        <span className="text-sm font-medium text-yellow-800">
                          {formData.สถานะการอนุมัติ.ผู้จัดหา.สถานะ}
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-800">
                        {formData.สถานะการอนุมัติ.ผู้จัดหา.ตำแหน่ง}
                      </h4>
                    </div>
                    <div className="border-t-2 border-dashed border-gray-300 pt-8 mt-4">
                      <p className="text-center text-sm text-gray-600">
                        (ลงชื่อ) .....................................
                      </p>
                    </div>
                  </div>

                  {/* เจ้าหน้าที่พัสดุ */}
                  <div className="border-2 border-gray-200 rounded-lg p-5 bg-gray-50">
                    <div className="text-center mb-4">
                      <div className="inline-block bg-blue-100 px-3 py-1 rounded-full mb-2">
                        <span className="text-sm font-medium text-blue-800">
                          {formData.สถานะการอนุมัติ.เจ้าหน้าที่พัสดุ.สถานะ}
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-800">เจ้าหน้าที่พัสดุ</h4>
                    </div>
                    <div className="flex justify-center space-x-6 mb-4 text-sm">
                      {formData.สถานะการอนุมัติ.เจ้าหน้าที่พัสดุ.ตัวเลือก.map((option, idx) => (
                        <div key={idx} className="flex items-center space-x-1">
                          <span className="text-lg">☐</span>
                          <span>{option}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t-2 border-dashed border-gray-300 pt-8 mt-4">
                      <p className="text-center text-sm text-gray-600">
                        (ลงชื่อ) .....................................
                      </p>
                    </div>
                  </div>

                  {/* เจ้าหน้าที่การเงิน */}
                  <div className="border-2 border-gray-200 rounded-lg p-5 bg-gray-50">
                    <div className="text-center mb-4">
                      <div className="inline-block bg-purple-100 px-3 py-1 rounded-full mb-2">
                        <span className="text-sm font-medium text-purple-800">
                          {formData.สถานะการอนุมัติ.เจ้าหน้าที่การเงิน.สถานะ}
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-800">เจ้าหน้าที่การเงิน</h4>
                    </div>
                    <div className="flex justify-center space-x-6 mb-4 text-sm">
                      {formData.สถานะการอนุมัติ.เจ้าหน้าที่การเงิน.ตัวเลือก.map((option, idx) => (
                        <div key={idx} className="flex items-center space-x-1">
                          <span className="text-lg">☐</span>
                          <span>{option}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t-2 border-dashed border-gray-300 pt-8 mt-4">
                      <p className="text-center text-sm text-gray-600">
                        (ลงชื่อ) .....................................
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
                <p>เอกสารนี้สร้างจากระบบอัตโนมัติ • {formData.ข้อมูลทั่วไป.วันที่}</p>
              </div>

            </div>
          </div>

          {/* JSON Display - ซ่อนตอน Print */}
          <div className="mt-6 bg-white rounded-xl shadow-lg p-6 no-print">
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              ข้อมูล JSON ต้นฉบับ
            </h3>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-green-400 text-xs font-mono">
{JSON.stringify(formData, null, 2)}
              </pre>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}