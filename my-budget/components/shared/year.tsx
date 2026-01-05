"use client";

import { useState, useEffect } from "react";
import { ChevronDown, PlusCircle, Loader2, Plus, CalendarPlus } from "lucide-react"; 
import { getBudgetYears } from "@/app/actions";

interface YearDropdownProps {
  onYearChange: (yearId: number | null, yearVal: number) => void;
  selectedYear?: number | null;
  allowCreate?: boolean;
  onCreateYear?: (year: number) => void;
}

export default function YearDropdown({ 
  onYearChange, 
  selectedYear, 
  allowCreate = false,
  onCreateYear
}: YearDropdownProps) {
  
  const [years, setYears] = useState<{ id: number | null; year: number }[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isCreatingMode, setIsCreatingMode] = useState(false); // สถานะสำหรับเปิดเมนูเลือกปีที่จะสร้าง
  
  const currentThaiYear = new Date().getFullYear() + 543; 

  // Load existing years
  useEffect(() => {
    async function loadYears() {
      try {
        const existing = await getBudgetYears(); 
        const formattedYears = existing.map(y => ({ id: y.id, year: y.year }));
        
        if (formattedYears.length === 0) {
            setYears([{ id: null, year: currentThaiYear }]);
        } else {
            setYears(formattedYears);
        }
      } catch (error) {
        console.error("Failed to load years:", error);
        setYears([{ id: null, year: currentThaiYear }]); 
      }
    }
    loadYears();
  }, [selectedYear]); // Reload เมื่อมีการเปลี่ยนปี (เผื่อปีใหม่เพิ่งถูกสร้าง)

  const handleSelect = (id: number | null, y: number) => {
    onYearChange(id, y);
    setIsOpen(false);
    setIsCreatingMode(false); // Reset mode
  };

  // ✅ ฟังก์ชันเลือกสร้างปีที่ระบุ
  const handleCreateSpecificYear = (targetYear: number) => {
    if (onCreateYear) {
      console.log("🟢 [YearDropdown] Creating year:", targetYear);
      onCreateYear(targetYear);
      setIsOpen(false);
      setIsCreatingMode(false);
    }
  };

  // คำนวณปีที่จะให้เลือกสร้าง (เช่น 3 ปีถัดไปจากปีล่าสุด)
  const maxYear = years.length > 0 ? Math.max(...years.map(y => y.year)) : currentThaiYear;
  const futureYears = [1, 2, 3].map(offset => maxYear + offset);

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
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl overflow-hidden border border-gray-100 max-h-96 overflow-y-auto z-50 animate-in fade-in zoom-in-95 duration-100">
          
          {/* Section 1: ปีที่มีอยู่แล้ว */}
          <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-50 bg-gray-50/50 sticky top-0">
            ปีงบประมาณที่มีข้อมูล
          </div>
          
          {years.map((y) => (
            <button
              key={y.year}
              onClick={() => handleSelect(y.id, y.year)}
              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 transition-colors flex justify-between items-center group border-b border-gray-50 last:border-0 ${y.year === selectedYear ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700'}`}
            >
              <span className="font-mono">{y.year}</span>
              {y.year === selectedYear && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
            </button>
          ))}

          {/* Section 2: สร้างปีใหม่ (แสดงเฉพาะ allowCreate=true) */}
          {allowCreate && onCreateYear && (
            <>
                <div className="px-3 py-2 text-xs font-semibold text-blue-400 uppercase tracking-wider border-t border-b border-gray-50 bg-blue-50/30">
                    สร้างปีงบประมาณใหม่
                </div>
                
                {futureYears.map(futureYear => (
                    <button
                        key={futureYear}
                        onClick={() => handleCreateSpecificYear(futureYear)}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-2 group"
                    >
                        <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                            <Plus className="w-3 h-3" />
                        </div>
                        <span>สร้างปี <span className="font-mono font-medium">{futureYear}</span></span>
                    </button>
                ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}