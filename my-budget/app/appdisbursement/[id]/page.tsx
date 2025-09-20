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
    title: "คำขอเบิกจ่ายงบประมาณโครงการพัฒนาระบบสารสนเทศ",
    year: "2567",
    quarter: 2,
    allocatedBudget: 8000000,
    totalBudget: 6200000,
    description: "การเบิกจ่ายงบประมาณสำหรับโครงการประจำไตรมาสที่ 2",
    expenses: [
        { category: "ค่าจ้างที่ปรึกษา", amount: 2500000, percentage: 40 },
        { category: "ค่าอุปกรณ์", amount: 2000000, percentage: 32 },
        { category: "ค่าอบรม", amount: 1000000, percentage: 16 },
        { category: "ค่าใช้จ่ายเบ็ดเตล็ด", amount: 700000, percentage: 12 }
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
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold mb-4 text-green-600">
                                ฟอร์มอนุมัติการเบิกจ่าย (Mock)
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">รหัสกองทุน</label>
                                    <input
                                        className="w-full border rounded px-3 py-2"
                                        value={formData.fundCode}
                                        onChange={(e) =>
                                            setFormData({ ...formData, fundCode: e.target.value })
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">แผนงาน</label>
                                    <input
                                        className="w-full border rounded px-3 py-2"
                                        value={formData.workPlan}
                                        onChange={(e) =>
                                            setFormData({ ...formData, workPlan: e.target.value })
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">ประเภทรายจ่าย</label>
                                    <input
                                        className="w-full border rounded px-3 py-2"
                                        value={formData.expenseType}
                                        onChange={(e) =>
                                            setFormData({ ...formData, expenseType: e.target.value })
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">รหัสค่าใช้จ่าย</label>
                                    <input
                                        className="w-full border rounded px-3 py-2"
                                        value={formData.costCode}
                                        onChange={(e) =>
                                            setFormData({ ...formData, costCode: e.target.value })
                                        }
                                    />
                                </div>
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
