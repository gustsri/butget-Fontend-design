"use client";
import { useState } from "react";
import Sidebar from "@/components/shared/Sidebar";
import YearDropdown from "@/components/shared/year";
import TrackingList from "@/components/track/TrackingList";
// import StatusFilter from "@/components/track/StatusFilter";
import { Search, FileText, TrendingUp } from 'lucide-react';

// Mock data สำหรับติดตามเอกสาร
import mockTrackingData from "@/data/mockTrackingData.json";

export default function TrackingPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [selectedType, setSelectedType] = useState("all");
    const [selectedYear, setSelectedYear] = useState("2567");
    const [documents] = useState<typeof mockTrackingData>(mockTrackingData);
    const [filterYear, setFilterYear] = useState<number>();

    // Filter documents based on search and filters
    const filteredDocuments = documents.filter(doc => {
        const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.submittedBy.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = selectedStatus === "all" || doc.currentStatus === selectedStatus;
        const matchesType = selectedType === "all" || doc.type === selectedType;

        // เพิ่มการกรองตามปี
        const matchesYear = !filterYear || doc.year === filterYear;

        return matchesSearch && matchesStatus && matchesType && matchesYear;
    });

    // Statistics - คำนวณจากข้อมูลที่กรองแล้ว
    const stats = {
        total: filteredDocuments.length,
        pending: filteredDocuments.filter(doc => doc.currentStatus === 'pending').length,
        underReview: filteredDocuments.filter(doc => doc.currentStatus === 'under_review').length,
        approved: filteredDocuments.filter(doc => doc.currentStatus === 'approved').length,
        rejected: filteredDocuments.filter(doc => doc.currentStatus === 'rejected').length
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />

            <main className="flex-1 ml-64 p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">ติดตามการอนุมัติเอกสาร</h1>
                        <p className="text-gray-600">ตรวจสอบสถานะการอนุมัติโครงการและการเบิกจ่ายต่างๆ</p>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <FileText className="w-8 h-8 text-blue-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">ทั้งหมด</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                    <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">รอดำเนินการ</p>
                                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">กำลังตรวจสอบ</p>
                                    <p className="text-2xl font-bold text-blue-600">{stats.underReview}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">อนุมัติแล้ว</p>
                                    <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                    <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">ไม่อนุมัติ</p>
                                    <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-lg shadow mb-6">
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="ค้นหาเอกสาร..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Status Filter */}
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">ทุกสถานะ</option>
                                    <option value="pending">รอดำเนินการ</option>
                                    <option value="under_review">กำลังตรวจสอบ</option>
                                    <option value="approved">อนุมัติแล้ว</option>
                                    <option value="rejected">ไม่อนุมัติ</option>
                                </select>

                                {/* Type Filter */}
                                <select
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">ทุกประเภท</option>
                                    <option value="budget_plan">แผนงบประมาณ</option>
                                    <option value="expense_request">การเบิกจ่าย</option>
                                </select>

                                {/* Year Filter */}
                                <YearDropdown
                                    selectedYear={filterYear}
                                    onYearChange={setFilterYear}
                                    startYear={2566}
                                    endYear={2570}
                                    placeholder="เลือกปีงบประมาณ"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-500">
                                    แสดง {filteredDocuments.length} จาก {documents.length} เอกสาร
                                    {filterYear && (
                                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                            ปี {filterYear}
                                        </span>
                                    )}
                                </div>

                                {/* Clear Filters Button */}
                                {(filterYear || searchTerm || selectedStatus !== "all" || selectedType !== "all") && (
                                    <button
                                        onClick={() => {
                                            setFilterYear(undefined);
                                            setSearchTerm("");
                                            setSelectedStatus("all");
                                            setSelectedType("all");
                                        }}
                                        className="text-sm text-blue-600 hover:text-blue-800"
                                    >
                                        ล้างตัวกรอง
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Document List */}
                    <div className="bg-white rounded-lg shadow">
                        <TrackingList documents={filteredDocuments} />
                    </div>
                </div>
            </main>
        </div>
    );
}