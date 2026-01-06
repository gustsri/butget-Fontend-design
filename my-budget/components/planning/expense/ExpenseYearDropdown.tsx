"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Calendar, Plus, Loader2 } from "lucide-react";
import { getOnlyExpenseYears } from "@/app/actions"; // เรียก Action ตัวใหม่

interface Props {
  selectedYear: number;
  onChange: (year: number) => void;
  onCreate: (year: number) => void;
}

export default function ExpenseYearDropdown({ selectedYear, onChange, onCreate }: Props) {
  const [dbYears, setDbYears] = useState<number[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const currentYear = new Date().getFullYear() + 543;

  // 1. โหลดข้อมูลเมื่อ Mount หรือเมื่อ selectedYear เปลี่ยน (เพื่อให้ List อัปเดตหลังสร้างเสร็จ)
  useEffect(() => {
    const fetchYears = async () => {
      setLoading(true);
      const data = await getOnlyExpenseYears();
      setDbYears(data.map(d => d.year));
      setLoading(false);
    };
    fetchYears();
  }, [selectedYear, isOpen]); // check ทุกครั้งที่เปิด หรือ เปลี่ยนปี

  // 2. สร้าง List ที่จะแสดง (ปีใน DB + ปีที่เลือก + ปีอนาคต/อดีต)
  const getOptions = () => {
    const years = new Set(dbYears);
    
    // ต้องมีปีที่เลือกอยู่เสมอ
    years.add(selectedYear);
    
    // ต้องมีปีปัจจุบันเสมอ (เผื่อเริ่มระบบใหม่)
    years.add(currentYear);

    // เพิ่มปีอนาคต/อดีต ให้เลือกสร้าง (+/- 2 ปี จากขอบเขตที่มี)
    const all = Array.from(years);
    const max = Math.max(...all);
    const min = Math.min(...all);

    years.add(max + 1);
    years.add(max + 2);
    years.add(min - 1);

    // เรียงจากมากไปน้อย
    return Array.from(years).sort((a, b) => b - a);
  };

  const options = getOptions();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-md transition-colors text-white text-sm font-medium border border-white/10"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4 opacity-80" />}
        <span className="font-mono">{selectedYear}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-xl overflow-hidden border border-gray-100 max-h-80 overflow-y-auto z-50 animate-in fade-in zoom-in-95">
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            เลือกปีงบประมาณ
          </div>
          
          {options.map(year => {
            const isExisting = dbYears.includes(year);
            const isSelected = year === selectedYear;

            return (
              <button
                key={year}
                onClick={() => {
                  setIsOpen(false);
                  if (isExisting) {
                    onChange(year);
                  } else {
                    onCreate(year);
                  }
                }}
                className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors border-b border-gray-50 last:border-0
                  ${isSelected ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}
                `}
              >
                <div className="flex items-center gap-2">
                  {/* Icon logic */}
                  {isExisting ? (
                    <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-blue-500' : 'bg-slate-300'}`} />
                  ) : (
                    <Plus className="w-4 h-4 text-emerald-500" />
                  )}
                  <span className="font-mono">{year}</span>
                </div>

                {/* Status Badge */}
                {!isExisting && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded font-medium">
                    สร้างใหม่
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}