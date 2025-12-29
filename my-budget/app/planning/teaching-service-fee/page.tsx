"use client";
import React, { useState, useEffect, memo, useMemo } from "react";
import Sidebar from "@/components/shared/Sidebar";
import YearDropdown from "@/components/shared/year"; 
import { ChevronDown, Loader2, Save, BookOpen, AlertCircle, Calendar } from "lucide-react";
// 1. ปลดคอมเมนต์บรรทัดนี้เพื่อใช้งาน Server Actions จริง
import { getTeachingFeeData, updateTeachingFee } from "./actions"; 

// --- ประเภทข้อมูล (Interfaces) ---
interface TeachingFeeItem {
  id: number;
  courseCode: string;
  courseName: string;
  yearLevel: string;
  studentRegular: number;
  studentSpecial: number;
  credits: string;
  feeRegular: number;
  feeSpecial: number;
  feeSum: number;
  grandTotal: number;
}

// --- Sub-Components ---
const TableHeader = () => (
    <thead className="sticky top-0 z-10 shadow-sm">
        <tr className="bg-slate-50 border-b border-slate-200">
            <th rowSpan={2} className="border-r border-slate-200 p-3 text-center font-semibold text-slate-700 text-xs w-[10%] uppercase tracking-wider">รหัสวิชา</th>
            <th rowSpan={2} className="border-r border-slate-200 p-3 text-left font-semibold text-slate-700 text-xs w-[25%]">สาขา/ชื่อวิชา</th>
            <th rowSpan={2} className="border-r border-slate-200 p-3 text-center font-semibold text-slate-700 text-xs w-[5%]">ชั้นปี</th>
            <th colSpan={2} className="border-r border-b border-slate-200 p-2 text-center font-semibold text-slate-700 text-xs">จำนวนนักศึกษา (คน)</th>
            <th rowSpan={2} className="border-r border-slate-200 p-3 text-center font-semibold text-slate-700 text-xs w-[10%]">หน่วยกิต</th>
            <th colSpan={3} className="border-r border-b border-slate-200 p-2 text-center font-semibold text-slate-700 text-xs bg-indigo-50/50">โอนหน่วยกิต (150)</th>
            <th rowSpan={2} className="p-3 text-center font-bold text-indigo-900 text-xs bg-indigo-100/50">รวมทั้งสิ้น</th>
        </tr>
        <tr className="bg-slate-50 border-b border-slate-200">
            <th className="border-r border-slate-200 p-2 text-center font-medium text-slate-600 text-[10px]">ปกติ</th>
            <th className="border-r border-slate-200 p-2 text-center font-medium text-slate-600 text-[10px]">สมทบ</th>
            <th className="border-r border-slate-200 p-2 text-center font-medium text-slate-600 text-[10px] bg-indigo-50/30">ปกติ</th>
            <th className="border-r border-slate-200 p-2 text-center font-medium text-slate-600 text-[10px] bg-indigo-50/30">สมทบ</th>
            <th className="border-r border-slate-200 p-2 text-center font-medium text-slate-600 text-[10px] bg-indigo-50/50 text-indigo-700">รวม</th>
        </tr>
    </thead>
);

const TeachingFeeRow = memo(({ item, onEdit }: { 
    item: TeachingFeeItem, 
    onEdit: (id: number, field: string, value: string) => void
}) => {
    const renderInput = (field: 'studentRegular' | 'studentSpecial', val: number) => (
        <td className="border-r border-slate-100 p-0 group">
            <input 
                type="number" 
                min="0"
                value={val === 0 ? "" : val}
                placeholder="0"
                onChange={(e) => onEdit(item.id, field, e.target.value)}
                onFocus={(e) => e.target.select()}
                className="w-full text-center text-sm py-3 bg-transparent outline-none font-medium text-slate-800 focus:bg-blue-50 focus:ring-1 focus:ring-inset focus:ring-blue-400 transition-all"
            />
        </td>
    );

    return (
        <tr className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 group text-slate-700">
            <td className="border-r border-slate-100 p-3 text-center text-xs font-mono text-slate-500">{item.courseCode}</td>
            <td className="border-r border-slate-100 p-3 text-sm font-semibold">{item.courseName}</td>
            <td className="border-r border-slate-100 p-3 text-center text-sm">{item.yearLevel}</td>
            {renderInput("studentRegular", item.studentRegular)}
            {renderInput("studentSpecial", item.studentSpecial)}
            <td className="border-r border-slate-100 p-3 text-center text-sm">{item.credits}</td>
            <td className="border-r border-slate-100 p-3 text-right text-sm">{item.feeRegular.toLocaleString()}</td>
            <td className="border-r border-slate-100 p-3 text-right text-sm">{item.feeSpecial.toLocaleString()}</td>
            <td className="border-r border-slate-100 p-3 text-right text-sm font-bold text-indigo-600 bg-indigo-50/20">{item.feeSum.toLocaleString()}</td>
            <td className="p-3 text-right text-sm font-bold text-blue-800 bg-blue-50/30 group-hover:bg-blue-50 transition-colors">{item.grandTotal.toLocaleString()}</td>
        </tr>
    );
});
TeachingFeeRow.displayName = "TeachingFeeRow";

