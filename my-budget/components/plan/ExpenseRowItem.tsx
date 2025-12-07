"use client";

import React from "react";

interface RowItemProps {
  code?: string | null;      // รหัสบัญชี (เช่น 09007)
  label: string;             // ชื่อรายการ
  govAmount?: number;        // เงินงบประมาณ
  incomeAmount?: number;     // เงินรายได้
  level?: number;            // ระดับการย่อหน้า (Indentation)
  type?: "row" | "head";     // head = หัวข้อใหญ่หนาๆ, row = รายการปกติ
  editable?: boolean;
  onEdit?: (field: "gov" | "income", value: number) => void;
}

export default function RowItem({
  code,
  label,
  govAmount = 0,
  incomeAmount = 0,
  level = 1,
  type = "row",
  editable = false,
  onEdit,
}: RowItemProps) {
  
  // คำนวณยอดรวมบรรทัดนี้
  const total = (govAmount || 0) + (incomeAmount || 0);

  // คำนวณ Padding ตาม Level (ย่อหน้า)
  const paddingLeft = level * 16; 

  // Style สำหรับ Header
  if (type === "head") {
    return (
      <div className="grid grid-cols-12 gap-2 py-2 px-4 bg-gray-100/80 border-b border-gray-200 mt-1">
        {/* Code & Label */}
        <div className="col-span-6 flex items-center font-bold text-gray-800 text-sm" style={{ paddingLeft: `${paddingLeft}px` }}>
          {code && <span className="mr-3 text-gray-500 font-mono text-xs">{code}</span>}
          {label}
        </div>
        {/* Empty Headers for alignment */}
        <div className="col-span-2 text-right text-xs text-gray-500 font-semibold self-center">เงินงบประมาณ</div>
        <div className="col-span-2 text-right text-xs text-gray-500 font-semibold self-center">เงินรายได้</div>
        <div className="col-span-2 text-right text-xs text-gray-500 font-semibold self-center">รวมทั้งสิ้น</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-2 py-2 px-4 border-b border-gray-100 hover:bg-blue-50/30 transition-colors items-center">
      
      {/* 1. Label Section */}
      <div className="col-span-6 flex items-center text-sm text-gray-700" style={{ paddingLeft: `${paddingLeft}px` }}>
         {code && <span className="mr-3 text-gray-400 font-mono text-xs w-10 text-right shrink-0">{code}</span>}
         <span className={`${level <= 2 ? 'font-semibold text-gray-900' : ''}`}>{label}</span>
      </div>

      {/* 2. Input: เงินงบประมาณ (Gov) */}
      <div className="col-span-2">
        {editable ? (
          <input
            type="number"
            value={govAmount === 0 ? "" : govAmount}
            placeholder="-"
            onChange={(e) => onEdit && onEdit("gov", parseFloat(e.target.value) || 0)}
            onFocus={(e) => e.target.select()}
            className="w-full text-right bg-white border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        ) : (
          <div className="text-right text-sm text-gray-500">{govAmount > 0 ? govAmount.toLocaleString() : "-"}</div>
        )}
      </div>

      {/* 3. Input: เงินรายได้ (Income) */}
      <div className="col-span-2">
        {editable ? (
          <input
            type="number"
            value={incomeAmount === 0 ? "" : incomeAmount}
            placeholder="-"
            onChange={(e) => onEdit && onEdit("income", parseFloat(e.target.value) || 0)}
            onFocus={(e) => e.target.select()}
            className="w-full text-right bg-white border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        ) : (
          <div className="text-right text-sm text-gray-500">{incomeAmount > 0 ? incomeAmount.toLocaleString() : "-"}</div>
        )}
      </div>

      {/* 4. Total Display */}
      <div className="col-span-2 text-right text-sm font-bold text-blue-700">
        {total > 0 ? total.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "-"}
      </div>

    </div>
  );
}