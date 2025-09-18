"use client";
import { useState } from "react";
import Sidebar from "@/components/shared/Sidebar";
import YearDropdown from "@/components/shared/year";
import RowItem from "@/components/plan/RowItem";
import DocumentList from "@/components/approval/DocumentList";

// Mock data สำหรับเอกสารที่รออนุมัติ
const mockDocuments = [
    {
        id: 1,
        title: "แผนจัดทำรายจ่ายปีงบประมาณ 1/2567",
        year: "2567",
        quarter: 1,
        status: "pending",
        totalBudget: 5000000,
        departments: ["ฝ่ายการเงิน", "ฝ่ายจัดซื้อ", "ฝ่ายบริหาร"],
        createdDate: "2024-01-15",
        description: "แผนการจัดทำรายจ่ายประจำไตรมาสที่ 1 ปีงบประมาณ 2567"
    },
    {
        id: 2,
        title: "แผนจัดทำรายรับปีงบประมาณ 2/2567",
        year: "2567",
        quarter: 2,
        status: "pending",
        totalBudget: 7500000,
        createdDate: "2024-02-20",
        description: "แผนการจัดทำรายรับประจำไตรมาสที่ 2 ปีงบประมาณ 2567"
    },
    {
        id: 3,
        title: "แผนจัดทำรายจ่ายปีงบประมาณ 3/2567",
        year: "2567",
        quarter: 3,
        status: "pending",
        totalBudget: 6200000,
        createdDate: "2024-03-10",
        description: "แผนการจัดทำรายจ่ายประจำไตรมาสที่ 3 ปีงบประมาณ 2567"
    },
    {
        id: 4,
        title: "แผนจัดทำรายรับปีงบประมาณ 4/2567",
        year: "2567",
        quarter: 4,
        status: "pending",
        totalBudget: 8300000,
        createdDate: "2024-04-05",
        description: "แผนการจัดทำรายรับประจำไตรมาสที่ 4 ปีงบประมาณ 2567"
    }
];

export default function Home() {
    const [activeTab, setActiveTab] = useState("year");
    const [documents] = useState(mockDocuments);

    const handleDocumentClick = (documentId: number) => {
        // Navigate to approval detail page
        window.location.href = `/approval/${documentId}`;
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />

            {/* Main content */}
            <main className="flex-1 ml-64 p-6">
                <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                        <h1 className="text-2xl font-bold text-center">เอกสารทั้งหมดที่สามารถอนุมัติได้</h1>
                        <p className="text-center mt-2 text-blue-100">จัดการและอนุมัติแผนงบประมาณรายรับ-รายจ่าย</p>
                    </div>

                    {/* Filter Section */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <YearDropdown />
                                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                    <option value="">ทุกไตรมาส</option>
                                    <option value="1">ไตรมาสที่ 1</option>
                                    <option value="2">ไตรมาสที่ 2</option>
                                    <option value="3">ไตรมาสที่ 3</option>
                                    <option value="4">ไตรมาสที่ 4</option>
                                </select>
                            </div>
                            <div className="text-sm text-gray-500">
                                รออนุมัติ {documents.filter(doc => doc.status === 'pending').length} เอกสาร
                            </div>
                        </div>
                    </div>

                    {/* Document List */}
                    <div className="p-6">
                        <DocumentList 
                            documents={documents} 
                            onDocumentClick={handleDocumentClick}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}