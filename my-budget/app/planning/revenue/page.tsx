"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/shared/Sidebar";
import YearDropdown from "@/components/shared/year";
import RowItem from "@/components/plan/RowItem";
import { Loader2, Coins, TrendingDown, Wallet, Plus, Save, FileText, CheckCircle, Send, AlertCircle, RotateCcw } from "lucide-react";
import { getRevenueData, createRevenuePlan, updateBudgetStatus, bulkUpdateRevenueItems } from "./actions";

// Type Definition
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
  const [originalData, setOriginalData] = useState<RevenueData | null>(null); // เก็บค่าเดิมไว้เปรียบเทียบ
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // State สำหรับปีที่เลือก
  const [currentYearVal, setCurrentYearVal] = useState<number>(0);
  const [currentId, setCurrentId] = useState<number | null>(null);

  // State เก็บรายการที่ถูกแก้ไข (Pending Changes)
  const [hasChanges, setHasChanges] = useState(false);

  // 1. จัดการการเลือกปีจาก Dropdown
  const handleYearChange = (id: number | null, year: number) => {
    setCurrentId(id);
    setCurrentYearVal(year);
    
    // เคลียร์สถานะการแก้ไขเมื่อเปลี่ยนปี
    setHasChanges(false); 
    
    if (id) {
      fetchData(id);
    } else {
      setData(null); 
      setOriginalData(null);
    }
  };

  // ฟังก์ชันดึงข้อมูล
  const fetchData = async (id: number) => {
    setIsLoading(true);
    try {
      const result = await getRevenueData(id);
      setData(result as any);
      setOriginalData(JSON.parse(JSON.stringify(result))); // Deep Clone เก็บค่าตั้งต้น
      setHasChanges(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. ฟังก์ชันสร้างแผนใหม่
  const handleCreatePlan = async () => {
    if (!confirm(`ยืนยันการสร้างแผนงบประมาณปี ${currentYearVal}?`)) return;
    
    setIsLoading(true);
    try {
      const result = await createRevenuePlan(currentYearVal);
      if (result.success && result.newId) {
        setCurrentId(result.newId);
        fetchData(result.newId);    
      } else {
        alert("เกิดข้อผิดพลาด: " + result.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 3. ฟังก์ชันแก้ไขตัวเลข (แก้ไข Local State เท่านั้น ยังไม่ Save)
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
    
    // คำนวณยอดรวมใหม่ (ในหน้าจอ) เพื่อให้เห็นผลลัพธ์ทันที
    let tempTotal = 0;
    let tempDeduct = 0;
    newData.sections.forEach(sec => {
      sec.items.forEach(item => {
        if (item.is_deduction) tempDeduct += Number(item.amount);
        else tempTotal += Number(item.amount);
      });
    });
    newData.total_amount = tempTotal;
    newData.net_amount = tempTotal - tempDeduct;

    setData(newData);
    setHasChanges(true); // เปิด flag ว่ามีการแก้ไข
  };

  // 4. ✅ ฟังก์ชันกดบันทึก (Save Changes)
  const handleSaveChanges = async () => {
    if (!data) return;
    setIsSaving(true);

    try {
      // รวบรวมรายการที่เปลี่ยนไป
      const updates = [];
      for (const sec of data.sections) {
        for (const item of sec.items) {
          // เปรียบเทียบกับ originalData หรือส่งไปทั้งหมดก็ได้ (เพื่อความชัวร์ส่งทั้งหมดในหน้านี้ง่ายกว่าสำหรับ case นี้)
          // แต่เพื่อ performance ควรส่งเฉพาะที่เปลี่ยน
          // ในที่นี้ส่งทั้งหมดง่ายสุดสำหรับการ demo แต่ถ้าข้อมูลเยอะควร diff
          updates.push({ itemId: item.item_id, amount: Number(item.amount) });
        }
      }

      const result = await bulkUpdateRevenueItems(updates, data.revenue_budget_id);
      
      if (result.success) {
        // อัปเดต originalData ให้เป็นค่าล่าสุด
        setOriginalData(JSON.parse(JSON.stringify(data)));
        setHasChanges(false);
        // alert("บันทึกข้อมูลเรียบร้อย ✅"); // ไม่ต้อง alert ก็ได้ ถ้าปุ่มเปลี่ยนสถานะกลับ
      } else {
        alert("บันทึกไม่สำเร็จ ❌");
      }
    } finally {
      setIsSaving(false);
    }
  };

  // 5. ฟังก์ชันยกเลิกการแก้ไข (Revert)
  const handleCancelChanges = () => {
    if (!originalData) return;
    if (confirm("คุณต้องการยกเลิกการแก้ไขทั้งหมด และกลับไปใช้ค่าล่าสุดที่บันทึกไว้?")) {
      setData(JSON.parse(JSON.stringify(originalData)));
      setHasChanges(false);
    }
  };

  // 6. ฟังก์ชันเปลี่ยนสถานะ (Draft <-> Submitted)
  const handleSaveStatus = async (status: "draft" | "submitted") => {
    if (!data) return;
    
    // ถ้ามีการแก้ไขค้างอยู่ ต้องบังคับบันทึกก่อน
    if (hasChanges) {
      alert("กรุณาบันทึกการแก้ไขตัวเลข (Save Changes) ก่อนเปลี่ยนสถานะ");
      return;
    }

    const message = status === 'submitted' 
      ? "ยืนยันการส่งงบประมาณ? ข้อมูลจะถูกล็อกไม่ให้แก้ไข" 
      : "ยืนยันการกลับไปแก้ไขแบบร่าง?";
      
    if (!confirm(message)) return;

    setIsSaving(true);
    try {
      setData({ ...data, status: status });
      await updateBudgetStatus(data.revenue_budget_id, status);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 pb-28"> {/* เพิ่ม padding ล่างเผื่อ Footer ลอย */}
      <Sidebar />
      <main className="flex-1 ml-64 p-6">
        <div className="max-w-5xl mx-auto">
          
          {/* --- Header Area --- */}
          <div className="bg-white rounded-xl shadow-lg mb-6 relative z-20">
            <div className="bg-gradient-to-r from-blue-800 to-blue-900 px-8 py-6 flex justify-between items-center rounded-t-xl">
              <div>
                <h1 className="text-2xl font-bold text-white">ระบบจัดทำงบประมาณรายรับ</h1>
                <div className="flex items-center gap-2 mt-2">
                   {data && (
                    <span className={`px-2 py-0.5 text-xs rounded-full border flex items-center gap-1 ${
                      data.status === 'draft' 
                        ? 'bg-yellow-100 text-yellow-700 border-yellow-200' 
                        : 'bg-green-100 text-green-700 border-green-200'
                    }`}>
                      {data.status === 'draft' ? <FileText className="w-3 h-3"/> : <CheckCircle className="w-3 h-3"/>}
                      {data.status === 'draft' ? 'แบบร่าง (Draft)' : 'ใช้งานจริง (Actual)'}
                    </span>
                   )}
                </div>
              </div>
              <div className="flex gap-3 relative">
                 <YearDropdown onYearChange={handleYearChange} />
              </div>
            </div>
            
            {data && (
              <div className="grid grid-cols-3 divide-x divide-gray-100 border-b-4 border-orange-400 bg-white rounded-b-xl">
                <div className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-500 text-sm mb-1">
                    <Coins className="w-4 h-4" /> ประมาณการรายรับรวม
                  </div>
                  <div className="text-2xl font-bold text-gray-800">
                    {Number(data.total_amount || 0).toLocaleString()}
                  </div>
                </div>
                <div className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-red-500 text-sm mb-1">
                    <TrendingDown className="w-4 h-4" /> หักค่าใช้จ่าย/สมทบ
                  </div>
                  <div className="text-2xl font-bold text-red-600">
                    { (Number(data.total_amount || 0) - Number(data.net_amount || 0)).toLocaleString() }
                  </div>
                </div>
                <div className="p-4 text-center bg-blue-50 rounded-br-xl">
                  <div className="flex items-center justify-center gap-2 text-blue-600 text-sm mb-1">
                    <Wallet className="w-4 h-4" /> รายรับสุทธิ
                  </div>
                  <div className="text-2xl font-bold text-blue-700">
                    {Number(data.net_amount || 0).toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* --- Content Area --- */}
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-blue-600 animate-spin" /></div>
          ) : !data ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-300 shadow-sm">
              <div className="bg-blue-50 p-4 rounded-full mb-4"><Coins className="w-12 h-12 text-blue-400" /></div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">ยังไม่มีแผนงบประมาณปี {currentYearVal}</h3>
              <p className="text-gray-500 mb-6 text-center max-w-md">ระบบจะสร้างโครงสร้างรายการและคำนวณช่วงเวลาภาคการศึกษาให้อัตโนมัติ</p>
              <button onClick={handleCreatePlan} disabled={currentYearVal === 0} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-md transition-all active:scale-95 disabled:opacity-50">
                <Plus className="w-5 h-5" /> สร้างแผนปี {currentYearVal}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* ตารางข้อมูล */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 relative z-10">
                {data.sections.map((section) => (
                  <div key={section.section_id}>
                    <RowItem label={section.section_name} type="head" />
                    {section.items.map((item) => (
                      <RowItem
                        key={item.item_id}
                        label={item.item_name}
                        value={Number(item.amount)}
                        indent={true}
                        isDeduction={item.is_deduction}
                        editable={data.status === 'draft'} 
                        onEdit={(val) => handleEdit(item.item_id, val)}
                      />
                    ))}
                  </div>
                ))}
                <div className="bg-gray-100 p-4 border-t border-gray-200 flex justify-between items-center">
                  <span className="font-bold text-gray-700">รวมรายรับสุทธิ (Net Income)</span>
                  <span className="text-xl font-bold text-blue-800 border-b-4 border-double border-blue-800">
                    {Number(data.net_amount).toLocaleString()} บาท
                  </span>
                </div>
              </div>

              {/* ✅ Footer Actions Bar (ติดด้านล่างจอ) */}
              <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-2xl z-40 transition-transform duration-300 transform translate-y-0 ml-64">
                <div className="max-w-5xl mx-auto flex justify-between items-center px-6">
                  
                  {/* ฝั่งซ้าย: สถานะการแก้ไข */}
                  <div className="flex items-center gap-4">
                    {hasChanges ? (
                      <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100 animate-pulse">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm font-semibold">มีการแก้ไขที่ยังไม่ได้บันทึก</span>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>ข้อมูลล่าสุดแล้ว</span>
                      </div>
                    )}
                  </div>

                  {/* ฝั่งขวา: ปุ่ม Action */}
                  <div className="flex gap-3">
                    
                    {/* ปุ่มยกเลิก/บันทึก (แสดงเมื่อมีการแก้ไข) */}
                    {hasChanges && (
                      <>
                        <button 
                          onClick={handleCancelChanges}
                          disabled={isSaving}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          <RotateCcw className="w-4 h-4" /> ยกเลิก
                        </button>
                        <button 
                          onClick={handleSaveChanges}
                          disabled={isSaving}
                          className="flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200 transition-transform active:scale-95"
                        >
                          {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4" />}
                          บันทึกการเปลี่ยนแปลง
                        </button>
                      </>
                    )}

                    {/* เส้นคั่น */}
                    <div className="w-px h-8 bg-gray-300 mx-2"></div>

                    {/* ปุ่มเปลี่ยนสถานะ (แสดงเมื่อไม่มีการแก้ไขค้างอยู่) */}
                    {!hasChanges && data.status !== 'draft' && (
                      <button 
                        onClick={() => handleSaveStatus('draft')}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-white text-gray-700 border-gray-300 hover:bg-gray-50 text-sm font-medium transition-colors"
                      >
                        <FileText className="w-4 h-4" /> แก้ไขแบบร่าง
                      </button>
                    )}

                    {!hasChanges && data.status === 'draft' && (
                      <button 
                        onClick={() => handleSaveStatus('submitted')}
                        className="flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold bg-green-600 text-white hover:bg-green-700 shadow-md shadow-green-200 transition-transform active:scale-95"
                      >
                        <Send className="w-4 h-4" /> ยืนยันใช้งานจริง
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