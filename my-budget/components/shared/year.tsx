"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, Calendar, Plus, Check, Loader2 } from "lucide-react";
// ✅ Import จากไฟล์กลางที่คุณรวมไว้ (app/actions.ts)
import { getBudgetYears, createBudgetYear } from "@/app/actions"; 

interface YearDropdownProps {
  onYearChange: (yearId: number | null, yearVal: number) => void;
  selectedYear?: number | null;
  allowCreate?: boolean;
}

export default function YearDropdown({ 
  onYearChange, 
  selectedYear: initialYearVal,
  allowCreate = false
}: YearDropdownProps) {
  
  const [years, setYears] = useState<{ id: number; year: number }[]>([]);
  const [selectedYearVal, setSelectedYearVal] = useState<number | null>(initialYearVal || null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [creatingYear, setCreatingYear] = useState<number | null>(null); // เก็บปีที่กำลังสร้าง
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentThaiYear = new Date().getFullYear() + 543; 

  const fetchYears = async () => {
    setIsLoading(true);
    try {
      const data = await getBudgetYears();
      setYears(data);
    } catch (error) {
      console.error("Failed to load years", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchYears();
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (initialYearVal) setSelectedYearVal(initialYearVal);
  }, [initialYearVal]);

  const handleSelect = (y: { id: number, year: number }) => {
    setSelectedYearVal(y.year);
    onYearChange(y.id, y.year);
    setIsOpen(false);
  };

  // ✅ Logic ใหม่: คำนวณปีที่สามารถสร้างได้ (Createable Years)
  const getCreateableYears = () => {
    if (!allowCreate) return [];

    const existingYearNums = years.map(y => y.year);
    const options = new Set<number>();

    // 1. กฎหลัก: ปีปัจจุบัน +/- 2 ปี
    for (let i = -2; i <= 2; i++) {
        options.add(currentThaiYear + i);
    }

    // 2. กฎรอง: ขยายขอบเขตจากปีที่มีอยู่แล้ว +/- 1 ปี
    if (existingYearNums.length > 0) {
        const minExisting = Math.min(...existingYearNums);
        const maxExisting = Math.max(...existingYearNums);
        options.add(minExisting - 1); // สร้างปีย้อนหลังเพิ่ม
        options.add(maxExisting + 1); // สร้างปีอนาคตเพิ่ม
    }

    // แปลงเป็น Array -> กรองปีที่มีอยู่แล้วออก -> เรียงลำดับ
    return Array.from(options)
        .filter(y => !existingYearNums.includes(y))
        .sort((a, b) => b - a); // เรียงมากไปน้อย
  };

  const createableYears = getCreateableYears();

  const handleCreate = async (targetYear: number) => {
    if(!confirm(`ต้องการเปิดปีงบประมาณใหม่ ${targetYear} ใช่หรือไม่?`)) return;

    setCreatingYear(targetYear);
    try {
      const newBudget = await createBudgetYear(targetYear);
      await fetchYears(); // โหลดรายการใหม่
      handleSelect({ id: newBudget.id, year: newBudget.year }); // เลือกปีที่เพิ่งสร้าง
    } catch (error) {
      alert("สร้างปีงบประมาณไม่สำเร็จ");
    } finally {
      setCreatingYear(null);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg border border-white/10 transition-all text-sm font-medium min-w-[150px] justify-between"
      >
        <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-200" />
            <span>{selectedYearVal ? `ปีงบ ${selectedYearVal}` : "เลือกปีงบประมาณ"}</span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 max-h-[400px] overflow-y-auto">
            
            {/* 1. รายการที่มีอยู่แล้ว */}
            <div className="py-1">
                <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    ปีงบประมาณที่มีอยู่
                </div>
                {isLoading ? (
                    <div className="p-4 text-center text-gray-400 text-xs flex items-center justify-center gap-2">
                        <Loader2 className="w-3 h-3 animate-spin" /> กำลังโหลด...
                    </div>
                ) : years.length > 0 ? (
                    years.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleSelect(item)}
                            className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-blue-50 transition-colors
                                ${selectedYearVal === item.year ? "text-blue-600 font-bold bg-blue-50/50" : "text-gray-600"}
                            `}
                        >
                            <span>ปีงบประมาณ {item.year}</span>
                            {selectedYearVal === item.year && <Check className="w-4 h-4" />}
                        </button>
                    ))
                ) : (
                    <div className="p-3 text-center text-gray-400 text-xs">ไม่พบข้อมูล</div>
                )}
            </div>

            {/* 2. รายการที่สร้างได้ (ตาม Logic +/- 2 และ +/- 1) */}
            {allowCreate && createableYears.length > 0 && (
                <div className="border-t border-gray-100 bg-gray-50/50 py-1">
                    <div className="px-4 py-2 text-xs font-semibold text-emerald-600 uppercase tracking-wider flex items-center gap-2">
                        <Plus className="w-3 h-3" /> เปิดปีงบประมาณใหม่
                    </div>
                    {createableYears.map(y => (
                        <button
                            key={y}
                            onClick={() => handleCreate(y)}
                            disabled={creatingYear !== null}
                            className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors flex items-center justify-between group"
                        >
                            <span>ปีงบประมาณ {y}</span>
                            {creatingYear === y ? (
                                <Loader2 className="w-3 h-3 animate-spin text-emerald-500" />
                            ) : (
                                <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-500" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
      )}
    </div>
  );
}