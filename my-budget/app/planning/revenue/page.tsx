"use client";

import { useState } from "react";
import Sidebar from "@/components/shared/Sidebar";
import YearDropdown from "@/components/shared/year";
import { Loader2, Save, FileText, TrendingUp, TrendingDown, Wallet, AlertCircle } from "lucide-react";
import { getRevenueData, createRevenuePlan, bulkUpdateRevenueItems } from "./actions";

import RevenueTable from "@/components/revenue-plan/RevenueTable";

// ... (Type Definitions เดิม) ...

export default function RevenuePage() {
  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [currentYearVal, setCurrentYearVal] = useState<number>(0);

  // ... (Functions fetchData, handleYearChange, handleCreate, handleUpdateItem เดิม) ...
  // ขอละไว้เพื่อความกระชับ (ใช้ Logic เดิมได้เลย)
  
  // Reuse Logic เดิม
  const fetchData = async (id: number) => {
    setIsLoading(true);
    try {
      const result = await getRevenueData(id);
      setData(result);
      setHasChanges(false);
    } finally { setIsLoading(false); }
  };

  const handleYearChange = (id: number | null, year: number) => {
    setCurrentYearVal(year);
    if (id) fetchData(id); else setData(null);
  };

  const handleCreate = async () => {
      if(!confirm(`สร้างแผนปี ${currentYearVal}?`)) return;
      setIsLoading(true);
      await createRevenuePlan(currentYearVal);
      window.location.reload(); 
  };
  
  const handleUpdateItem = (itemId: number, newVal: number) => {
     if (!data) return;
     const newData = { ...data };
     let found = false;
     newData.sections.forEach((sec: any) => {
         const item = sec.items.find((i: any) => i.item_id === itemId);
         if (item) { item.amount = newVal; found = true; }
     });
     if(!found) return;

     // Client-side Calc Simulation (เหมือนเดิม)
     const sec1 = newData.sections.find((s: any) => s.sort_order === 1);
     if(sec1) {
         const terms = sec1.items.filter((i: any) => i.item_name.includes("ภาคเรียนที่"));
         const sumTerms = terms.reduce((acc: number, cur: any) => acc + Number(cur.amount), 0);
         const gross = sec1.items.find((i: any) => i.item_name.includes("รายรับก่อนหัก"));
         if(gross) gross.amount = sumTerms;
         const deduct = sec1.items.find((i: any) => i.item_name.includes("35%"));
         if(deduct) deduct.amount = sumTerms * 0.35;
         const net = sec1.items.find((i: any) => i.item_name.includes("คงเหลือ"));
         if(net) net.amount = sumTerms - (sumTerms * 0.35);
     }
     setData(newData);
     setHasChanges(true);
  };

  const handleSave = async () => {
     if (!data) return;
     setIsSaving(true);
     try {
       const updates = [];
       for(const sec of data.sections) {
           for(const item of sec.items) {
              updates.push({ itemId: item.item_id, amount: Number(item.amount) });
           }
       }
       await bulkUpdateRevenueItems(updates, data.revenue_budget_id);
       await fetchData(data.revenue_budget_id);
     } finally { setIsSaving(false); }
  };

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <Sidebar />
      <main className="flex-1 ml-64">
        {/* Header Bar */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-30 flex justify-between items-center shadow-sm">
           <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-2 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">ประมาณการรายรับ (Revenue Forecast)</h1>
                <p className="text-xs text-gray-500">คณะเทคโนโลยีสารสนเทศ</p>
              </div>
           </div>
           
           <div className="flex items-center gap-3">
              <YearDropdown onYearChange={handleYearChange} />
              
              {data && hasChanges && (
                  <button 
                    onClick={handleSave} 
                    disabled={isSaving} 
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition-all text-sm font-medium disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    บันทึกข้อมูล
                  </button>
              )}
           </div>
        </header>

        <div className="max-w-7xl mx-auto p-8 space-y-6">
           {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64">
                 <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                 <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
              </div>
           ) : !data ? (
              <div className="flex flex-col items-center justify-center h-[60vh] bg-white rounded-2xl border-2 border-dashed border-gray-200">
                 <Wallet className="w-16 h-16 text-gray-300 mb-4" />
                 <h3 className="text-lg font-medium text-gray-900">ยังไม่มีข้อมูลงบประมาณปี {currentYearVal}</h3>
                 <p className="text-gray-500 mb-6">กรุณาเลือกปีงบประมาณอื่น หรือสร้างแผนใหม่</p>
                 <button onClick={handleCreate} disabled={currentYearVal === 0} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300">
                    + สร้างแผนงบประมาณ
                 </button>
              </div>
           ) : (
              <>
                 {/* Dashboard Summary Cards */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
                       <div className="flex items-center gap-3 text-gray-500 mb-2">
                          <TrendingUp className="w-5 h-5" /> <span className="text-sm font-medium">รายรับทั้งหมด (Total Revenue)</span>
                       </div>
                       <p className="text-3xl font-bold text-gray-900">{data.total_amount.toLocaleString()}</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
                       <div className="flex items-center gap-3 text-red-500 mb-2">
                          <TrendingDown className="w-5 h-5" /> <span className="text-sm font-medium">รายการหัก / ค่าใช้จ่าย (Expenses)</span>
                       </div>
                       <p className="text-3xl font-bold text-red-600">{(data.total_amount - data.net_amount).toLocaleString()}</p>
                    </div>

                    <div className="bg-blue-600 p-6 rounded-xl border border-blue-700 shadow-md text-white flex flex-col justify-between relative overflow-hidden">
                       <div className="relative z-10">
                          <div className="flex items-center gap-3 text-blue-100 mb-2">
                             <Wallet className="w-5 h-5" /> <span className="text-sm font-medium">รายรับสุทธิ (Net Amount)</span>
                          </div>
                          <p className="text-3xl font-bold text-white">{data.net_amount.toLocaleString()}</p>
                       </div>
                       <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4">
                          <Wallet className="w-32 h-32" />
                       </div>
                    </div>
                 </div>
                
                 {/* Status Bar */}
                 <div className="flex items-center gap-2 bg-yellow-50 text-yellow-800 px-4 py-2 rounded-lg text-sm border border-yellow-100">
                    <AlertCircle className="w-4 h-4" />
                    <span>สถานะเอกสาร: <strong>{data.status.toUpperCase()}</strong></span>
                    {hasChanges && <span className="text-orange-600 ml-auto font-medium">• มีการแก้ไขที่ยังไม่บันทึก</span>}
                 </div>

                 {/* Main Grid Table */}
                 <RevenueTable 
                    sections={data.sections} 
                    onUpdate={handleUpdateItem} 
                    readOnly={data.status === 'submitted'}
                 />

                 <div className="h-12"></div> {/* Spacer Footer */}
              </>
           )}
        </div>
      </main>
    </div>
  );
}