"use client";

import { useState, useEffect } from "react";
import { ChevronDown, PlusCircle, History, Loader2 } from "lucide-react";
import { getBudgetYears, createBudgetYear } from "@/app/actions";

interface YearDropdownProps {
  onYearChange: (yearId: number | null, yearVal: number) => void;
  selectedYear?: number | null;
  allowCreate?: boolean;
}

export default function YearDropdown({ 
  onYearChange, 
  selectedYear, 
  allowCreate = false 
}: YearDropdownProps) {
  
  const [years, setYears] = useState<{ id: number | null; year: number }[]>([]);
  const [selectedLabel, setSelectedLabel] = useState("เลือกปีงบประมาณ");
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // ✅ Effect 1: ดึงข้อมูลปี (ทำแค่ครั้งเดียวตอนโหลดหน้าเว็บ หรือเมื่อ allowCreate เปลี่ยน)
  // ตัด selectedYear ออกจาก dependency array เพื่อไม่ให้โหลดซ้ำจนข้อมูลหาย
  useEffect(() => {
    async function loadYears() {
      const existing = await getBudgetYears(); 
      const currentYear = new Date().getFullYear() + 543; 
      
      const allYearsMap = new Map<number, number | null>();

      // 1. ใส่ปีที่มีอยู่จริง
      existing.forEach(y => allYearsMap.set(y.year, y.id));

      // 2. เพิ่มปีหลอกๆ (ถ้าอนุญาตให้สร้าง)
      if (allowCreate) {
        for (let i = 1; i <= 3; i++) {
          const y = currentYear + i;
          if (!allYearsMap.has(y)) allYearsMap.set(y, null);
        }
        for (let i = 0; i <= 5; i++) {
          const y = currentYear - i;
          if (!allYearsMap.has(y)) allYearsMap.set(y, null);
        }
      }

      const sortedYears = Array.from(allYearsMap.entries())
        .sort((a, b) => b[0] - a[0])
        .map(([year, id]) => ({ id, year }));

      setYears(sortedYears);
      
      // Logic เลือกค่าเริ่มต้น (ทำเฉพาะตอนโหลดครั้งแรกที่ไม่มี selectedYear ส่งมา)
      if (!selectedYear) {
        if (existing.length > 0) {
           const current = existing.find(e => e.year === currentYear);
           if (current) {
              handleSelect(current.id, current.year);
           } else {
              handleSelect(existing[0].id, existing[0].year);
           }
        } else {
           if (allowCreate) {
              handleSelect(null, currentYear);
           } else {
              setSelectedLabel("ไม่พบข้อมูลปีงบประมาณ");
           }
        }
      }
    }
    loadYears();
  }, [allowCreate]); // 👈 เอา selectedYear ออกแล้ว

  // ✅ Effect 2: อัปเดตป้ายชื่อเมื่อ selectedYear เปลี่ยน (แยกออกมาต่างหาก)
  useEffect(() => {
    if (selectedYear) {
      setSelectedLabel(`ปีงบประมาณ ${selectedYear}`);
      
      // *Trick: อัปเดต state ภายในเพื่อให้รู้ว่าปีนี้มี ID แล้ว (กรณี parent สั่งเปลี่ยน)
      // แต่ปกติ handleSelect จะจัดการให้อยู่แล้ว ส่วนนี้เผื่อไว้สำหรับตอนโหลดครั้งแรก
      setYears(prev => prev.map(y => {
         if (y.year === selectedYear && y.id === null) {
            // สมมติว่าถ้าถูกเลือกมาจากข้างนอก แสดงว่ามันน่าจะมีอยู่จริง (หรือเพิ่งสร้างเสร็จ)
            // แต่เพื่อความชัวร์ ปล่อยให้เป็นหน้าที่ของ handleSelect ดีกว่า
            return y; 
         }
         return y;
      }));
    }
  }, [selectedYear]);


  const updateLabel = (year: number) => {
      setSelectedLabel(`ปีงบประมาณ ${year}`);
  }

  const handleSelect = async (id: number | null, year: number) => {
    setIsOpen(false);

    if (id) {
      updateLabel(year);
      onYearChange(id, year);
      return;
    }

    if (!allowCreate) return;

    try {
      setIsCreating(true);
      setSelectedLabel(`กำลังสร้างปี ${year}...`);
      
      const newYearRecord = await createBudgetYear(year);
      
      if (newYearRecord) {
        // ✅ อัปเดต State ทันที ข้อมูลในลิสต์จะเปลี่ยนเป็น "มี ID" ทันที ไม่ต้องรอโหลดใหม่
        setYears(prev => prev.map(y => y.year === year ? { ...y, id: newYearRecord.id } : y));
        
        updateLabel(year);
        onYearChange(newYearRecord.id, year);
      }
    } catch (error) {
      console.error(error);
      setSelectedLabel("เกิดข้อผิดพลาด");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="relative z-50">
      <button
        disabled={isCreating || (years.length === 0 && !allowCreate)} 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors border border-white/20 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="text-sm font-medium">
            {isCreating ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/> กำลังสร้าง...</span> : selectedLabel}
        </span>
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
              
              {!y.id && allowCreate && (
                <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 
                  ${y.year > (new Date().getFullYear() + 543) 
                    ? 'bg-blue-100 text-blue-600 group-hover:bg-blue-200' 
                    : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'}`}
                >
                  {y.year > (new Date().getFullYear() + 543) 
                    ? <><PlusCircle className="w-3 h-3" /> สร้างใหม่</> 
                    : <><History className="w-3 h-3" /> ย้อนหลัง</>}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}