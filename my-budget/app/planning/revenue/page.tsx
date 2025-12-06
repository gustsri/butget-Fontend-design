"use client";

import { useState } from "react";
import Sidebar from "@/components/shared/Sidebar";
import YearDropdown from "@/components/shared/year";
import RowItem from "@/components/plan/RowItem";
import { Loader2, Coins, TrendingDown, Wallet, Plus, Save, FileText, CheckCircle, Send, Trash2 } from "lucide-react";
import { getRevenueData, createRevenuePlan, updateBudgetStatus, bulkUpdateRevenueItems, recalculateRevenueFromEnrollment, addRevenueItem, addRevenueSection, deleteRevenueItem } from "./actions";

type RevenueData = {
  revenue_budget_id: number;
  budget_year: number;
  status: "draft" | "submitted" | "approved" | "rejected";
  total_amount: any;
  net_amount: any;
  sections: {
    section_id: number;
    section_name: string;
    items: {
      item_id: number;
      item_name: string;
      amount: any;
      is_deduction: boolean;
    }[];
  }[];
};

export default function RevenuePage() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [originalData, setOriginalData] = useState<RevenueData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  const [currentYearVal, setCurrentYearVal] = useState<number>(0);
  const [currentId, setCurrentId] = useState<number | null>(null);

  const handleYearChange = (id: number | null, year: number) => {
    setCurrentId(id); setCurrentYearVal(year); setHasChanges(false); 
    if (id) fetchData(id); else { setData(null); setOriginalData(null); }
  };

  const fetchData = async (id: number) => {
    setIsLoading(true);
    try {
      const result = await getRevenueData(id);
      setData(result as any);
      setOriginalData(JSON.parse(JSON.stringify(result)));
      setHasChanges(false);
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  const handleCreatePlan = async () => {
    if (!confirm(`ยืนยันการสร้างแผนงบประมาณปี ${currentYearVal}?`)) return;
    setIsLoading(true);
    try {
      const result = await createRevenuePlan(currentYearVal);
      if (result.success && result.newId) { setCurrentId(result.newId); fetchData(result.newId); } 
      else { alert("เกิดข้อผิดพลาด: " + result.message); }
    } finally { setIsLoading(false); }
  };

  const handleEdit = (itemId: number, newVal: number) => {
    if (!data) return;
    const newData = {
      ...data,
      sections: data.sections.map(sec => ({
        ...sec,
        items: sec.items.map(item => 
          item.item_id === itemId ? { ...item, amount: newVal } : item
        )
      }))
    };
    
    // Client-side simulation logic (Simplified)
    // การคำนวณจริงจะเกิดที่ Server เมื่อกดบันทึก
    // แต่เราอัปเดต 35% และ คงเหลือ ให้เห็นภาพคร่าวๆ
    const tuitionSec = newData.sections[0];
    if (tuitionSec) {
        const termsSum = tuitionSec.items
            .filter(i => !i.is_deduction && i.item_name.includes("ภาคเรียนที่"))
            .reduce((sum, i) => sum + Number(i.amount), 0);
        
        const deductItem = tuitionSec.items.find(i => i.item_name.includes("35%"));
        if(deductItem) deductItem.amount = termsSum * 0.35;

        const remainItem = tuitionSec.items.find(i => i.item_name.includes("คงเหลือ"));
        if(remainItem) remainItem.amount = termsSum - (termsSum * 0.35);
    }

    setData(newData);
    setHasChanges(true);
  };

  const handleSaveChanges = async () => {
    if (!data) return;
    setIsSaving(true);
    try {
      const updates = [];
      for (const sec of data.sections) {
        for (const item of sec.items) {
          updates.push({ itemId: item.item_id, amount: Number(item.amount) });
        }
      }
      const result = await bulkUpdateRevenueItems(updates, data.revenue_budget_id);
      if (result.success) {
        fetchData(data.revenue_budget_id); 
      } else { alert("บันทึกไม่สำเร็จ ❌"); }
    } finally { setIsSaving(false); }
  };

  const handleCancelChanges = () => {
    if (!originalData) return;
    if (confirm("ยกเลิกการแก้ไขทั้งหมด?")) {
        setData(JSON.parse(JSON.stringify(originalData)));
        setHasChanges(false);
    }
  };

  const handleRecalculate = async () => {
    if (!data) return;
    if (!confirm("ดึงข้อมูลนักศึกษาใหม่?")) return;
    setIsRecalculating(true);
    try {
        await recalculateRevenueFromEnrollment(data.revenue_budget_id);
        fetchData(data.revenue_budget_id);
    } finally { setIsRecalculating(false); }
  };

  const handleSaveStatus = async (status: "draft" | "submitted") => {
    if (!data) return;
    if (hasChanges) { alert("กรุณาบันทึกก่อนเปลี่ยนสถานะ"); return; }
    if (!confirm(status === 'submitted' ? "ยืนยันส่งงบประมาณ?" : "แก้ไขแบบร่าง?")) return;
    setIsSaving(true);
    try {
        await updateBudgetStatus(data.revenue_budget_id, status);
        fetchData(data.revenue_budget_id);
    } finally { setIsSaving(false); }
  };

  // ✅ Add Section / Item Functions
  const handleAddSection = async () => {
    const name = prompt("ชื่อหมวดหมู่ใหม่:");
    if (!name || !data) return;
    await addRevenueSection(data.revenue_budget_id, name);
    fetchData(data.revenue_budget_id);
  };

  const handleAddItem = async (sectionId: number, isDeduction: boolean) => {
    const name = prompt("ชื่อรายการใหม่:");
    if (!name || !data) return;
    await addRevenueItem(sectionId, name, isDeduction);
    fetchData(data.revenue_budget_id);
  };

  const handleDeleteItem = async (itemId: number) => {
    if(!confirm("ลบรายการนี้?")) return;
    if(!data) return;
    await deleteRevenueItem(itemId, data.revenue_budget_id);
    fetchData(data.revenue_budget_id);
  }

  return (
    <div className="flex min-h-screen bg-gray-50 pb-28">
      <Sidebar />
      <main className="flex-1 ml-64 p-6">
        <div className="max-w-5xl mx-auto">
          
          <div className="bg-white rounded-xl shadow-lg mb-6 relative z-20">
            <div className="bg-gradient-to-r from-blue-800 to-blue-900 px-8 py-6 flex justify-between items-center rounded-t-xl">
              <div>
                <h1 className="text-2xl font-bold text-white">ระบบจัดทำงบประมาณรายรับ</h1>
                {data && <span className="text-blue-200 text-sm">{data.status === 'draft' ? '(Draft)' : '(Submitted)'}</span>}
              </div>
              <div className="flex gap-3 relative">
                 <YearDropdown onYearChange={handleYearChange} />
              </div>
            </div>
            {data && (
              <div className="grid grid-cols-3 divide-x divide-gray-100 border-b-4 border-orange-400 bg-white rounded-b-xl">
                <div className="p-4 text-center">
                    <p className="text-gray-500 text-sm">รวมรายรับ</p>
                    <p className="text-2xl font-bold text-gray-800">{Number(data.total_amount).toLocaleString()}</p>
                </div>
                <div className="p-4 text-center">
                    <p className="text-red-500 text-sm">รวมยอดหัก</p>
                    <p className="text-2xl font-bold text-red-600">{(Number(data.total_amount) - Number(data.net_amount)).toLocaleString()}</p>
                </div>
                <div className="p-4 text-center bg-blue-50">
                    <p className="text-blue-600 text-sm">รายรับสุทธิ</p>
                    <p className="text-2xl font-bold text-blue-700">{Number(data.net_amount).toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>

          {isLoading ? ( <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-blue-600 animate-spin" /></div> ) 
          : !data ? ( 
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-300">
               <button onClick={handleCreatePlan} disabled={currentYearVal === 0} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md"><Plus /> สร้างแผนปี {currentYearVal}</button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 relative z-10 pb-4">
                
                {data.sections.map((section) => (
                  <div key={section.section_id} className="border-b border-gray-100 pb-2">
                    {/* Section Header */}
                    <div className="flex justify-between items-center pr-4">
                        <RowItem label={section.section_name} type="head" />
                        {data.status === 'draft' && (
                            <button onClick={() => handleAddItem(section.section_id, section.section_name.includes("หัก") || section.section_name.includes("จ่าย"))} className="text-xs text-blue-500 hover:text-blue-700">+ เพิ่มรายการ</button>
                        )}
                    </div>
                    
                    {/* Items */}
                    {section.items.map((item) => (
                      <div key={item.item_id} className="relative group">
                          <RowItem
                            label={item.item_name}
                            value={Number(item.amount)}
                            indent={true}
                            // Logic ซ่อน Input: ถ้าชื่อมี 1.1, คงเหลือ, หรือ 35% ให้เป็น Head หรือ Disabled
                            type={(item.item_name.startsWith("1.1") || item.item_name.includes("คงเหลือ") || item.item_name.includes("รายรับก่อนหัก")) ? "head" : "row"}
                            isDeduction={item.is_deduction || item.item_name.includes("35%")}
                            editable={data.status === 'draft' && !item.item_name.includes("คงเหลือ") && !item.item_name.includes("35%") && !item.item_name.includes("รายรับก่อนหัก")} 
                            onEdit={(val) => handleEdit(item.item_id, val)}
                          />
                          {/* ปุ่มลบ (แสดงเฉพาะรายการที่ผู้ใช้เพิ่มเอง หรือไม่ใช่รายการหลัก) */}
                          {data.status === 'draft' && !item.item_name.includes("ภาคเรียนที่") && !item.item_name.includes("35%") && !item.item_name.includes("คงเหลือ") && !item.item_name.startsWith("1.") && !item.item_name.includes("รายรับก่อนหัก") && (
                              <button onClick={() => handleDeleteItem(item.item_id)} className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600"><Trash2 className="w-3 h-3"/></button>
                          )}
                      </div>
                    ))}
                  </div>
                ))}

                {/* Add Section Button */}
                {data.status === 'draft' && (
                    <div className="p-4 text-center">
                        <button onClick={handleAddSection} className="text-sm text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-full border border-blue-200 border-dashed w-full">+ เพิ่มหมวดหมู่ใหม่</button>
                    </div>
                )}

                <div className="bg-gray-100 p-4 border-t border-gray-200 flex justify-between items-center mt-4">
                  <span className="font-bold text-gray-700">รวมรายรับสุทธิ</span>
                  <span className="text-xl font-bold text-blue-800 border-b-4 border-double border-blue-800">
                    {Number(data.net_amount).toLocaleString()} บาท
                  </span>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-2xl z-40 transition-transform duration-300 transform translate-y-0 ml-64">
                <div className="max-w-5xl mx-auto flex justify-between items-center px-6">
                    <div className="flex gap-2 items-center">
                        {hasChanges ? <span className="text-orange-600 font-bold text-sm bg-orange-50 px-2 py-1 rounded">มีรายการแก้ไขที่ยังไม่บันทึก</span> : <span className="text-green-600 text-sm flex items-center gap-1"><CheckCircle className="w-4 h-4"/> ข้อมูลล่าสุดแล้ว</span>}
                        {data.status === 'draft' && (
                           <button onClick={handleRecalculate} disabled={hasChanges} className="text-xs text-blue-500 underline disabled:opacity-50 ml-4">ดึงข้อมูล Enrollment ใหม่</button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        {hasChanges && (
                          <>
                            <button onClick={handleCancelChanges} className="text-gray-500 hover:text-gray-700 text-sm px-4">ยกเลิก</button>
                            <button onClick={handleSaveChanges} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg">บันทึกการเปลี่ยนแปลง</button>
                          </>
                        )}
                        {!hasChanges && (
                          <button onClick={() => handleSaveStatus(data.status === 'draft' ? 'submitted' : 'draft')} className={`border px-4 py-2 rounded-lg text-sm font-medium ${data.status === 'draft' ? 'bg-green-600 text-white border-green-600 hover:bg-green-700' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
                            {data.status === 'draft' ? 'ยืนยันใช้งานจริง (Submit)' : 'กลับไปแก้ไข (Draft)'}
                          </button>
                        )}
                    </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}