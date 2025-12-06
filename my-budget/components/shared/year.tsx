"use client";

import { useState, useEffect } from "react";
import { ChevronDown, PlusCircle, History } from "lucide-react";
import { getBudgetYears } from "@/app/actions";

interface YearDropdownProps {
  onYearChange: (yearId: number | null, yearVal: number) => void;
  selectedYear?: number | null;
}

export default function YearDropdown({ onYearChange }: YearDropdownProps) {
  const [years, setYears] = useState<{ id: number | null; year: number }[]>([]);
  const [selectedLabel, setSelectedLabel] = useState("เลือกปีงบประมาณ");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    async function loadYears() {
      const existing = await getBudgetYears(); 
      const currentYear = new Date().getFullYear() + 543; 
      
      const allYearsMap = new Map<number, number | null>();

      // 1. ใส่ปีที่มีอยู่จริงใน DB
      existing.forEach(y => allYearsMap.set(y.year, y.id));

      // 2. เพิ่มปีอนาคต (+3 ปี)
      for (let i = 1; i <= 3; i++) {
        const y = currentYear + i;
        if (!allYearsMap.has(y)) allYearsMap.set(y, null);
      }

      // 3. ✅ เพิ่มปีย้อนหลัง (-5 ปี) เผื่อทำย้อนหลัง
      for (let i = 0; i <= 5; i++) {
        const y = currentYear - i;
        if (!allYearsMap.has(y)) allYearsMap.set(y, null);
      }

      // แปลงกลับเป็น Array และเรียงลำดับ (ใหม่ -> เก่า)
      const sortedYears = Array.from(allYearsMap.entries())
        .sort((a, b) => b[0] - a[0])
        .map(([year, id]) => ({ id, year }));

      setYears(sortedYears);
      
      // Default เลือกปีปัจจุบัน หรือปีล่าสุดที่มี
      if (existing.length > 0) {
        // พยายามหาปีปัจจุบันก่อน
        const current = existing.find(e => e.year === currentYear);
        if (current) {
           handleSelect(current.id, current.year);
        } else {
           handleSelect(existing[0].id, existing[0].year);
        }
      } else {
         handleSelect(null, currentYear);
      }
    }
    loadYears();
  }, []);

  const handleSelect = (id: number | null, year: number) => {
    setSelectedLabel(id ? `ปีงบประมาณ ${year}` : `ปีงบประมาณ ${year} (ยังไม่สร้าง)`);
    onYearChange(id, year);
    setIsOpen(false);
  };

  return (
    <div className="relative z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors border border-white/20 backdrop-blur-sm"
      >
        <span className="text-sm font-medium">{selectedLabel}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl overflow-hidden border border-gray-100 max-h-80 overflow-y-auto">
          {years.map((y) => (
            <button
              key={y.year}
              onClick={() => handleSelect(y.id, y.year)}
              className="w-full text-left px-4 py-3 hover:bg-blue-50 text-sm flex justify-between items-center group border-b border-gray-50 last:border-0"
            >
              <span className={y.id ? "text-gray-700 font-medium" : "text-gray-400"}>
                {y.year}
              </span>
              
              {!y.id && (
                <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 
                  ${y.year > (new Date().getFullYear() + 543) 
                    ? 'bg-blue-100 text-blue-600 group-hover:bg-blue-200' 
                    : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'}`}
                >
                  {y.year > (new Date().getFullYear() + 543) 
                    ? <><PlusCircle className="w-3 h-3" /> สร้างใหม่</> 
                    : <><History className="w-3 h-3" /> สร้างย้อนหลัง</>}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}