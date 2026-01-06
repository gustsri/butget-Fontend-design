"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Calendar, Plus, Check } from "lucide-react";
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
  
  // เก็บรายการปีที่มีอยู่จริงใน Database
  const [existingYears, setExistingYears] = useState<number[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const currentThaiYear = new Date().getFullYear() + 543; 

  // 1. โหลดข้อมูลเมื่อ (1) ปีเปลี่ยน หรือ (2) เปิดเมนู
  // เราใช้ isOpen เพื่อให้แน่ใจว่าโหลดข้อมูลล่าสุดเสมอตอนจะเลือก
  useEffect(() => {
    async function loadYears() {
      // ถ้าไม่ได้เปิดเมนู และมีข้อมูลอยู่แล้ว ไม่ต้องโหลดซ้ำ (ประหยัด Resource)
      // แต่ถ้า selectedYear เปลี่ยน เราควรเช็คใหม่เผื่อปีนั้นเพิ่งถูกสร้าง
      if (!isOpen && existingYears.includes(selectedYear || 0)) return;

      try {
        setIsLoading(true);
        const data = await getBudgetYears(); 
        const yearsFromDB = data.map(y => y.year);
        
        // 🔥 FIX: ถ้าปีที่เลือก (selectedYear) ไม่อยู่ใน DB (เช่น เพิ่งสร้างเสร็จหมาดๆ)
        // ให้ยัดมันเข้าไปใน existingYears ชั่วคราว เพื่อให้ UI ไม่มองว่าเป็น "สร้างใหม่"
        if (selectedYear && !yearsFromDB.includes(selectedYear)) {
            yearsFromDB.push(selectedYear);
        }
        
        // เรียงลำดับจากมากไปน้อย
        setExistingYears(yearsFromDB.sort((a, b) => b - a));
      } catch (error) {
        console.error("Failed to load years:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadYears();
  }, [selectedYear, isOpen]); 

  // 2. สร้างตัวเลือกทั้งหมด (Existing + Future + Past)
  const allOptions = (() => {
    // หาขอบเขตปีที่มีอยู่จริง
    const maxYear = existingYears.length > 0 ? Math.max(...existingYears) : currentThaiYear;
    const minYear = existingYears.length > 0 ? Math.min(...existingYears) : currentThaiYear;

    const options = new Set<number>(existingYears);

    // เพิ่มปีปัจจุบันเสมอ
    options.add(currentThaiYear);

    // ถ้าอนุญาตให้สร้าง เพิ่มตัวเลือก +/- 2 ปี
    if (allowCreate) {
        options.add(maxYear + 1);
        options.add(maxYear + 2);
        options.add(minYear - 1);
        options.add(minYear - 2);
    }

    // แปลงเป็น Array และเรียงจากมากไปน้อย
    return Array.from(options).sort((a, b) => b - a);
  })();

  const handleSelect = (year: number) => {
    setIsOpen(false);

    // เช็คว่าปีนี้มีอยู่จริงไหม?
    const exists = existingYears.includes(year);

    if (exists) {
        onYearChange(null, year);
    } else {
        if (onCreateYear) {
            // Optimistic Update: เพิ่มปีนี้เข้า existingYears ทันทีเพื่อให้ UI เปลี่ยนสถานะ
            setExistingYears(prev => [year, ...prev].sort((a, b) => b - a));
            onCreateYear(year);
        }
    }
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
        <div className="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-xl overflow-hidden border border-gray-100 max-h-[400px] overflow-y-auto z-50 animate-in fade-in zoom-in-95 duration-100">
          
          <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-50 bg-gray-50/50 sticky top-0 flex justify-between items-center">
            <span>เลือกปีงบประมาณ</span>
            {isLoading && <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>}
          </div>
          
          {allOptions.map((year) => {
            const isExisting = existingYears.includes(year);
            const isSelected = year === selectedYear;

            return (
              <button
                key={year}
                onClick={() => handleSelect(year)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex justify-between items-center border-b border-gray-50 last:border-0 
                  ${isSelected ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}
                `}
              >
                <div className="flex items-center gap-2.5">
                    {/* ไอคอนสถานะ */}
                    {isExisting ? (
                        <Calendar className={`w-4 h-4 ${isSelected ? 'text-blue-500' : 'text-gray-300'}`} />
                    ) : (
                        <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
                            <Plus className="w-3 h-3 text-emerald-600" />
                        </div>
                    )}
                    
                    <span className="font-mono">{year}</span>
                    
                    {/* ป้ายกำกับ */}
                    {!isExisting && (
                        <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded border border-emerald-100 font-medium">
                            สร้างใหม่
                        </span>
                    )}
                </div>
                
                {isSelected && <Check className="w-4 h-4 text-blue-500" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}