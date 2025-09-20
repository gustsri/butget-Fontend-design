"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/shared/Sidebar";
import { 
    FileText, 
    Calendar, 
    DollarSign, 
    ArrowLeft, 
    Check, 
    X, 
    Edit,
    TrendingDown,
    Building2,
    Wallet,
    PiggyBank
} from 'lucide-react';

// Mock data สำหรับรายละเอียดการเบิกจ่าย
const mockDocumentDetail = {
    id: 1,
    title: "คำขอเบิกจ่ายงบประมาณโครงการพัฒนาระบบสารสนเทศ",
    year: "2567",
    quarter: 2,
    status: "pending",
    allocatedBudget: 8000000, // งบที่ได้รับ
    totalBudget: 6200000,     // จำนวนที่ขอเบิก
    createdDate: "2024-02-20",
    description: "การเบิกจ่ายงบประมาณสำหรับดำเนินโครงการพัฒนาระบบสารสนเทศประจำไตรมาสที่ 2",
    expenses: [
        { category: "ค่าจ้างที่ปรึกษาและพัฒนา", amount: 2500000, percentage: 40 },
        { category: "ค่าอุปกรณ์และซอฟต์แวร์", amount: 2000000, percentage: 32 },
        { category: "ค่าอบรมและพัฒนาบุคลากร", amount: 1000000, percentage: 16 },
        { category: "ค่าใช้จ่ายเบ็ดเตล็ด", amount: 700000, percentage: 12 }
    ],
    approver: "คุณสมชาย ใจดี",
    submitter: "คุณสมศรี การเงิน",
    notes: "การเบิกจ่ายนี้เป็นไปตามงบประมาณที่ได้รับ โดยมีการกันเงินสำรองไว้ 1,800,000 บาท สำหรับความเสี่ยงโครงการ"
};

export default function DisbursementDetailPage() {
    const router = useRouter();
    const params = useParams();
    const [document] = useState(mockDocumentDetail);
    const [selectedAction, setSelectedAction] = useState<string>("");
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const formatBudget = (amount: number) => {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // ✅ คำนวณยอดคงเหลือ
    const remainingBudget = document.allocatedBudget - document.totalBudget;

    const handleApproval = async (action: 'approve' | 'reject') => {
        setIsSubmitting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (action === 'approve') {
                alert('อนุมัติเอกสารเบิกจ่ายเรียบร้อยแล้ว');
                router.push('/');
            } else {
                setSelectedAction('reject');
            }
        } catch (error) {
            alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!comment.trim()) {
            alert('กรุณาระบุเหตุผลในการไม่อนุมัติ');
            return;
        }
        setIsSubmitting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            alert('บันทึกการไม่อนุมัติเรียบร้อยแล้ว');
            router.push('/');
        } catch (error) {
            alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditPlan = () => {
        router.push(`/disbursement/edit/${params.id}`);
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />

            <main className="flex-1 ml-64 p-6">
                <div className="max-w-6xl mx-auto">
                    {/* Back Button */}
                    <button
                        onClick={() => router.back()}
                        className="flex items-center space-x-2 text-black hover:text-blue-600 mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>กลับไปหน้ารายการ</span>
                    </button>

                    {/* Document Header */}
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h1 className="text-2xl font-bold mb-2">{document.title}</h1>
                                    <p className="text-blue-100">{document.description}</p>
                                </div>
                                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                                    <FileText className="w-8 h-8" />
                                </div>
                            </div>
                        </div>

                        {/* Document Info */}
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                                <div className="flex items-center space-x-3">
                                    <Calendar className="w-5 h-5 text-black" />
                                    <div>
                                        <p className="text-sm text-black">ไตรมาส</p>
                                        <p className="font-semibold text-black">{document.quarter}/{document.year}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Wallet className="w-5 h-5 text-black" />
                                    <div>
                                        <p className="text-sm text-black">งบประมาณที่ได้รับ</p>
                                        <p className="font-semibold text-black">{formatBudget(document.allocatedBudget)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <DollarSign className="w-5 h-5 text-black" />
                                    <div>
                                        <p className="text-sm text-black">จำนวนที่ขอเบิก</p>
                                        <p className="font-semibold text-black">{formatBudget(document.totalBudget)}</p>
                                    </div>
                                </div>
                                {/* ✅ แสดงยอดคงเหลือ */}
                                <div className="flex items-center space-x-3">
                                    <PiggyBank className="w-5 h-5 text-black" />
                                    <div>
                                        <p className="text-sm text-black">ยอดคงเหลือ</p>
                                        <p className="font-semibold text-black">{formatBudget(remainingBudget)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            {document.notes && (
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold mb-2 text-black">หมายเหตุ</h3>
                                    <p className="text-black">{document.notes}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Expenses */}
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <TrendingDown className="w-5 h-5 text-red-600" />
                            <h3 className="text-lg font-semibold text-black">รายละเอียดการเบิกจ่าย</h3>
                        </div>
                        <div className="space-y-4">
                            {document.expenses.map((item, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-black">{item.category}</p>
                                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                            <div
                                                className="bg-red-600 h-2 rounded-full"
                                                style={{ width: `${item.percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="ml-4 text-right">
                                        <p className="text-sm font-semibold text-black">{formatBudget(item.amount)}</p>
                                        <p className="text-xs text-black">{item.percentage}%</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {selectedAction !== 'reject' ? (
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h3 className="text-lg font-semibold mb-4 text-black">การอนุมัติเอกสาร</h3>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={() => handleApproval('approve')}
                                    disabled={isSubmitting}
                                    className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                                >
                                    <Check className="w-5 h-5" />
                                    <span>{isSubmitting ? 'กำลังดำเนินการ...' : 'อนุมัติ'}</span>
                                </button>
                                <button
                                    onClick={() => handleApproval('reject')}
                                    disabled={isSubmitting}
                                    className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                    <span>ไม่อนุมัติ</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h3 className="text-lg font-semibold mb-4 text-red-600">ไม่อนุมัติเอกสาร</h3>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-black mb-2">
                                    เหตุผลในการไม่อนุมัติ *
                                </label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                                    rows={4}
                                    placeholder="กรุณาระบุเหตุผลในการไม่อนุมัติ..."
                                />
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={handleReject}
                                    disabled={isSubmitting}
                                    className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                    <span>{isSubmitting ? 'กำลังบันทึก...' : 'ยืนยันไม่อนุมัติ'}</span>
                                </button>
                                <button
                                    onClick={handleEditPlan}
                                    className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                                >
                                    <Edit className="w-5 h-5" />
                                    <span>ปรับแผน</span>
                                </button>
                                <button
                                    onClick={() => setSelectedAction('')}
                                    className="flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                                >
                                    <span>ยกเลิก</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
