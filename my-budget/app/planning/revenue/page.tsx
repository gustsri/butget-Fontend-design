"use client";

import { useState } from "react";
import Sidebar from "@/components/shared/Sidebar";
import YearDropdown from "@/components/shared/year";
import {
    Loader2,
    Save,
    TrendingUp,
    TrendingDown,
    Wallet,
    AlertCircle,
    Database,
    Plus,
    Calendar, Send, FileText, RefreshCw
} from "lucide-react";
import {
    getRevenueData,
    createRevenuePlan,
    bulkUpdateRevenueItems,
    // ✅ Import Actions สำหรับการจัดการโครงสร้าง
    addRevenueSection,
    addRevenueItem,
    deleteRevenueItem,
    refreshTuitionRevenue,
    updateRevenueItemName,
    updateRevenueSectionName,
    deleteRevenueSection,
} from "./actions";
import RevenueTable from "@/components/revenue-plan/RevenueTable"; // ตรวจสอบ path ให้ตรง

export default function RevenuePage() {
    const [data, setData] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [currentYearVal, setCurrentYearVal] = useState<number>(0);

    // --- 1. Fetching Logic ---
    const fetchData = async (year: number) => {
        setIsLoading(true);
        try {
            const result = await getRevenueData(year);
            setData(result);
            setHasChanges(false);
        } catch (err) {
            console.error(err);
            setData(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleYearChange = (id: number | null, year: number) => {
        setCurrentYearVal(year);
        if (year) {
            fetchData(year);
        } else {
            setData(null);
        }
    };

    // --- 2. Action Handlers ---

    // สร้างแผนงบประมาณ (Logic: Clone & Seed จะทำงานที่ Server)
    const handleCreate = async () => {
        if (!currentYearVal) return;
        if (!confirm(`ยืนยันการสร้างแผนงบประมาณรายรับ ปี ${currentYearVal}?`)) return;

        setIsLoading(true);
        await createRevenuePlan(currentYearVal);
        await fetchData(currentYearVal); // โหลดข้อมูลใหม่ทันทีหลังสร้างเสร็จ
    };

    // อัปเดตตัวเลข (Client-side update ก่อนกด Save)
    const handleUpdateAmount = (itemId: number, newVal: number) => {
        if (!data) return;
        const newData = { ...data };

        newData.sections.forEach((sec: any) => {
            const item = sec.items.find((i: any) => i.item_id === itemId);
            if (item) item.amount = newVal;
        });

        // (Optional) ใส่ Logic คำนวณยอดรวม Client-side ตรงนี้ได้ถ้าต้องการให้กราฟขยับทันที

        setData(newData);
        setHasChanges(true);
    };

    // บันทึกข้อมูลทั้งหมด (Save Amounts)
    const handleSave = async (targetStatus: 'draft' | 'submitted') => {
        if (!data) return;

        // ถ้าจะ Submit ให้ถามยืนยันก่อน
        if (targetStatus === 'submitted') {
            if (!confirm("ยืนยันการส่งข้อมูล? \nเมื่อส่งแล้วจะไม่สามารถแก้ไขได้จนกว่าจะได้รับการอนุมัติหรือตีกลับ")) return;
        }

        setIsSaving(true);
        try {
            const updates = [];
            for (const sec of data.sections) {
                for (const item of sec.items) {
                    // ส่งเฉพาะค่าที่มีการเปลี่ยนจริง หรือส่งทั้งหมดก็ได้ (ในที่นี้ส่งหมดเพื่อความง่าย)
                    updates.push({ itemId: item.item_id, amount: Number(item.amount) });
                }
            }

            // ส่ง status ไปด้วย
            await bulkUpdateRevenueItems(updates, data.revenue_budget_id, targetStatus);

            await fetchData(currentYearVal); // โหลดข้อมูลใหม่เพื่ออัปเดต Version และ Status บนหน้าเว็บ
        } finally { setIsSaving(false); }
    };

    // --- 3. Structure Management Handlers (เพิ่ม/ลบ โครงสร้าง) ---

    const handleAddSection = async () => {
        const name = prompt("กรุณาระบุชื่อหมวดหมู่ใหม่:");
        if (!name || !data) return;

        setIsLoading(true);
        await addRevenueSection(data.revenue_budget_id, name);
        await fetchData(currentYearVal); // Refresh เพื่อแสดงหมวดใหม่
    };

    const handleAddItem = async (sectionId: number) => {
        const name = prompt("กรุณาระบุชื่อรายการใหม่:");
        if (!name) return;

        // ถามว่าเป็นรายการหักจ่ายหรือไม่?
        const isDeduction = confirm("รายการนี้เป็น 'รายจ่าย/รายการหัก' ใช่หรือไม่?\n(OK = รายจ่าย/หักออก, Cancel = รายรับ)");

        setIsLoading(true);
        await addRevenueItem(sectionId, name, isDeduction);
        await fetchData(currentYearVal);
    };

    const handleDeleteItem = async (itemId: number) => {
        if (!confirm("ต้องการลบรายการนี้ใช่หรือไม่?")) return;

        setIsLoading(true);
        await deleteRevenueItem(itemId, data.revenue_budget_id);
        await fetchData(currentYearVal);
    };
    const handleRecalculate = async () => {
        if (!data || !currentYearVal) return;
        if (!confirm("ต้องการดึงข้อมูลนักศึกษาและคำนวณใหม่หรือไม่? \n(ค่าที่คำนวณได้จะทับยอดเดิมในช่องค่าเทอม)")) return;

        setIsLoading(true);
        await refreshTuitionRevenue(currentYearVal, data.revenue_budget_id);
        await fetchData(currentYearVal);
    };
    // แก้ไขชื่อรายการ
    const handleUpdateItemName = async (itemId: number, newName: string) => {
        // Optimistic Update ที่หน้าจอเพื่อให้ลื่นไหล
        if (data) {
            const newData = { ...data };
            newData.sections.forEach((sec: any) => {
                const item = sec.items.find((i: any) => i.item_id === itemId);
                if (item) item.item_name = newName;
            });
            setData(newData);
        }
        // ส่งไปแก้ที่ Server
        await updateRevenueItemName(itemId, newName);
    };

    // แก้ไขชื่อหมวดหมู่
    const handleUpdateSectionName = async (sectionId: number, newName: string) => {
        if (data) {
            const newData = { ...data };
            const sec = newData.sections.find((s: any) => s.section_id === sectionId);
            if (sec) sec.section_name = newName;
            setData(newData);
        }
        await updateRevenueSectionName(sectionId, newName);
    };

    // ลบหมวดหมู่
    const handleDeleteSection = async (sectionId: number) => {
        if (!confirm("⚠️ คำเตือน: การลบหมวดหมู่จะทำให้รายการย่อยทั้งหมดในหมวดนี้หายไป!\nคุณแน่ใจหรือไม่?")) return;

        setIsLoading(true);
        await deleteRevenueSection(sectionId, data.revenue_budget_id);
        await fetchData(currentYearVal); // โหลดใหม่เพื่อคำนวณยอดเงินรวม
    };
    // --- Render ---

    return (
        <div className="flex min-h-screen bg-gray-50/50">
            <Sidebar />

            <main className="flex-1 ml-64 p-8 space-y-8">

                {/* Header */}
                {/* Header */}
                <div className="bg-[#1e293b] rounded-xl shadow-lg z-20 relative p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
                        <div className="space-y-4">
                            <div>
                                <h6 className="text-blue-300 text-xs font-bold tracking-wider uppercase mb-1">IT BUDGET PLANNING SYSTEM</h6>
                                <h1 className="text-3xl font-bold text-white tracking-tight">ประมาณการรายรับ (Revenue Forecast)</h1>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-3">
                            <div className="flex items-center gap-4 text-white">
                                {/* ✅ โชว์ Version ตรงนี้ */}
                                {data && (
                                    <div className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium border border-white/20">
                                        Version {data.version}
                                    </div>
                                )}

                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-slate-300 flex items-center gap-1"><Calendar className="w-4 h-4" /> ปีงบประมาณ:</span>
                                    <div className="bg-white/10 rounded-lg p-0.5">
                                        <YearDropdown onYearChange={handleYearChange} allowCreate={true} />
                                    </div>
                                </div>
                            </div>

                            {data && (
                                <div className="flex gap-2 mt-2">
                                    {/* ปุ่มกลุ่มนี้จะแสดงก็ต่อเมื่อ Status ไม่ใช่ submitted (หรือ check readOnly) */}
                                    {data.status !== 'submitted' && (
                                        <>
                                            {/* คำนวนใหม่ */}
                                            <button
                                                onClick={handleRecalculate}
                                                className="p-2.5 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded border border-blue-200 transition-colors shadow-sm"
                                                title="ดึงข้อมูลนักศึกษาและคำนวณใหม่"
                                            >
                                                <RefreshCw className="w-5 h-5" />
                                            </button>
                                            {/* ปุ่ม 1: บันทึกร่าง (Draft) */}
                                            <button
                                                onClick={() => handleSave('draft')}
                                                disabled={isSaving}
                                                className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 font-semibold rounded shadow-sm transition-all text-sm"
                                            >
                                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                <span>บันทึกร่าง</span>
                                            </button>

                                            {/* ปุ่ม 2: ยื่นเสนอ (Submit) */}
                                            <button
                                                onClick={() => handleSave('submitted')}
                                                disabled={isSaving}
                                                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shadow-lg transition-all text-sm"
                                            >
                                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                                <span>ยื่นเสนอตรวจสอบ</span>
                                            </button>
                                        </>
                                    )}

                                    {/* ถ้า Submitted แล้ว ให้โชว์สถานะแทนปุ่ม */}
                                    {data.status === 'submitted' && (
                                        <div className="px-6 py-2.5 bg-blue-500/20 text-blue-200 border border-blue-500/30 rounded font-medium text-sm flex items-center gap-2">
                                            <FileText className="w-4 h-4" /> ส่งตรวจสอบแล้ว (รออนุมัติ)
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Loading / Empty / Content */}
                {isLoading && !data ? (
                    <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-sm border border-gray-100">
                        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                        <p className="text-gray-500 font-medium">กำลังโหลดข้อมูล...</p>
                    </div>
                ) : (!data || data.sections.length === 0) ? (  // ✅ เพิ่มเงื่อนไข data.sections.length === 0 ตรงนี้
                    <div className="flex flex-col items-center justify-center h-[50vh] bg-white rounded-xl border-2 border-dashed border-gray-200">
                        <div className="bg-gray-50 p-4 rounded-full mb-4"><Wallet className="w-12 h-12 text-gray-400" /></div>
                        <h3 className="text-lg font-bold text-gray-900">ยังไม่มีข้อมูลงบประมาณปี {currentYearVal || '...'}</h3>
                        <p className="text-gray-500 mb-6">เริ่มต้นสร้างแผนใหม่โดยใช้ข้อมูลตั้งต้นจากปีก่อนหน้า</p>
                        <button onClick={handleCreate} disabled={!currentYearVal} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50">
                            <Plus className="w-5 h-5" /> สร้างแผนงบประมาณปี {currentYearVal}
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
                                <p className="text-sm text-gray-500 font-medium mb-1">รายรับทั้งหมด (Total Revenue)</p>
                                <h3 className="text-3xl font-bold text-slate-800">฿ {data.total_amount.toLocaleString()}</h3>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
                                <p className="text-sm text-gray-500 font-medium mb-1">รายการหัก / ค่าใช้จ่าย (Expenses)</p>
                                <h3 className="text-3xl font-bold text-slate-800">฿ {(data.total_amount - data.net_amount).toLocaleString()}</h3>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
                                <p className="text-sm text-gray-500 font-medium mb-1">รายรับสุทธิ (Net Amount)</p>
                                <h3 className="text-3xl font-bold text-emerald-600">฿ {data.net_amount.toLocaleString()}</h3>
                            </div>
                        </div>

                        {/* Status Bar */}
                        <div className="flex items-center gap-2 bg-yellow-50 text-yellow-800 px-4 py-3 rounded-lg text-sm border border-yellow-200/60 shadow-sm">
                            <AlertCircle className="w-5 h-5 text-yellow-600" />
                            <span>สถานะเอกสาร: <strong className="uppercase">{data.status}</strong></span>
                        </div>

                        {/* Content Table */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <RevenueTable
                                sections={data.sections}
                                onUpdateAmount={handleUpdateAmount}
                                onAddSection={handleAddSection}
                                onAddItem={handleAddItem}
                                onDeleteItem={handleDeleteItem}

                                // ✅ ส่ง Props ใหม่ไปให้ Table
                                onUpdateItemName={handleUpdateItemName}
                                onUpdateSectionName={handleUpdateSectionName}
                                onDeleteSection={handleDeleteSection}

                                readOnly={data.status === 'submitted'}
                            />
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}