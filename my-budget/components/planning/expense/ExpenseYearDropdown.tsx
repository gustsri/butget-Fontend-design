"use client";

import { useState, useEffect } from "react";
import { ChevronDown, CalendarCheck, Plus, History, Sparkles, Loader2 } from "lucide-react";
import { getOnlyExpenseYears } from "@/app/actions"; // 👈 เรียก Action ตัวใหม่ที่เราแยกไว้

interface Props {
  selectedYear: number;
  onChange: (year: number) => void;
  onCreate: (year: number) => void;
}

export default function ExpenseYearDropdown({ selectedYear, onChange, onCreate }: Props) {
  
  const [existingYears, setExistingYears] = useState<number[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const currentThaiYear = new Date().getFullYear() + 543; 

  // ✅ 1. โหลดข้อมูลเมื่อ Mount หรือเมื่อ selectedYear เปลี่ยน
  useEffect(() => {
    async function loadYears() {
      try {
        setIsLoading(true);
        // เรียก Action ตัวใหม่ที่ดึงเฉพาะปีรายจ่าย (noStore)
        const data = await getOnlyExpenseYears(); 
        let loadedYears = data.map(y => y.year);

        // 🔥 Logic สำคัญ: ถ้าปีที่เลือก (selectedYear) ไม่อยู่ใน list ที่โหลดมา (เช่น เพิ่งสร้างเสร็จ)
        // ให้ "ยัด" เข้าไปในหมวด Existing ทันที เพื่อให้ UI ย้ายหมวดอัตโนมัติ
        if (selectedYear && !loadedYears.includes(selectedYear)) {
            loadedYears = [selectedYear, ...loadedYears];
        }

        // เรียงปีจากมากไปน้อย
        loadedYears.sort((a, b) => b - a);
        setExistingYears(loadedYears);

      } catch (error) {
        console.error("Failed to load years:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadYears();
  }, [selectedYear, isOpen]); // โหลดใหม่เมื่อเปิดเมนู หรือปีเปลี่ยน

  // --- Logic คำนวณช่วงปี (Ranges) ---
  const hasData = existingYears.length > 0;

  // หาขอบเขตปีที่มีอยู่จริง
  const maxYear = hasData ? Math.max(...existingYears) : currentThaiYear;
  const minYear = hasData ? Math.min(...existingYears) : currentThaiYear;
  
  // เช็คว่าปีปัจจุบันหายไปไหม? (สำหรับเคสเริ่มระบบใหม่)
  const isCurrentMissing = !existingYears.includes(currentThaiYear);

  // สร้าง List ปีอนาคต (Max+1, Max+2)
  const futureCreateOptions = [maxYear + 1, maxYear + 2];

  // สร้าง List ปีย้อนหลัง (Min-1, Min-2)
  const pastCreateOptions = [minYear - 1, minYear - 2];

  // Handlers
  const handleSelect = (year: number) => {
    setIsOpen(false);
    onChange(year);
  };

  const handleCreate = (targetYear: number) => {
    setIsOpen(false);
    onCreate(targetYear);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-md transition-colors text-white text-sm font-medium border border-white/10"
      >
        <span className="font-mono">{selectedYear || "เลือกปี"}</span>
        <ChevronDown className={`w-4 h-4 opacity-70 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl overflow-hidden border border-gray-100 max-h-[80vh] overflow-y-auto z-50 animate-in fade-in zoom-in-95 duration-100 text-slate-800">
          
          {/* =========================================================
              SECTION 1: ปีที่มีข้อมูลอยู่แล้ว (Existing)
             ========================================================= */}
          <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-50 bg-gray-50/50 sticky top-0 z-10 flex justify-between">
            <span>ปีงบประมาณที่มีข้อมูล</span>
            {isLoading && <Loader2 className="w-3 h-3 animate-spin text-blue-500" />}
          </div>
          
          {existingYears.length > 0 ? (
            existingYears.map((year) => (
              <button
                key={year}
                onClick={() => handleSelect(year)}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 transition-colors flex justify-between items-center border-b border-gray-50 last:border-0 ${year === selectedYear ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700'}`}
              >
                <div className="flex items-center gap-2">
                    <CalendarCheck className={`w-4 h-4 ${year === selectedYear ? 'text-blue-500' : 'text-gray-300'}`} />
                    <span className="font-mono">{year}</span>
                </div>
                {year === selectedYear && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
              </button>
            ))
          ) : (
            <div className="px-4 py-6 text-sm text-gray-400 italic text-center bg-slate-50">
                ยังไม่มีข้อมูลปีงบประมาณ
            </div>
          )}

          {/* =========================================================
              SECTION 2: พื้นที่สร้างปีใหม่ (Create Actions)
             ========================================================= */}
          {/* ปุ่มพิเศษ: เริ่มต้นปีปัจจุบัน (ถ้ายังไม่มี) */}
          {isCurrentMissing && (
            <div className="p-2 bg-indigo-50/50 border-t border-b border-indigo-100">
                <button
                    onClick={() => handleCreate(currentThaiYear)}
                    className="w-full text-left px-3 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded shadow-sm transition-all flex items-center justify-center gap-2 font-medium"
                >
                    <Sparkles className="w-4 h-4" />
                    <span>เริ่มต้นปีงบประมาณ {currentThaiYear}</span>
                </button>
            </div>
          )}

          {/* สร้างปีอนาคต */}
          <div className="px-3 py-2 text-xs font-semibold text-emerald-600 uppercase tracking-wider border-t border-b border-gray-50 bg-emerald-50/30">
            สร้างปีถัดไป (อนาคต)
          </div>
          {futureCreateOptions.map(year => (
            <button
                key={year}
                onClick={() => handleCreate(year)}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors flex items-center gap-2 group border-b border-dashed border-gray-100 last:border-0"
            >
                <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-emerald-200 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 transition-colors">
                        <Plus className="w-3 h-3" />
                </div>
                <span>สร้างปี <span className="font-mono font-bold">{year}</span></span>
            </button>
          ))}

          {/* สร้างปีย้อนหลัง */}
          <div className="px-3 py-2 text-xs font-semibold text-orange-500 uppercase tracking-wider border-t border-b border-gray-50 bg-orange-50/30">
            เก็บตกปีย้อนหลัง
          </div>
          {pastCreateOptions.map(year => (
            <button
                key={year}
                onClick={() => handleCreate(year)}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:text-orange-700 hover:bg-orange-50 transition-colors flex items-center gap-2 group border-b border-dashed border-gray-100 last:border-0"
            >
                <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-orange-200 flex items-center justify-center text-slate-400 group-hover:text-orange-600 transition-colors">
                        <History className="w-3 h-3" />
                </div>
                <span>สร้างปี <span className="font-mono font-bold">{year}</span></span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}