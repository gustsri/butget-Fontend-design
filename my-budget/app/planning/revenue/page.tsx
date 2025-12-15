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
  Calendar
} from "lucide-react";
import { getRevenueData, createRevenuePlan, bulkUpdateRevenueItems } from "./actions";
import RevenueTable from "@/components/revenue-plan/RevenueTable";

export default function RevenuePage() {
  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [currentYearVal, setCurrentYearVal] = useState<number>(0);

  // --- Logic เดิมสำหรับการจัดการข้อมูล ---

  const fetchData = async (id: number) => {
    setIsLoading(true);
    try {
      const result = await getRevenueData(id);
      setData(result);
      setHasChanges(false);
    } finally { 
      setIsLoading(false); 
    }
  };

  const handleYearChange = (id: number | null, year: number) => {
    setCurrentYearVal(year);
    if (id) {
      fetchData(id);
    } else {
      setData(null);
    }
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
     
     // Update value
     newData.sections.forEach((sec: any) => {
         const item = sec.items.find((i: any) => i.item_id === itemId);
         if (item) { 
             item.amount = newVal; 
             found = true; 
         }
     });
     if(!found) return;

     // Client-side Simulation Calculation (Logic เดิม)
     const sec1 = newData.sections.find((s: any) => s.sort_order === 1);
     if(sec1) {
         // รวมยอดเทอม
         const terms = sec1.items.filter((i: any) => i.item_name.includes("ภาคเรียนที่"));
         const sumTerms = terms.reduce((acc: number, cur: any) => acc + Number(cur.amount), 0);
         
         // อัปเดต รายรับก่อนหัก
         const gross = sec1.items.find((i: any) => i.item_name.includes("รายรับก่อนหัก"));
         if(gross) gross.amount = sumTerms;
         
         // อัปเดต หัก 35%
         const deduct = sec1.items.find((i: any) => i.item_name.includes("35%"));
         let deductAmount = 0;
         if(deduct) {
             deductAmount = sumTerms * 0.35;
             deduct.amount = deductAmount;
         }
         
         // อัปเดต คงเหลือ
         const net = sec1.items.find((i: any) => i.item_name.includes("คงเหลือ"));
         if(net) net.amount = sumTerms - deductAmount;
         
         // Note: ตัวเลข Total Summary ของ Dashboard จะไม่อัปเดต Realtime จนกว่าจะ Refetch 
         // แต่ถ้าต้องการให้ Card เปลี่ยนด้วย ต้องคำนวณ data.total_amount, data.net_amount ใหม่ตรงนี้
         // (ในที่นี้ขอคง Logic เดิมไว้ก่อน)
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
       await fetchData(data.revenue_budget_id); // Fetch ใหม่เพื่อให้ได้ยอดรวมที่ถูกต้องจาก DB
     } finally { setIsSaving(false); }
  };

  // --- ส่วน Render UI ---

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8 space-y-8">
        
        {/* 1. Header Section (Design ใหม่ สีน้ำเงินเข้ม) */}
        <div className="bg-[#1e293b] rounded-xl shadow-lg z-20 relative p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
              
              {/* Left: Titles */}
              <div className="space-y-4">
                <div>
                  <h6 className="text-blue-300 text-xs font-bold tracking-wider uppercase mb-1">
                    IT BUDGET PLANNING SYSTEM
                  </h6>
                  <h1 className="text-3xl font-bold text-white tracking-tight">
                    ประมาณการรายรับ (Revenue Forecast)
                  </h1>
                </div>
                
                <button className="flex items-center gap-2 px-4 py-1.5 bg-slate-700/50 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded border border-slate-600 transition-colors">
                  <Database className="w-3 h-3" />
                  Master Data
                </button>
              </div>

              {/* Right: Year Selector & Actions */}
              <div className="flex flex-col items-end gap-3">
                <div className="flex items-center gap-2 text-white">
                    <span className="text-sm text-slate-300 flex items-center gap-1">
                        <Calendar className="w-4 h-4" /> ปีงบประมาณ:
                    </span>
                    <div className="bg-white/10 rounded-lg p-0.5">
                         {/* ส่ง handleYearChange เข้าไปเหมือนเดิม */}
                        <YearDropdown onYearChange={handleYearChange} />
                    </div>
                </div>

                {/* ปุ่ม Save จะแสดงเมื่อมีข้อมูลและการแก้ไข */}
                {data && (
                    <div className="flex gap-2">
                         {hasChanges ? (
                            <button 
                                onClick={handleSave} 
                                disabled={isSaving} 
                                className="flex items-center gap-2 px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                <span>บันทึกการแก้ไข</span>
                            </button>
                         ) : (
                             <div className="px-6 py-2.5 bg-green-600/20 text-green-400 border border-green-600/30 rounded font-medium text-sm flex items-center gap-2">
                                <Save className="w-4 h-4" /> บันทึกแล้ว
                             </div>
                         )}
                    </div>
                )}
              </div>
            </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-sm border border-gray-100">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-500 font-medium">กำลังโหลดข้อมูล...</p>
            </div>
        ) : !data ? (
            // Empty State
            <div className="flex flex-col items-center justify-center h-[50vh] bg-white rounded-xl border-2 border-dashed border-gray-200">
                <div className="bg-gray-50 p-4 rounded-full mb-4">
                    <Wallet className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">ยังไม่มีข้อมูลงบประมาณปี {currentYearVal || '...'}</h3>
                <p className="text-gray-500 mb-6">กรุณาเลือกปีงบประมาณอื่น หรือสร้างแผนใหม่</p>
                <button 
                    onClick={handleCreate} 
                    disabled={!currentYearVal || currentYearVal === 0} 
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    สร้างแผนงบประมาณปี {currentYearVal}
                </button>
            </div>
        ) : (
            <>
                {/* 2. Stats Dashboard (3 Cards) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Card 1: รายรับรวม */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500 relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-sm text-gray-500 font-medium mb-1">รายรับทั้งหมด (Total Revenue)</p>
                                <h3 className="text-3xl font-bold text-slate-800">
                                    ฿ {data.total_amount.toLocaleString()}
                                </h3>
                            </div>
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    {/* Card 2: รายจ่าย (Expenses) */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500 relative overflow-hidden group">
                         <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-sm text-gray-500 font-medium mb-1">รายการหัก / ค่าใช้จ่าย (Expenses)</p>
                                <h3 className="text-3xl font-bold text-slate-800">
                                    ฿ {(data.total_amount - data.net_amount).toLocaleString()}
                                </h3>
                            </div>
                            <div className="p-2 bg-red-50 rounded-lg text-red-600">
                                <TrendingDown className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    {/* Card 3: สุทธิ (Net) */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500 relative overflow-hidden group">
                         <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-sm text-gray-500 font-medium mb-1">รายรับสุทธิ (Net Amount)</p>
                                <h3 className="text-3xl font-bold text-emerald-600">
                                    ฿ {data.net_amount.toLocaleString()}
                                </h3>
                            </div>
                            <div className="p-2 bg-green-50 rounded-lg text-green-600">
                                <Wallet className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Bar */}
                <div className="flex items-center gap-2 bg-yellow-50 text-yellow-800 px-4 py-3 rounded-lg text-sm border border-yellow-200/60 shadow-sm">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <span>สถานะเอกสาร: <strong className="uppercase">{data.status}</strong></span>
                    {hasChanges && <span className="text-orange-600 ml-auto font-bold animate-pulse">• มีการแก้ไขที่ยังไม่บันทึก</span>}
                </div>

                {/* 3. Content Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <RevenueTable 
                        sections={data.sections} 
                        onUpdate={handleUpdateItem} 
                        readOnly={data.status === 'submitted'}
                    />
                </div>
                
                <div className="h-8"></div>
            </>
        )}
      </main>
    </div>
  );
}