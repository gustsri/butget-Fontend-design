"use client";
import React, { useState, useEffect, memo, useMemo } from "react";
import Sidebar from "@/components/shared/Sidebar";
import YearDropdown from "@/components/shared/year"; 
import { 
  ChevronDown, Loader2, Save, BookOpen, 
  AlertCircle, Calendar, Plus, X 
} from "lucide-react";
import { getTeachingFeeData, updateTeachingFee, addTeachingFeeItem } from "./actions";

// --- Interfaces ---
interface TeachingFeeItem {
  id: number;
  courseCode: string;
  courseName: string;
  yearLevel: string;
  studentRegular: number;
  studentSpecial: number;
  credits: number; 
  creditsStructure: string;
  feeRegular: number;
  feeSpecial: number;
  feeSum: number;
  grandTotal: number;
}

// --- Sub-Components ---
const AddItemModal = ({ isOpen, onClose, onSave }: any) => {
  const [formData, setFormData] = useState({
    courseCode: "", 
    courseName: "", 
    yearLevel: "1", 
    studentRegular: 0, 
    studentSpecial: 0, 
    credits: 3, 
    creditsStructure: "3-0-6"
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
          <h2 className="text-2xl font-black text-slate-800">เพิ่มรายวิชาใหม่</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={24} /></button>
        </div>
        
        <div className="p-8 space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">ข้อมูลวิชา</label>
            <div className="grid grid-cols-2 gap-4">
              <input className="p-3 bg-slate-50 rounded-xl outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 transition-all" 
                placeholder="รหัสวิชา" onChange={e => setFormData({...formData, courseCode: e.target.value})} />
              
              <div className="flex gap-2">
                <input type="number" className="w-16 p-3 bg-slate-50 rounded-xl outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 text-center" 
                  placeholder="นก." title="หน่วยกิต" onChange={e => setFormData({...formData, credits: +e.target.value})} />
                <input className="flex-1 p-3 bg-slate-50 rounded-xl outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500" 
                  placeholder="โครงสร้าง (3-0-6)" onChange={e => setFormData({...formData, creditsStructure: e.target.value})} />
              </div>
            </div>
          </div>

          <input className="w-full p-3 bg-slate-50 rounded-xl outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500" 
            placeholder="ชื่อรายวิชา" onChange={e => setFormData({...formData, courseName: e.target.value})} />

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">จำนวนนักศึกษา</label>
            <div className="grid grid-cols-3 gap-4">
              <select className="p-3 bg-slate-50 rounded-xl outline-none ring-1 ring-slate-200" 
                onChange={e => setFormData({...formData, yearLevel: e.target.value})}>
                <option value="1">ปี 1</option>
                {[2,3,4,5,6].map(v => <option key={v} value={v}>ปี {v}</option>)}
              </select>
              <input type="number" className="p-3 bg-slate-50 rounded-xl outline-none ring-1 ring-slate-200" 
                placeholder="ปกติ" onChange={e => setFormData({...formData, studentRegular: +e.target.value})} />
              <input type="number" className="p-3 bg-slate-50 rounded-xl outline-none ring-1 ring-slate-200" 
                placeholder="สมทบ" onChange={e => setFormData({...formData, studentSpecial: +e.target.value})} />
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-50 flex gap-3">
          <button onClick={onClose} className="flex-1 py-4 font-bold text-slate-500">ยกเลิก</button>
          <button onClick={() => onSave(formData)} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/20 active:scale-95 transition-all">บันทึกวิชา</button>
        </div>
      </div>
    </div>
  );
};

const TableHeader = () => (
  <thead className="sticky top-0 z-10 shadow-sm">
    <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 text-xs uppercase font-bold">
      <th rowSpan={2} className="p-3 border-r">รหัสวิชา</th>
      <th rowSpan={2} className="p-3 border-r text-left">สาขา/ชื่อวิชา</th>
      <th rowSpan={2} className="p-3 border-r">ชั้นปี</th>
      <th colSpan={2} className="p-2 border-r border-b">จำนวนนักศึกษา (คน)</th>
      <th rowSpan={2} className="p-3 border-r w-[10%]">หน่วยกิต</th>
      <th colSpan={3} className="p-2 border-r border-b bg-indigo-50/50">ค่าโอน (150)</th>
      <th rowSpan={2} className="p-3 bg-indigo-100/50 text-indigo-900">รวมทั้งสิ้น</th>
    </tr>
    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500">
      <th className="p-2 border-r">ปกติ</th>
      <th className="p-2 border-r">สมทบ</th>
      <th className="p-2 border-r bg-indigo-50/30">ปกติ</th>
      <th className="p-2 border-r bg-indigo-50/30">สมทบ</th>
      <th className="p-2 bg-indigo-50/50 text-indigo-700 font-bold uppercase">รวม</th>
    </tr>
  </thead>
);

const TeachingFeeRow = memo(({ item, onEdit }: { item: any, onEdit: any }) => (
  <tr className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 group text-slate-700">
    <td className="border-r p-3 text-center text-xs font-mono text-slate-500">{item.courseCode}</td>
    <td className="border-r p-3 text-sm font-semibold">{item.courseName}</td>
    <td className="border-r p-3 text-center text-sm">{item.yearLevel}</td>
    <td className="border-r p-0 group">
      <input type="number" value={item.studentRegular || ""} onChange={(e) => onEdit(item.id, "studentRegular", e.target.value)}
        className="w-full text-center text-sm py-3 bg-transparent outline-none focus:bg-blue-50 transition-all" />
    </td>
    <td className="border-r p-0 group">
      <input type="number" value={item.studentSpecial || ""} onChange={(e) => onEdit(item.id, "studentSpecial", e.target.value)}
        className="w-full text-center text-sm py-3 bg-transparent outline-none focus:bg-blue-50 transition-all" />
    </td>
    <td className="border-r p-3 text-center text-sm">
        <span className="font-bold text-slate-900">{item.credits}</span>
        <span className="text-slate-400 text-[10px] ml-1 block">({item.creditsStructure})</span>
    </td>
    <td className="border-r p-3 text-right text-sm">{item.feeRegular.toLocaleString()}</td>
    <td className="border-r p-3 text-right text-sm">{item.feeSpecial.toLocaleString()}</td>
    <td className="border-r p-3 text-right text-sm font-bold text-indigo-600 bg-indigo-50/20">{item.feeSum.toLocaleString()}</td>
    <td className="p-3 text-right text-sm font-bold text-blue-800 bg-blue-50/30">{item.grandTotal.toLocaleString()}</td>
  </tr>
));
TeachingFeeRow.displayName = "TeachingFeeRow";

export default function TeachingFeePage() {
  const [data, setData] = useState<TeachingFeeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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
      const result = await getTeachingFeeData(selectedYear, selectedSemester);
      setData(result as TeachingFeeItem[]);
      setPendingChanges({}); 
    } catch (error) { console.error(error); } 
    finally { setIsLoading(false); }
  };

  const handleEdit = (id: number, field: string, value: string) => {
    const numValue = value === "" ? 0 : Math.max(0, parseInt(value));
    setData(prev => prev.map(row => {
      if (row.id === id) {
        const updated = { ...row, [field]: numValue };
        const rate = 150;
        const credits = Number(updated.credits) || 0; // เพิ่มตัวคูณหน่วยกิต

        // แก้ไขสูตรการคำนวณ: (คน * 150 * หน่วยกิต)
        updated.feeRegular = updated.studentRegular * rate * credits; 
        updated.feeSpecial = updated.studentSpecial * rate * credits;
        updated.feeSum = updated.feeRegular + updated.feeSpecial;
        updated.grandTotal = updated.feeSum;
        return updated;
      }
      return row;
    }));
    const dbField = field === "studentRegular" ? "student_regular" : "student_special";
    setPendingChanges(prev => ({ ...prev, [id]: { ...(prev[id] || {}), [dbField]: numValue } }));
  };

  const handleSaveAll = async () => {
    if (!selectedYear) return;
    const itemsToUpdate = Object.entries(pendingChanges).map(([id, updates]) => ({ id: +id, updates }));
    if (itemsToUpdate.length === 0) return;
    setIsLoading(true);
    try {
      const res = await updateTeachingFee(itemsToUpdate);
      if (res.success) fetchData();
    } catch (e) { console.error(e); } 
    finally { setIsLoading(false); }
  };

  const handleAddNewItem = async (formData: any) => {
    setIsLoading(true);
    try {
      const res = await addTeachingFeeItem(formData);
      if (res.success) { setIsAddModalOpen(false); fetchData(); }
    } catch (e) { console.error(e); } 
    finally { setIsLoading(false); }
  };

  const totals = useMemo(() => data.reduce((acc, curr) => ({
    regular: acc.regular + curr.studentRegular,
    special: acc.special + curr.studentSpecial,
    feeReg: acc.feeReg + curr.feeRegular,
    feeSpe: acc.feeSpe + curr.feeSpecial,
    feeSum: acc.feeSum + curr.feeSum,
    grandTotal: acc.grandTotal + curr.grandTotal
  }), { regular: 0, special: 0, feeReg: 0, feeSpe: 0, feeSum: 0, grandTotal: 0 }), [data]);

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900"> 
      <Sidebar />
      <main className="flex-1 ml-64 p-8 pb-32">
        <div className="max-w-7xl mx-auto">
          
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 mb-8 relative z-40">
            <div className="bg-slate-900 px-10 py-10 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-visible">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-3">
                  <div className="bg-blue-600 p-2.5 rounded-2xl"><BookOpen size={24} className="text-white" /></div>
                  <h1 className="text-3xl font-black text-white">ค่าสอนบริการ</h1>
                </div>
                <p className="text-slate-400 text-sm ml-14 uppercase tracking-widest">General Education</p>
              </div>

              <div className="flex items-center gap-3 relative z-50 bg-white/5 p-2 rounded-2xl backdrop-blur-md border border-white/10">
                <YearDropdown onYearChange={(_, val) => setSelectedYear(val)} />
                <div className="h-8 w-[1px] bg-white/10 mx-1"></div>
                <div className="relative">
                  <select value={selectedSemester} onChange={(e) => setSelectedSemester(+e.target.value)}
                    className="appearance-none bg-white text-slate-900 px-5 py-2.5 pr-12 rounded-xl text-sm font-bold cursor-pointer outline-none shadow-sm min-w-[140px]">
                    <option value={1}>ภาคเรียนที่ 1</option>
                    <option value={2}>ภาคเรียนที่ 2</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>
                <div className="h-8 w-[1px] bg-white/10 mx-1"></div>
                <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg active:scale-95">
                  <Plus size={20} /> เพิ่มรายวิชา
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-3xl shadow-sm overflow-hidden min-h-[400px] z-10 relative">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-40 gap-4">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                <p className="text-slate-400 font-bold uppercase text-xs">Loading</p>
              </div>
            ) : !selectedYear ? (
              <div className="text-center py-40">
                <Calendar className="text-slate-200 mx-auto mb-6" size={64} />
                <h3 className="text-slate-800 font-bold text-xl">เลือกปีงบประมาณ</h3>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <TableHeader />
                  <tbody>
                    {data.map((item) => <TeachingFeeRow key={item.id} item={item} onEdit={handleEdit} />)}
                    <tr className="bg-slate-900 text-white font-bold">
                      <td colSpan={3} className="p-5 text-center">รวมทั้งสิ้น</td>
                      <td className="p-5 text-center border-r border-white/10">{totals.regular.toLocaleString()}</td>
                      <td className="p-5 text-center border-r border-white/10">{totals.special.toLocaleString()}</td>
                      <td className="p-5 text-center border-r border-white/10">-</td>
                      <td className="p-5 text-right border-r border-white/10">{totals.feeReg.toLocaleString()}</td>
                      <td className="p-5 text-right border-r border-white/10">{totals.feeSpe.toLocaleString()}</td>
                      <td className="p-5 text-right text-blue-400 border-r border-white/10">{totals.feeSum.toLocaleString()}</td>
                      <td className="p-5 text-right text-2xl bg-blue-600">{totals.grandTotal.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      <AddItemModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={handleAddNewItem} />

      {Object.keys(pendingChanges).length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 ml-32 w-full max-w-4xl z-50 animate-in slide-in-from-bottom-5">
          <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl px-10 py-5 flex items-center justify-between">
            <div className="flex items-center gap-6 text-white">
              <AlertCircle className="text-amber-400" size={28} />
              <div>
                <h4 className="font-bold">ยืนยันการเปลี่ยนแปลง?</h4>
                <p className="text-xs text-slate-400 uppercase tracking-widest">{Object.keys(pendingChanges).length} รายการรอการบันทึก</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={fetchData} className="px-6 py-3 text-sm font-bold text-slate-400 hover:text-white transition-colors">ยกเลิก</button>
              <button onClick={handleSaveAll} className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-3.5 rounded-2xl text-sm font-black flex items-center gap-2 shadow-xl shadow-blue-600/20 active:scale-95 transition-all">
                <Save size={20} /> บันทึกข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}