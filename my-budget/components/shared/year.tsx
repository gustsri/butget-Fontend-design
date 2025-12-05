"use client";
import { useState, useEffect } from "react";
import { ChevronDown, PlusCircle } from "lucide-react";
import { getBudgetYears } from "@/app/actions";

interface YearDropdownProps {
  onYearChange: (yearId: number | null, yearVal: number) => void; // ส่งทั้ง ID และ Year Value
  selectedYear?: number | null;
}

export default function YearDropdown({ onYearChange }: YearDropdownProps) {
  const [years, setYears] = useState<{ id: number | null; year: number }[]>([]);
  const [selectedLabel, setSelectedLabel] = useState("เลือกปีงบประมาณ");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    async function loadYears() {
      // 1. ดึงปีที่มีอยู่จริงใน DB
      const existing = await getBudgetYears(); 
      
      // 2. สร้างปีอนาคต (เช่น ปีปัจจุบัน ถึง +3 ปี)
      const currentYear = new Date().getFullYear() + 543; // แปลงเป็น พ.ศ.
      const futureYears = [];
      for (let i = 0; i <= 3; i++) {
        const y = currentYear + i;
        // ถ้าปีนี้ยังไม่มีใน DB ให้ใส่ id เป็น null
        if (!existing.find(e => e.year === y)) {
          futureYears.push({ id: null, year: y });
        }
      }

      // 3. รวมร่าง (ปีที่มีอยู่จริง + ปีอนาคต) เรียงจากมากไปน้อย
      const allYears = [...existing, ...futureYears].sort((a, b) => b.year - a.year);
      setYears(allYears);
      
      // Default เลือกปีล่าสุดที่มีข้อมูล (ถ้ามี)
      if (existing.length > 0) {
        handleSelect(existing[0].id, existing[0].year);
      }
    }
    loadYears();
  }, []);

  const handleSelect = (id: number | null, year: number) => {
    setSelectedLabel(id ? `ปีงบประมาณ ${year}` : `ปีงบประมาณ ${year} (ยังไม่สร้าง)`);
    onYearChange(id, year); // ส่งค่ากลับไป
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
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl overflow-hidden border border-gray-100">
          {years.map((y) => (
            <button
              key={y.year}
              onClick={() => handleSelect(y.id, y.year)}
              className="w-full text-left px-4 py-3 hover:bg-blue-50 text-sm flex justify-between items-center group"
            >
              <span className={y.id ? "text-gray-700 font-medium" : "text-gray-400"}>
                {y.year}
              </span>
              {/* ถ้ายังไม่มี ID แสดงว่าเป็น New Plan */}
              {!y.id && (
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full flex items-center gap-1 group-hover:bg-blue-200">
                  <PlusCircle className="w-3 h-3" /> สร้างใหม่
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}