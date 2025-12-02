"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
// เราจะสร้าง server action เล็กๆ ไว้ดึงปี หรือดึงผ่าน API ก็ได้
// ในที่นี้สมมติว่าคุณสร้าง action getBudgetYears ไว้ใน actions.ts ของหน้านี้หรือไฟล์กลาง
import { getBudgetYears } from "@/app/planning/student-enroll/actions"; 

interface YearDropdownProps {
  onYearChange: (yearId: number) => void;
}

export default function YearDropdown({ onYearChange }: YearDropdownProps) {
  const [years, setYears] = useState<{ id: number; year: number }[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    async function fetchYears() {
      const data = await getBudgetYears();
      if (data.length > 0) {
        setYears(data);
        // เลือกปีล่าสุดเป็นค่าเริ่มต้น
        setSelectedYear(data[0].year);
        onYearChange(data[0].id);
      }
    }
    fetchYears();
  }, []);

  const handleSelect = (id: number, year: number) => {
    setSelectedYear(year);
    onYearChange(id); // ส่ง ID กลับไปให้หน้าหลัก
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors border border-white/20 backdrop-blur-sm"
      >
        <span className="text-sm font-medium">
          ปีงบประมาณ: {selectedYear ? selectedYear : "กำลังโหลด..."}
        </span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50 py-1 text-gray-800 border border-gray-100">
          {years.map((y) => (
            <button
              key={y.id}
              onClick={() => handleSelect(y.id, y.year)}
              className="block w-full text-left px-4 py-2 hover:bg-blue-50 text-sm hover:text-blue-700"
            >
              {y.year}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}