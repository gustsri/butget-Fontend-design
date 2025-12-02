"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/shared/Sidebar";
import YearDropdown from "@/components/shared/year"; // ใช้ตัวใหม่ที่เราสร้าง
import TableRow from "@/components/plan/TableRow";
import { ChevronDown, Loader2, Save, AlertCircle, FileText, ClipboardList } from "lucide-react";
import { getEnrollmentData, bulkUpdateEnrollment } from "./actions";

// Type Data
type StudentData = {
  id: number;
  name: string;
  degree: string;
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

export default function EnrollmentPage() {
  const [data, setData] = useState<StudentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  // State สำหรับ Toggle
  const [editableCategory, setEditableCategory] = useState<"plan" | "actual">("plan");

  // State เก็บข้อมูลที่ถูกแก้ไข (เพื่อรอ Save)
  // Key format: "programId-planType" -> Value: { year1: 10, year2: 20 }
  const [pendingChanges, setPendingChanges] = useState<Record<string, Record<string, number>>>({});

  // Fetch Data เมื่อปีเปลี่ยน
  useEffect(() => {
    if (selectedYear) {
      fetchData();
    }
  }, [selectedYear]);

  const fetchData = async () => {
    if (!selectedYear) return;
    setIsLoading(true);
    try {
      const result = await getEnrollmentData(selectedYear);
      setData(result as any);
      setPendingChanges({}); // ล้างค่าที่ค้างอยู่เมื่อโหลดใหม่
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Grouping Logic
  const groupedData = data.reduce((acc, item) => {
    if (!acc[item.degree]) acc[item.degree] = {};
    if (!acc[item.degree][item.name]) acc[item.degree][item.name] = [];
    acc[item.degree][item.name].push(item);
    return acc;
  }, {} as Record<string, Record<string, typeof data>>);

  // Toggle UI Logic
  const [openDegrees, setOpenDegrees] = useState<Record<string, boolean>>({});
  const [openDepts, setOpenDepts] = useState<Record<string, boolean>>({});
  const toggleDegree = (degree: string) => setOpenDegrees(prev => ({ ...prev, [degree]: !(prev[degree] ?? true) }));
  const toggleDept = (dept: string) => setOpenDepts(prev => ({ ...prev, [dept]: !(prev[dept] ?? true) }));

  const handleEdit = (id: number, field: string, value: number, planType: "plan" | "actual") => {
    // 1. Optimistic Update: แก้ไขค่า และคำนวณผลรวมใหม่ทันที
    setData((prev) =>
      prev.map((row) => {
        // เช็คว่าเป็นแถวที่เรากำลังแก้หรือไม่
        if (row.id === id && row.planType === planType) {

          // สร้าง Object ใหม่ที่มีค่าที่แก้ไขแล้ว
          const updatedRow = { ...row, [field]: Number(value) };

          // 🔥 จุดที่เพิ่ม: คำนวณ Total ใหม่จากค่าใน updatedRow
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

    // 2. เก็บเข้า Pending Changes
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
        [key]: { ...currentProgramChanges, [dbField]: Number(value) }
      };
    });
  };

  // --- Logic ปุ่ม Save (บันทึกทีเดียว) ---
  const handleSaveAll = async () => {
    if (!selectedYear) return;

    // แปลง pendingChanges กลับเป็น Array เพื่อส่งให้ Server Action
    const itemsToUpdate = Object.entries(pendingChanges).map(([key, updates]) => {
      const [programIdStr, planType] = key.split("-");
      return {
        programId: Number(programIdStr),
        planType: planType as "plan" | "actual",
        updates: updates,
      };
    });

    if (itemsToUpdate.length === 0) return;

    setIsLoading(true); // show loading ชั่วคราว
    const result = await bulkUpdateEnrollment(itemsToUpdate, selectedYear);

    if (result.success) {
      alert("บันทึกข้อมูลเรียบร้อย ✅");
      setPendingChanges({}); // เคลียร์สถานะการแก้ไข
      // fetchData(); // โหลดข้อมูลใหม่เพื่อให้ชัวร์ (หรือจะไม่โหลดก็ได้ถ้ามั่นใจ local state)
      setIsLoading(false);
    } else {
      alert("เกิดข้อผิดพลาดในการบันทึก ❌");
      setIsLoading(false);
    }
  };

  // เช็คว่ามีการแก้ไขไหม
  const hasChanges = Object.keys(pendingChanges).length > 0;

  return (
    <div className="flex min-h-screen bg-gray-50 pb-20"> {/* pb-20 เผื่อที่ให้ปุ่ม Save ลอย */}
      <Sidebar />
      <main className="flex-1 ml-64 p-6">
        <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden min-h-[80vh]">

          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-blue-800 to-blue-900 px-8 py-6 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-white">ระบบสนับสนุนการจัดทำงบประมาณ</h1>
              {/* YearDropdown ที่แก้ใหม่แล้ว */}
              <YearDropdown onYearChange={(id) => setSelectedYear(id)} />
            </div>

            <div className="bg-gradient-to-r from-blue-800 to-blue-900 px-8 py-6 border-b-4 border-orange-400 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">บันทึกจำนวนนักศึกษา</h2>
                <h1 className="text-blue-200 text-l mt-1">
                  {selectedYear ? "ข้อมูลประจำปีงบประมาณที่เลือก" : "กรุณาเลือกปีงบประมาณ"}
                </h1>
              </div>

              {/* ปุ่ม Toggle Plan/Actual */}
              <div className="bg-blue-900/30 p-1 rounded-lg flex items-center gap-1 border border-blue-400/30">
                <button
                  onClick={() => setEditableCategory("plan")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${editableCategory === "plan" ? "bg-white text-blue-900 shadow-sm" : "text-blue-100 hover:bg-white/10"
                    }`}
                >
                  <FileText className="w-4 h-4" /> แผน (Plan)
                </button>
                <button
                  onClick={() => setEditableCategory("actual")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${editableCategory === "actual" ? "bg-white text-blue-900 shadow-sm" : "text-blue-100 hover:bg-white/10"
                    }`}
                >
                  <ClipboardList className="w-4 h-4" /> จริง (Actual)
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {isLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-blue-600 animate-spin" /></div>
            ) : !selectedYear ? (
              <div className="text-center py-20 text-gray-400">กรุณาเลือกปีงบประมาณจากมุมขวาบน</div>
            ) : (
              Object.keys(groupedData).map((degree) => (
                <div key={degree} className="mb-8">
                  <div className="flex items-center gap-2 mb-4 cursor-pointer select-none" onClick={() => toggleDegree(degree)}>
                    <div className="bg-blue-100 p-1 rounded-md"><ChevronDown className={`w-5 h-5 text-blue-800 transform transition-transform ${openDegrees[degree] ?? true ? "rotate-180" : ""}`} /></div>
                    <h2 className="text-lg font-bold text-gray-800 uppercase">{degree}</h2>
                  </div>

                  {(openDegrees[degree] ?? true) &&
                    Object.keys(groupedData[degree]).map((dept) => (
                      <div key={dept} className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
                        <div className="flex items-center gap-2 mb-4 cursor-pointer select-none" onClick={() => toggleDept(dept)}>
                          <h3 className="text-base font-semibold text-gray-700">{dept}</h3>
                          <ChevronDown className={`w-4 h-4 text-gray-500 transform transition-transform ${openDepts[dept] ?? true ? "rotate-180" : ""}`} />
                        </div>

                        {(openDepts[dept] ?? true) && (
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <TableRow category="ประเภทข้อมูล" type="head" />
                            {groupedData[degree][dept].map((item) => (
                              <TableRow
                                key={`${item.id}-${item.planType}`}
                                category={
                                  <div className="flex items-center gap-2">
                                    {item.planType === 'plan'
                                      ? <><FileText className="w-4 h-4 text-blue-500" /> แผน (Plan)</>
                                      : <><ClipboardList className="w-4 h-4 text-orange-500" /> จริง (Actual)</>
                                    }
                                  </div>
                                }
                                year1={item.year1} year2={item.year2} year3={item.year3}
                                year4={item.year4} year5={item.year5} year6={item.year6}
                                total={item.total}
                                highlight={item.planType} // สำหรับสีพื้นหลัง

                                // ✅ Logic ควบคุมการแก้ไข: แก้ได้เฉพาะที่ตรงกับ Toggle ที่เลือก
                                editable={item.planType === editableCategory}

                                onEdit={(field: any, value: any) => handleEdit(item.id, field, value, item.planType)}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* 🔥 Floating Save Bar (แสดงเมื่อมีการแก้ไข) */}
      {hasChanges && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-6 z-50 border border-gray-700 animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500/20 p-2 rounded-full">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="font-bold text-sm">มีการแก้ไขข้อมูลที่ยังไม่บันทึก</p>
              <p className="text-xs text-gray-400">จำนวน {Object.keys(pendingChanges).length} รายการ</p>
            </div>
          </div>
          <div className="h-8 w-px bg-gray-700"></div>
          <div className="flex gap-2">
            <button
              onClick={() => { setPendingChanges({}); fetchData(); }} // ยกเลิก = โหลดข้อมูลเดิมทับ
              className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 text-gray-300 transition"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSaveAll}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg shadow-blue-900/50 flex items-center gap-2 transition transform hover:scale-105 active:scale-95"
            >
              <Save className="w-4 h-4" /> บันทึกการเปลี่ยนแปลง
            </button>
          </div>
        </div>
      )}
    </div>
  );
}