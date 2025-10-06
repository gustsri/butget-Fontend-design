"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/shared/Sidebar";
import { 
    FileText, Calendar, DollarSign, ArrowLeft, Check, X, Edit,
    TrendingDown, Wallet, PiggyBank
} from 'lucide-react';

const mockDocumentDetail = {
    id: 1,
    title: "คำขอเบิกจ่ายค่าไวนิล",
    year: "2568",
    quarter: 2,
    allocatedBudget: 100000,
    totalBudget: 3000,
    description: "การเบิกจ่ายงบประมาณสำหรับโครงการประจำไตรมาสที่ 2",
    expenses: [
        { category: "ค่าจ้างไวนิล", amount: 3000, percentage: 100 }
        
    ]
};

export default function DisbursementDetailPage() {
    const router = useRouter();
    const params = useParams();
    const [document] = useState(mockDocumentDetail);

    const [selectedAction, setSelectedAction] = useState<string>("");
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        fundCode: "",
        workPlan: "",
        expenseType: "",
        costCode: ""
    });

    const formatBudget = (amount: number) =>
        new Intl.NumberFormat("th-TH", {
            style: "currency",
            currency: "THB",
            minimumFractionDigits: 0
        }).format(amount);

    const remainingBudget = document.allocatedBudget - document.totalBudget;

    const handleApproval = async () => {
        if (!formData.fundCode || !formData.workPlan || !formData.expenseType) {
            alert("กรุณากรอกข้อมูลให้ครบถ้วนก่อนอนุมัติ");
            return;
        }
        setIsSubmitting(true);
        setTimeout(() => {
            alert("บันทึกการอนุมัติเรียบร้อย (mock)");
            router.push("/");
        }, 1000);
    };

    const handleReject = async () => {
        if (!comment.trim()) {
            alert("กรุณาระบุเหตุผลในการไม่อนุมัติ");
            return;
        }
        setIsSubmitting(true);
        setTimeout(() => {
            alert("บันทึกการไม่อนุมัติเรียบร้อยแล้ว (mock)");
            router.push("/");
        }, 1000);
    };

    return (
        <div className="flex min-h-screen bg-gray-50 text-black">
            <Sidebar />
            <main className="flex-1 ml-64 p-6">
                <div className="max-w-6xl mx-auto">

                    {/* ปุ่มกลับ */}
                    <button
                        onClick={() => router.back()}
                        className="flex items-center space-x-2 hover:text-blue-600 mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>กลับไปหน้ารายการ</span>
                    </button>

                    {/* Document */}
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <h1 className="text-xl font-bold">{document.title}</h1>
                        <p className="text-sm">{document.description}</p>
                        <p className="mt-2">
                            งบที่ได้รับ: {formatBudget(document.allocatedBudget)} | 
                            ขอเบิก: {formatBudget(document.totalBudget)} | 
                            คงเหลือ: {formatBudget(remainingBudget)}
                        </p>
                    </div>

                    {/* Action */}
                    {selectedAction === "" && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold mb-4">การอนุมัติเอกสาร</h3>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setSelectedAction("approve")}
                                    className="bg-green-600 text-white px-6 py-2 rounded-lg"
                                >
                                    อนุมัติ
                                </button>
                                <button
                                    onClick={() => setSelectedAction("reject")}
                                    className="bg-red-600 text-white px-6 py-2 rounded-lg"
                                >
                                    ไม่อนุมัติ
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ✅ ฟอร์มอนุมัติ */}
{selectedAction === "approve" && (
  <div className="bg-white rounded-lg shadow p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
    {/* ฝั่งซ้าย: แสดงข้อมูลแบบเอกสาร */}
    <div className="text-gray-900">
      <h3 className="text-lg font-bold text-center mb-2">
        แบบฟอร์มขออนุมัติการเบิกจ่าย
      </h3>

      <div className="text-sm leading-7 space-y-1">
        <p>
          <span className="font-semibold">ชื่อเรื่อง:</span> ขอจัดซื้อจัดจ้างป้ายไวนิล
        </p>
        <p>
          <span className="font-semibold">วันที่:</span> 6 ตุลาคม 2568
        </p>
        <p>
          <span className="font-semibold">งบประมาณ:</span> งบดำเนินงาน
        </p>
        <p>
          <span className="font-semibold">เรียน:</span> คณบดีคณะเทคโนโลยีสารสนเทศ
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
              <td className="border px-2 py-1 text-right">300.00</td>
              <td className="border px-2 py-1 text-right">300.00</td>
              <td className="border px-2 py-1 text-center">-</td>
            </tr>
            <tr className="bg-gray-50 font-semibold">
              <td colSpan={4} className="border px-2 py-1 text-right">
                รวมเป็นเงินทั้งหมด
              </td>
              <td className="border px-2 py-1 text-right">300.00</td>
              <td className="border px-2 py-1"></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ลายเซ็นและการอนุมัติ */}
      <div className="mt-8 grid grid-cols-2 gap-6 text-sm">
        {/* ผู้จัดหา */}
        <div className="text-center">
          <div className="border-t w-3/4 mx-auto pt-2">
            (ลงชื่อ) ..............................................  
          </div>
          <p className="mt-1">ผู้จัดหา</p>
        </div>

        {/* เจ้าหน้าที่พัสดุ */}
        <div className="text-center">
          <p className="font-semibold mb-1">เจ้าหน้าที่พัสดุ</p>
          <div className="flex items-center justify-center gap-4">
            <label className="flex items-center gap-1">
              <input type="checkbox" className="accent-green-600" /> เห็นด้วย
            </label>
            <label className="flex items-center gap-1">
              <input type="checkbox" className="accent-red-600" /> ไม่เห็นด้วย
            </label>
          </div>
          <div className="border-t w-3/4 mx-auto pt-2 mt-2">
            (ลงชื่อ) ..............................................
          </div>
        </div>

        {/* เจ้าหน้าที่การเงิน */}
        <div className="text-center col-span-2 mt-4">
          <p className="font-semibold mb-1">เจ้าหน้าที่การเงิน</p>
          <div className="flex items-center justify-center gap-4">
            <label className="flex items-center gap-1">
              <input type="checkbox" className="accent-green-600" /> เห็นด้วย
            </label>
            <label className="flex items-center gap-1">
              <input type="checkbox" className="accent-red-600" /> ไม่เห็นด้วย
            </label>
          </div>
          <div className="border-t w-1/2 mx-auto pt-2 mt-2">
            (ลงชื่อ) ..............................................
          </div>
        </div>
      </div>
    </div>

    {/* ฝั่งขวา: dropdown สำหรับรหัสและหมวดต่าง ๆ */}
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">รหัสการเบิกจ่าย</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={formData.fundCode}
          onChange={(e) => setFormData({ ...formData, fundCode: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">หน่วยงาน / สาขา</label>
        <select
          className="w-full border rounded px-3 py-2"
          value={formData.department}
          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
        >
          <option value="">-- เลือกหน่วยงาน --</option>
          <option value="academicSupport">ส่วนสนับสนุนวิชาการ</option>
          <option value="itDept">สาขาเทคโนโลยีสารสนเทศ</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">กองทุน</label>
        <select
          className="w-full border rounded px-3 py-2"
          value={formData.fund}
          onChange={(e) => setFormData({ ...formData, fund: e.target.value })}
        >
          <option value="">-- เลือกกองทุน --</option>
          <option>ทั่วไป</option>
          <option>เพื่อการศึกษา</option>
          <option>วิจัย</option>
          <option>พัฒนาบุคลากร</option>
          <option>บริการวิชาการ</option>
          <option>กิจการนักศึกษา</option>
          <option>สินทรัพถาวร</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">แผนงาน</label>
        <select
          className="w-full border rounded px-3 py-2"
          value={formData.workPlan}
          onChange={(e) => setFormData({ ...formData, workPlan: e.target.value })}
        >
          <option>งานจัดการการศึกษาอุดมศึกษา</option>
          <option>งานวิจัย</option>
          <option>งานบริหารวิชาการแก่สังคม</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">กิจกรรมหลัก</label>
        <select
          className="w-full border rounded px-3 py-2"
          value={formData.mainActivity}
          onChange={(e) => setFormData({ ...formData, mainActivity: e.target.value })}
        >
          <option>งานการศึกษา</option>
          <option>งานบริหารวิชาการแก่ชุมชน</option>
          <option>งานสนับสนุนการศึกษา</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">กิจกรรมรอง</label>
        <select
          className="w-full border rounded px-3 py-2"
          value={formData.subActivity}
          onChange={(e) => setFormData({ ...formData, subActivity: e.target.value })}
        >
          <option>บริหารทั่วไป</option>
          <option>ทะเบียนนักศึกษาและประมวลผล</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">กิจกรรมย่อย</label>
        <select
          className="w-full border rounded px-3 py-2"
          value={formData.minorActivity}
          onChange={(e) => setFormData({ ...formData, minorActivity: e.target.value })}
        >
          <option>งานบริหารด้านทั่วไป</option>
          <option>งานด้านทรัพยากรบุคคล</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">งบรายจ่าย</label>
        <select
          className="w-full border rounded px-3 py-2"
          value={formData.expenseBudget}
          onChange={(e) => setFormData({ ...formData, expenseBudget: e.target.value })}
        >
          <option>งบบุคลากร</option>
          <option>งบดำเนินงาน</option>
          <option>งบลงทุน</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">ประเภทรายจ่าย</label>
        <select
          className="w-full border rounded px-3 py-2"
          value={formData.expenseType}
          onChange={(e) => setFormData({ ...formData, expenseType: e.target.value })}
        >
          <option>ค่าตอบแทน</option>
          <option>ค่าใช้สอย</option>
          <option>ค่าวัสดุ</option>
        </select>
      </div>

      <div className="flex gap-4 mt-6">
        <button
          onClick={handleApproval}
          disabled={isSubmitting}
          className="bg-green-600 text-white px-6 py-2 rounded-lg"
        >
          {isSubmitting ? "กำลังบันทึก..." : "ยืนยันอนุมัติ"}
        </button>
        <button
          onClick={() => setSelectedAction("")}
          className="bg-gray-600 text-white px-6 py-2 rounded-lg"
        >
          ยกเลิก
        </button>
      </div>
    </div>
  </div>
)}



                    {/* ❌ ฟอร์มไม่อนุมัติ */}
                    {selectedAction === "reject" && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold mb-4 text-red-600">ไม่อนุมัติเอกสาร</h3>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={4}
                                className="w-full border rounded px-3 py-2 mb-4"
                                placeholder="กรุณาระบุเหตุผล..."
                            />
                            <div className="flex gap-4">
                                <button
                                    onClick={handleReject}
                                    disabled={isSubmitting}
                                    className="bg-red-600 text-white px-6 py-2 rounded-lg"
                                >
                                    {isSubmitting ? "กำลังบันทึก..." : "ยืนยันไม่อนุมัติ"}
                                </button>
                                <button
                                    onClick={() => setSelectedAction("")}
                                    className="bg-gray-600 text-white px-6 py-2 rounded-lg"
                                >
                                    ยกเลิก
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
