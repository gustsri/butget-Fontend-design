"use client";
import React, { useState, useEffect, memo } from "react";
import Sidebar from "@/components/shared/Sidebar";
import YearDropdown from "@/components/shared/year"; 
import { ChevronDown, Loader2, Save, AlertCircle, FileText, ClipboardList, Clock, Calendar } from "lucide-react";
import { getEnrollmentData, bulkUpdateEnrollment } from "./actions";

// ==========================================
// 1. Type Definitions
// ==========================================
type StudentData = {
  id: number;
  name: string;
  degree: string;
  is_active: boolean; 
  planType: "plan" | "actual";
  year1: number;
  year2: number;
  year3: number;
  year4: number;
  year5: number;
  year6: number;
  total: number;
  enrollment_id: number | null;
};

// ==========================================
// 2. Sub-Components
// ==========================================

const TableHeader = () => (
    <div className="grid grid-cols-12 gap-2 bg-blue-50/80 p-3 rounded-t-lg border-b border-blue-100 text-xs font-bold text-blue-800 uppercase tracking-wider text-center items-center">
        <div className="col-span-4 text-left pl-4">ประเภทข้อมูล</div>
        <div className="col-span-1">ปี 1</div>
        <div className="col-span-1">ปี 2</div>
        <div className="col-span-1">ปี 3</div>
        <div className="col-span-1">ปี 4</div>
        <div className="col-span-1">ปี 5</div>
        <div className="col-span-1">ปี 6</div>
        <div className="col-span-2 bg-blue-100/50 rounded py-1 text-blue-900">รวมทั้งหมด</div>
    </div>
);

const InputCell = memo(({ field, val, isEditable, isInactive, onChange }: { 
    field: string, 
    val: number, 
    isEditable: boolean, 
    isInactive: boolean,
    onChange: (val: string) => void 
}) => {
    const isLocked = isInactive && field === 'year1';
    
    return (
        <div className={`relative ${isLocked ? 'cursor-not-allowed opacity-50' : ''}`}>
            <input 
                type="number" 
                min="0"
                disabled={!isEditable || isLocked}
                value={val.toString()}
                onChange={(e) => onChange(e.target.value)}
                onFocus={(e) => e.target.select()}
                className={`w-full text-center text-sm py-1.5 rounded border transition-colors outline-none
                    ${isEditable 
                        ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white' 
                        : 'border-transparent bg-transparent text-gray-600'
                    }
                    ${isLocked ? 'bg-gray-100 text-gray-400' : ''}
                `}
            />
            {isLocked && (
                <div className="absolute inset-0 z-10" title="ปิดรับนักศึกษาใหม่"></div>
            )}
        </div>
    )
});
InputCell.displayName = "InputCell";

