"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/shared/Sidebar";
import { 
    FileText, 
    Calendar, 
    DollarSign, 
    Users, 
    ArrowLeft, 
    Check, 
    X, 
    Edit,
    TrendingUp,
    TrendingDown,
    Building2
} from 'lucide-react';

// Mock data for document details
const mockDocumentDetail = {
    id: 1,
    title: "แผนจัดทำรายจ่ายปีงบประมาณ 1/2567",
    year: "2567",
    quarter: 1,
    status: "pending",
    totalBudget: 5000000,
    createdDate: "2024-01-15",
    description: "แผนการจัดทำรายจ่ายประจำไตรมาสที่ 1 ปีงบประมาณ 2567",
    budgetDetails: {
        income: [
            { category: "รายได้จากการรับนักศึกษา", amount: 3000000, percentage: 60 },
            { category: "รายได้จากการบริการ", amount: 1500000, percentage: 30 },
            { category: "รายได้อื่นๆ", amount: 500000, percentage: 10 }
        ],
        expenses: [
            { category: "ค่าใช้จ่ายด้านบุคลากร", amount: 2000000, percentage: 40 },
            { category: "ค่าใช้จ่ายด้านดำเนินการ", amount: 1800000, percentage: 36 },
            { category: "ค่าใช้จ่ายด้านการตลาด", amount: 800000, percentage: 16 },
            { category: "ค่าใช้จ่ายอื่นๆ", amount: 400000, percentage: 8 }
        ]
    },
    approver: "คุณสมชาย ใจดี",
    submitter: "คุณสมใส การเงิน",
    notes: "แผนงบประมาณนี้จัดทำขึ้นตามนโยบายการประหยัดงบประมาณโดยมีการปรับลดค่าใช้จ่ายด้านการตลาดลง 15% จากปีที่ผ่านมา"
};

export default function ApprovalDetailPage() {
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

    const handleApproval = async (action: 'approve' | 'reject') => {
        setIsSubmitting(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            if (action === 'approve') {
                alert('อนุมัติเอกสารเรียบร้อยแล้ว');
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
            // Simulate API call
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
        router.push(`/planning/plan-edit/${params.id}`);
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />

            <main className="flex-1 ml-64 p-6">
                <div className="max-w-6xl mx-auto">
                    {/* Back Button */}
                    <button
                        onClick={() => router.back()}
                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
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
                                    <Calendar className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">ไตรมาส</p>
                                        <p className="font-semibold">{document.quarter}/{document.year}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <DollarSign className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">งบประมาณรวม</p>
                                        <p className="font-semibold">{formatBudget(document.totalBudget)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Building2 className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">ผู้จัดทำ</p>
                                        <p className="font-semibold">{document.submitter}</p>
                                    </div>
                                </div>
                            </div>


                            {/* Notes */}
                            {document.notes && (
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold mb-2">หมายเหตุ</h3>
                                    <p className="text-gray-700">{document.notes}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Budget Summary */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Income */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <div className="flex items-center space-x-2 mb-4">
                                <TrendingUp className="w-5 h-5 text-green-600" />
                                <h3 className="text-lg font-semibold">รายรับ</h3>
                            </div>
                            <div className="space-y-4">
                                {document.budgetDetails.income.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">{item.category}</p>
                                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                                <div
                                                    className="bg-green-600 h-2 rounded-full"
                                                    style={{ width: `${item.percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <div className="ml-4 text-right">
                                            <p className="text-sm font-semibold">{formatBudget(item.amount)}</p>
                                            <p className="text-xs text-gray-500">{item.percentage}%</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Expenses */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <div className="flex items-center space-x-2 mb-4">
                                <TrendingDown className="w-5 h-5 text-red-600" />
                                <h3 className="text-lg font-semibold">รายจ่าย</h3>
                            </div>
                            <div className="space-y-4">
                                {document.budgetDetails.expenses.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">{item.category}</p>
                                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                                <div
                                                    className="bg-red-600 h-2 rounded-full"
                                                    style={{ width: `${item.percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <div className="ml-4 text-right">
                                            <p className="text-sm font-semibold">{formatBudget(item.amount)}</p>
                                            <p className="text-xs text-gray-500">{item.percentage}%</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {selectedAction !== 'reject' ? (
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h3 className="text-lg font-semibold mb-4">การอนุมัติเอกสาร</h3>
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
                                <label className="block text-sm font-medium text-gray-700 mb-2">
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