export default function TeachingFeePage() {
  const [data, setData] = useState<TeachingFeeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [pendingChanges, setPendingChanges] = useState<Record<number, any>>({});

  useEffect(() => { 
    if (selectedYear) fetchData(); 
  }, [selectedYear, selectedSemester]);

  const fetchData = async () => {
    if (!selectedYear) return;
    setIsLoading(true);
    try {
      // ดึงข้อมูลจริงจาก Server Action
      const result = await getTeachingFeeData(selectedYear, selectedSemester);
      setData(result as TeachingFeeItem[]);
      setPendingChanges({}); 
    } catch (error) { 
      console.error("Fetch error:", error); 
    } finally { 
      setIsLoading(false); 
    }
  };

  const handleEdit = (id: number, field: string, value: string) => {
    const numValue = value === "" ? 0 : Math.max(0, parseInt(value));
    
    setData(prev => prev.map(row => {
        if (row.id === id) {
            const updated = { ...row, [field]: numValue };
            // คำนวณยอดเงินใหม่ (คนละ 150 บาท)
            updated.feeRegular = updated.studentRegular * 150; 
            updated.feeSpecial = updated.studentSpecial * 150;
            updated.feeSum = updated.feeRegular + updated.feeSpecial;
            updated.grandTotal = updated.feeSum;
            return updated;
        }
        return row;
    }));

    // เก็บเฉพาะฟิลด์ที่ต้องการส่งไปอัปเดตใน DB
    const dbField = field === "studentRegular" ? "student_regular_count" : "student_special_count";
    setPendingChanges(prev => ({ 
      ...prev, 
      [id]: { ...(prev[id] || {}), [dbField]: numValue } 
    }));
  };

  const handleSaveAll = async () => {
    if (!selectedYear) return;
    const itemsToUpdate = Object.entries(pendingChanges).map(([id, updates]) => ({ 
      id: Number(id), 
      updates 
    }));
    
    if (itemsToUpdate.length === 0) return;
    
    setIsLoading(true);
    try {
      const result = await updateTeachingFee(itemsToUpdate, selectedYear, selectedSemester);
      if (result.success) { 
        setPendingChanges({}); 
        fetchData(); 
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const totals = useMemo(() => data.reduce((acc, curr) => ({
    regular: acc.regular + curr.studentRegular,
    special: acc.special + curr.studentSpecial,
    feeReg: acc.feeReg + curr.feeRegular,
    feeSpe: acc.feeSpe + curr.feeSpecial,
    feeSum: acc.feeSum + curr.feeSum,
    grandTotal: acc.grandTotal + curr.grandTotal
  }), { regular: 0, special: 0, feeReg: 0, feeSpe: 0, feeSum: 0, grandTotal: 0 }), [data]);

  const hasChanges = Object.keys(pendingChanges).length > 0;

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900"> 
      <Sidebar />
      <main className="flex-1 ml-64 p-8 pb-32">
        <div className="max-w-7xl mx-auto">
          
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 mb-8 relative z-30">
            <div className="bg-slate-900 px-10 py-10 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-visible">
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full -mr-48 -mt-48 blur-[80px] pointer-events-none"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-3">
                    <div className="bg-blue-600 p-2.5 rounded-2xl">
                        <BookOpen size={24} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white">ค่าสอนบริการ</h1>
                </div>
                <p className="text-slate-400 text-sm font-medium flex items-center gap-2 ml-14 uppercase tracking-wide">
                    Information Technology <span className="text-slate-700">/</span> General Education
                </p>
              </div>

              <div className="flex items-center gap-3 relative z-40 bg-white/5 p-2 rounded-2xl backdrop-blur-md border border-white/10">
                <div className="relative">
                    <select 
                        value={selectedSemester}
                        onChange={(e) => setSelectedSemester(Number(e.target.value))}
                        className="appearance-none bg-white text-slate-900 px-5 py-2.5 pr-12 rounded-xl text-sm font-bold cursor-pointer hover:bg-slate-50 transition-all outline-none shadow-sm min-w-[140px]"
                    >
                        <option value={1}>ภาคเรียนที่ 1</option>
                        <option value={2}>ภาคเรียนที่ 2</option>
                        <option value={3}>ภาคเรียนที่ 3</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>
                <div className="h-8 w-[1px] bg-white/10 mx-1"></div>
                <YearDropdown onYearChange={(_, val) => setSelectedYear(val)} />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden z-10 relative">
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-40 gap-4">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                    <p className="text-slate-400 font-bold tracking-widest text-xs uppercase">Loading</p>
                </div>
            ) : !selectedYear ? (
                <div className="text-center py-40">
                    <Calendar className="text-slate-200 mx-auto mb-6" size={64} />
                    <h3 className="text-slate-800 font-bold text-xl">เลือกปีงบประมาณ</h3>
                    <p className="text-slate-400 mt-2">โปรดเลือกปีและภาคเรียนเพื่อเรียกดูข้อมูล</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <TableHeader />
                        <tbody className="divide-y divide-slate-100">
                            {data.map((item) => (
                                <TeachingFeeRow key={item.id} item={item} onEdit={handleEdit} />
                            ))}
                            <tr className="bg-slate-50/50 font-bold">
                                <td colSpan={3} className="border-r border-slate-200 p-5 text-center text-slate-700">รวมทั้งสิ้น</td>
                                <td className="border-r border-slate-200 p-5 text-center text-slate-800">{totals.regular.toLocaleString()}</td>
                                <td className="border-r border-slate-200 p-5 text-center text-slate-800">{totals.special.toLocaleString()}</td>
                                <td className="border-r border-slate-200 p-5 text-center text-slate-400">-</td>
                                <td className="border-r border-slate-200 p-5 text-right text-slate-700">{totals.feeReg.toLocaleString()}</td>
                                <td className="border-r border-slate-200 p-5 text-right text-slate-700">{totals.feeSpe.toLocaleString()}</td>
                                <td className="border-r border-slate-200 p-5 text-right text-indigo-700 bg-indigo-50/30">{totals.feeSum.toLocaleString()}</td>
                                <td className="p-5 text-right text-blue-700 text-2xl bg-blue-50/50">{totals.grandTotal.toLocaleString()}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
          </div>
        </div>
      </main>

      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 ml-32 w-full max-w-4xl transition-all duration-500 transform z-50 ${hasChanges ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
          <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl px-10 py-5 flex items-center justify-between">
             <div className="flex items-center gap-6 text-white">
                <AlertCircle className="text-amber-400" size={28} />
                <div>
                    <h4 className="font-bold text-base">ยืนยันการเปลี่ยนแปลง?</h4>
                    <p className="text-xs text-slate-400 uppercase tracking-widest mt-0.5">{Object.keys(pendingChanges).length} รายการที่รอการบันทึก</p>
                </div>
             </div>
             <div className="flex items-center gap-4">
                <button onClick={() => fetchData()} className="px-6 py-3 rounded-2xl text-sm font-bold text-slate-400 hover:text-white">ยกเลิก</button>
                <button onClick={handleSaveAll} className="flex items-center gap-3 px-10 py-3.5 rounded-2xl text-sm font-black bg-blue-600 text-white hover:bg-blue-500 shadow-xl transition-all active:scale-95">
                    <Save size={20} /> บันทึกข้อมูล
                </button>
             </div>
          </div>
      </div>
    </div>
  );
}