const EnrollmentRow = memo(({ item, isEditable, onEdit }: { 
    item: StudentData, 
    isEditable: boolean,
    onEdit: (id: number, field: string, value: string, planType: "plan" | "actual") => void
}) => {
    const isPlan = item.planType === 'plan';
    const handleChange = (field: string, val: string) => {
        onEdit(item.id, field, val, item.planType);
    };

    return (
        <div className={`grid grid-cols-12 gap-2 p-3 items-center border-b border-gray-50 hover:bg-gray-50/50 transition duration-150 ${isEditable ? 'bg-white' : 'bg-gray-50/30'}`}>
            <div className="col-span-4 flex items-center gap-2 pl-4">
                <div className={`p-1.5 rounded-md ${isPlan ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                    {isPlan ? <FileText className="w-4 h-4" /> : <ClipboardList className="w-4 h-4" />}
                </div>
                <span className={`text-sm font-medium ${isPlan ? 'text-blue-900' : 'text-orange-900'}`}>
                    {isPlan ? 'แผน (Plan)' : 'จริง (Actual)'}
                </span>
            </div>

            <div className="col-span-1"><InputCell field="year1" val={item.year1} isEditable={isEditable} isInactive={!item.is_active} onChange={(v) => handleChange("year1", v)} /></div>
            <div className="col-span-1"><InputCell field="year2" val={item.year2} isEditable={isEditable} isInactive={!item.is_active} onChange={(v) => handleChange("year2", v)} /></div>
            <div className="col-span-1"><InputCell field="year3" val={item.year3} isEditable={isEditable} isInactive={!item.is_active} onChange={(v) => handleChange("year3", v)} /></div>
            <div className="col-span-1"><InputCell field="year4" val={item.year4} isEditable={isEditable} isInactive={!item.is_active} onChange={(v) => handleChange("year4", v)} /></div>
            <div className="col-span-1"><InputCell field="year5" val={item.year5} isEditable={isEditable} isInactive={!item.is_active} onChange={(v) => handleChange("year5", v)} /></div>
            <div className="col-span-1"><InputCell field="year6" val={item.year6} isEditable={isEditable} isInactive={!item.is_active} onChange={(v) => handleChange("year6", v)} /></div>

            <div className="col-span-2 text-right pr-4">
                <span className={`font-bold text-sm px-3 py-1 rounded-full ${isPlan ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700'}`}>
                    {item.total.toLocaleString()}
                </span>
            </div>
        </div>
    );
});
EnrollmentRow.displayName = "EnrollmentRow";


// ==========================================
// 3. Main Page Component
// ==========================================
export default function EnrollmentPage() {
  const [data, setData] = useState<StudentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  
  // ✅ เพิ่ม State สำหรับ Semester (1 หรือ 2)
  const [selectedSemester, setSelectedSemester] = useState<number>(1);

  const [editableCategory, setEditableCategory] = useState<"plan" | "actual">("plan");
  const [pendingChanges, setPendingChanges] = useState<Record<string, Record<string, number>>>({});

  // Fetch Data เมื่อ Year หรือ Semester เปลี่ยน
  useEffect(() => {
    if (selectedYear) {
      fetchData();
    }
  }, [selectedYear, selectedSemester]);

  const fetchData = async () => {
    if (!selectedYear) return;
    setIsLoading(true);
    try {
      // ✅ ส่ง selectedSemester ไปด้วย
      const result = await getEnrollmentData(selectedYear, selectedSemester);
      setData(result as any);
      setPendingChanges({}); 
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const groupedData = data.reduce((acc, item) => {
    if (!acc[item.degree]) acc[item.degree] = {};
    if (!acc[item.degree][item.name]) acc[item.degree][item.name] = [];
    acc[item.degree][item.name].push(item);
    return acc;
  }, {} as Record<string, Record<string, typeof data>>);

  const [openDegrees, setOpenDegrees] = useState<Record<string, boolean>>({});
  const [openDepts, setOpenDepts] = useState<Record<string, boolean>>({});
  
  const toggleDegree = (degree: string) => setOpenDegrees(prev => ({ ...prev, [degree]: !(prev[degree] ?? true) }));
  const toggleDept = (dept: string) => setOpenDepts(prev => ({ ...prev, [dept]: !(prev[dept] ?? true) }));

  const handleEdit = (id: number, field: string, value: string, planType: "plan" | "actual") => {
    const numValue = value === "" ? 0 : parseInt(value);
    
    const targetRow = data.find(d => d.id === id && d.planType === planType);
    if (targetRow && !targetRow.is_active && field === "year1") {
        return; 
    }

    setData((prev) =>
      prev.map((row) => {
        if (row.id === id && row.planType === planType) {
          const updatedRow = { ...row, [field]: numValue };
          updatedRow.total =
            (updatedRow.year1 || 0) +
            (updatedRow.year2 || 0) +
            (updatedRow.year3 || 0) +
            (updatedRow.year4 || 0) +
            (updatedRow.year5 || 0) +
            (updatedRow.year6 || 0);
          return updatedRow;
        }
        return row;
      })
    );

    const key = `${id}-${planType}`;
    const dbFieldMap: Record<string, string> = {
      year1: "year1_count", year2: "year2_count", year3: "year3_count",
      year4: "year4_count", year5: "year5_count", year6: "year6_count",
    };
    const dbField = dbFieldMap[field];

    setPendingChanges((prev) => {
      const currentProgramChanges = prev[key] || {};
      return {
        ...prev,
        [key]: { ...currentProgramChanges, [dbField]: numValue }
      };
    });
  };

  const handleSaveAll = async () => {
    if (!selectedYear) return;
    const itemsToUpdate = Object.entries(pendingChanges).map(([key, updates]) => {
      const [programIdStr, planType] = key.split("-");
      return {
        programId: Number(programIdStr),
        planType: planType as "plan" | "actual",
        updates: updates,
      };
    });

    if (itemsToUpdate.length === 0) return;
    setIsLoading(true); 
    // ✅ ส่ง selectedSemester ไปตอนบันทึก
    const result = await bulkUpdateEnrollment(itemsToUpdate, selectedYear, selectedSemester);

    if (result.success) {
      alert("บันทึกข้อมูลเรียบร้อย ✅");
      setPendingChanges({}); 
      setIsLoading(false);
    } else {
      alert("เกิดข้อผิดพลาดในการบันทึก ❌");
      setIsLoading(false);
    }
  };

  const changeCount = Object.keys(pendingChanges).length;

  return (
    <div className="flex min-h-screen bg-gray-50 pb-24"> 
      <Sidebar />
      <main className="flex-1 ml-64 p-6">
        <div className="max-w-6xl mx-auto">
          
          <div className="bg-white rounded-xl shadow-sm border border-blue-100 mb-6 relative z-20">
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 px-8 py-6 flex justify-between items-center text-white rounded-t-xl">
              <div>
                 <h1 className="text-2xl font-bold">ระบบสนับสนุนการจัดทำงบประมาณ</h1>
                 <p className="text-blue-200 text-sm mt-1">บันทึกข้อมูลจำนวนนักศึกษาแยกตามหลักสูตร</p>
              </div>
              
              <div className="flex items-center gap-4">
                  {/* ✅ ตัวเลือก Semester */}
                  <div className="bg-blue-800/50 p-1 rounded-lg flex items-center border border-blue-700/50">
                      <button 
                        onClick={() => setSelectedSemester(1)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${selectedSemester === 1 ? 'bg-white text-blue-900 shadow-sm' : 'text-blue-200 hover:text-white hover:bg-white/10'}`}
                      >
                         <span>ภาคเรียนที่ 1</span>
                      </button>
                      <button 
                        onClick={() => setSelectedSemester(2)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${selectedSemester === 2 ? 'bg-white text-blue-900 shadow-sm' : 'text-blue-200 hover:text-white hover:bg-white/10'}`}
                      >
                         <span>ภาคเรียนที่ 2</span>
                      </button>
                  </div>

                  <YearDropdown onYearChange={(id) => setSelectedYear(id)} />
              </div>
            </div>

            <div className="bg-white px-6 py-4 border-b border-gray-100 flex justify-between items-center rounded-b-xl">
               <div className="flex items-center gap-2">
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-700" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-700">ปีงบประมาณ {selectedYear ? 'ที่เลือก' : '...'} / เทอม {selectedSemester}</h2>
                    <p className="text-xs text-gray-500">กรุณาเลือกประเภทข้อมูลที่ต้องการแก้ไข</p>
                  </div>
               </div>

               <div className="flex bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setEditableCategory("plan")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${editableCategory === "plan" ? "bg-white text-blue-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                  แผน (Plan)
                </button>
                <button
                  onClick={() => setEditableCategory("actual")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${editableCategory === "actual" ? "bg-white text-orange-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                  จริง (Actual)
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10">
            {isLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-blue-600 animate-spin" /></div>
            ) : !selectedYear ? (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                  <p className="text-gray-400">กรุณาเลือกปีงบประมาณจากมุมขวาบนเพื่อเริ่มทำงาน</p>
              </div>
            ) : (
              Object.keys(groupedData).map((degree) => (
                <div key={degree} className="mb-8 animate-fade-in">
                  <div className="flex items-center gap-2 mb-3 cursor-pointer select-none group" onClick={() => toggleDegree(degree)}>
                    <div className="bg-white p-1.5 rounded-md shadow-sm border border-gray-200 group-hover:border-blue-300 transition-colors">
                        <ChevronDown className={`w-4 h-4 text-gray-600 transform transition-transform ${openDegrees[degree] ?? true ? "rotate-180" : ""}`} />
                    </div>
                    <h2 className="text-lg font-bold text-gray-800 tracking-tight">{degree}</h2>
                    <div className="h-px bg-gray-200 flex-1 ml-4"></div>
                  </div>

                  {(openDegrees[degree] ?? true) &&
                    Object.keys(groupedData[degree]).map((dept) => {
                      const isActive = groupedData[degree][dept][0].is_active; 
                      
                      return (
                        <div key={dept} className="bg-white rounded-xl shadow-sm border border-gray-200 mb-4 overflow-hidden">
                            <div 
                                className={`px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors ${!isActive ? 'bg-orange-50/30' : ''}`} 
                                onClick={() => toggleDept(dept)}
                            >
                                <div className="flex items-center gap-3">
                                    {!isActive ? <Clock className="w-5 h-5 text-orange-500" /> : <div className="w-2 h-2 rounded-full bg-green-500"></div>}
                                    <h3 className={`font-semibold ${!isActive ? 'text-gray-600' : 'text-gray-800'}`}>{dept}</h3>
                                    {!isActive && (
                                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium border border-orange-200">
                                            Phasing Out
                                        </span>
                                    )}
                                </div>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transform transition-transform ${openDepts[dept] ?? true ? "rotate-180" : ""}`} />
                            </div>

                            {(openDepts[dept] ?? true) && (
                              <div className="px-6 pb-6 pt-2">
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <TableHeader />
                                    {groupedData[degree][dept].map((item) => (
                                       <EnrollmentRow 
                                            key={`${item.id}-${item.planType}`} 
                                            item={item} 
                                            isEditable={item.planType === editableCategory}
                                            onEdit={handleEdit} 
                                       />
                                    ))}
                                </div>
                              </div>
                            )}
                        </div>
                      );
                    })}
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] py-4 z-40 pl-64 transition-all">
          <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
             <div className="flex items-center gap-3">
                {changeCount > 0 ? (
                    <>
                        <div className="bg-yellow-100 p-2 rounded-full animate-pulse">
                            <AlertCircle className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-800 text-sm">มีการแก้ไขข้อมูลรอการบันทึก</p>
                            <p className="text-xs text-gray-500">{changeCount} รายการที่แก้ไข</p>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="bg-green-100 p-2 rounded-full">
                            <Save className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-800 text-sm">ข้อมูลเป็นปัจจุบัน</p>
                            <p className="text-xs text-gray-500">พร้อมสำหรับการแก้ไข</p>
                        </div>
                    </>
                )}
             </div>

             <div className="flex items-center gap-3">
                {changeCount > 0 && (
                    <button 
                        onClick={() => { setPendingChanges({}); fetchData(); }}
                        className="text-gray-500 hover:text-gray-700 text-sm font-medium px-4 py-2"
                    >
                        ยกเลิกการแก้ไข
                    </button>
                )}
                <button
                    onClick={handleSaveAll}
                    disabled={changeCount === 0}
                    className={`
                        flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg transition-all
                        ${changeCount > 0 
                            ? 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 active:scale-95 shadow-blue-200' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                        }
                    `}
                >
                    <Save className="w-4 h-4" />
                    บันทึกการเปลี่ยนแปลง
                </button>
             </div>
          </div>
      </div>
    </div>
  );
}