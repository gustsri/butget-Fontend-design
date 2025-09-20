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
    Building2,
    User,
    TrendingUp,
    TrendingDown,
    Eye
} from 'lucide-react';
import StatusBadge from '@/components/track/StatusBadge';

// Mock data สำหรับรายละเอียดเอกสาร
const mockDocumentDetail = {
    id: 1,
    documentNumber: "DOC-2567-001",
    title: "แผนจัดทำรายจ่ายปีงบประมาณ 1/2567",
    type: "budget_plan",
    description: "แผนการจัดทำรายจ่ายประจำไตรมาสที่ 1 ปีงบประมาณ 2567",
    submittedBy: "คุณสมใส การเงิน",
    submittedDate: "2024-01-15",
    currentStatus: "approved",
    totalBudget: 5000000,
    department: "ฝ่ายการเงิน",
    approver: "คุณสมชาย ใจดี",
    approvedDate: "2024-01-18",
    year: "2567",
    quarter: 1,
    budgetDetails: {
        income: [
            { category: "รายได้จากการขาย", amount: 3000000, percentage: 60 },
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
    notes: "แผนงบประมาณนี้จัดทำขึ้นตามนโยบายการประหยัดงบประมาณของบริษัท โดยมีการปรับลดค่าใช้จ่ายด้านการตลาดลง 15% จากปีที่ผ่านมา",
    timeline: [
        {
            status: "submitted",
            date: "2024-01-15T09:00:00",
            actor: "คุณสมใส การเงิน",
            note: "ส่งเอกสารเพื่อขออนุมัติ"
        },
        {
            status: "under_review",
            date: "2024-01-16T10:30:00",
            actor: "คุณสมชาย ใจดี",
            note: "เริ่มตรวจสอบเอกสาร"
        },
        {
            status: "approved",
            date: "2024-01-18T14:20:00",
            actor: "คุณสมชาย ใจดี",
            note: "อนุมัติเรียบร้อย ตามแผนงบประมาณที่กำหนด"
        }
    ]
};

export default function DocumentDetailView() {
    const router = useRouter();
    const params = useParams();
    const [document] = useState(mockDocumentDetail);

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

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTimelineStatusInfo = (status: string) => {
        switch (status) {
            case 'submitted':
                return {
                    text: 'ส่งเอกสาร',
                    color: 'bg-gray-500',
                    icon: <User className="w-3 h-3 text-white" />
                };
            case 'under_review':
                return {
                    text: 'ตรวจสอบ',
                    color: 'bg-blue-500',
                    icon: <Eye className="w-3 h-3 text-white" />
                };
            case 'approved':
                return {
                    text: 'อนุมัติ',
                    color: 'bg-green-500',
                    icon: <User className="w-3 h-3 text-white" />
                };
            case 'rejected':
                return {
                    text: 'ไม่อนุมัติ',
                    color: 'bg-red-500',
                    icon: <User className="w-3 h-3 text-white" />
                };
            default:
                return {
                    text: status,
                    color: 'bg-gray-500',
                    icon: <User className="w-3 h-3 text-white" />
                };
        }
    };

    const getTypeText = (type: string) => {
        switch (type) {
            case 'budget_plan':
                return 'แผนงบประมาณ';
            case 'expense_request':
                return 'การเบิกจ่าย';
            default:
                return type;
        }
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
                        <span>กลับไปหน้าติดตาม</span>
                    </button>

                    {/* Document Header */}
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
                        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-4">
                                    <div className="bg-white bg-opacity-20 rounded-lg p-3">
                                        <Eye className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold mb-2">{document.title}</h1>
                                        <p className="text-indigo-100 mb-3">{document.description}</p>
                                        <div className="flex items-center space-x-4">
                                            <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-medium">
                                                {document.documentNumber}
                                            </span>
                                            <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-medium">
                                                {getTypeText(document.type)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${statusInfo.color}`}>
                                    {statusInfo.icon}
                                    <span className="font-semibold">{statusInfo.text}</span>
                                </div>
                            </div>
                        </div>

                        {/* Document Basic Info */}
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="flex items-center space-x-3">
                                    <User className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">ผู้ส่งเอกสาร</p>
                                        <p className="font-semibold">{document.submittedBy}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Calendar className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">วันที่ส่ง</p>
                                        <p className="font-semibold">{formatDate(document.submittedDate)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <DollarSign className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">จำนวนเงิน</p>
                                        <p className="font-semibold">{formatBudget(document.totalBudget)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Building2 className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">หน่วยงาน</p>
                                        <p className="font-semibold">{document.department}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Approval Info */}
                            {document.approver && (
                                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                                    <div className="flex items-center space-x-3">
                                        <StatusBadge status="approved" size="sm" />
                                        <div>
                                            <p className="font-semibold text-green-800">อนุมัติโดย: {document.approver}</p>
                                            {document.approvedDate && (
                                                <p className="text-sm text-green-600">วันที่อนุมัติ: {formatDate(document.approvedDate)}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            {document.notes && (
                                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                    <h3 className="text-lg font-semibold mb-2">หมายเหตุ</h3>
                                    <p className="text-gray-700">{document.notes}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Budget Details (if budget_plan) */}
                    {document.type === 'budget_plan' && document.budgetDetails && (
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
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="flex justify-between font-semibold">
                                        <span>รวมรายรับ:</span>
                                        <span className="text-green-600">
                                            {formatBudget(document.budgetDetails.income.reduce((sum, item) => sum + item.amount, 0))}
                                        </span>
                                    </div>
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
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="flex justify-between font-semibold">
                                        <span>รวมรายจ่าย:</span>
                                        <span className="text-red-600">
                                            {formatBudget(document.budgetDetails.expenses.reduce((sum, item) => sum + item.amount, 0))}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Timeline */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">ประวัติการดำเนินการ</h3>
                        <div className="relative">
                            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                            <div className="space-y-6">
                                {document.timeline.map((item, index) => {
                                    const timelineInfo = getTimelineStatusInfo(item.status);
                                    return (
                                        <div key={index} className="relative flex items-start space-x-4">
                                            <div className={`flex-shrink-0 w-8 h-8 rounded-full ${timelineInfo.color} flex items-center justify-center relative z-10`}>
                                                {timelineInfo.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <span className="text-sm font-semibold text-gray-900">
                                                        {timelineInfo.text}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {formatDateTime(item.date)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-1">{item.note}</p>
                                                <p className="text-xs text-gray-500">โดย {item.actor}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}