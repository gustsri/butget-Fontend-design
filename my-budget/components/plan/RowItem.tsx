"use client";

import React from "react";

interface RowItemProps {
  label: string;
  value?: number;     
  indent?: boolean;   
  type?: "row" | "head"; 
  isDeduction?: boolean; 
  editable?: boolean;
  onEdit?: (value: number) => void;
}

export default function RowItem({
  label,
  value,
  indent = false,
  type = "row",
  isDeduction = false,
  editable = false,
  onEdit,
}: RowItemProps) {
  
  // 1. ถ้าเป็น type="head" ให้แสดงเป็นข้อความหัวข้อ (ไม่มีช่องกรอก)
  if (type === "head") {
    return (
      <div className="py-3 px-4 bg-gray-50 border-b border-gray-200 font-bold text-gray-800 text-sm mt-2 first:mt-0">
        {label}
      </div>
    );
  }

  // Logic การซ่อน/Disable input
  // - ถ้าเป็น Deduction (หัก 35%) -> ห้ามแก้
  // - ถ้า type="head" หรือไม่มี value -> แสดงแค่ text
  const isInputDisabled = !editable || isDeduction;

  return (
    <div className={`flex items-center justify-between py-2 px-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${isDeduction ? 'bg-red-50/30' : ''}`}>
      {/* Label */}
      <div className={`flex-1 text-sm ${indent ? "pl-8 text-gray-600" : "font-medium text-gray-800"}`}>
        {isDeduction && <span className="text-red-500 mr-2 font-bold">(-)</span>}
        {label}
      </div>

      {/* Input Field */}
      <div className="w-40">
        {/* ✅ ถ้าเป็นช่องที่ต้องการให้กรอก (editable และไม่ใช่ตัวหัก) จะแสดง Input */}
        {editable && !isDeduction ? (
          <input
            type="number"
            value={value === 0 ? "" : value}
            placeholder="-"
            disabled={isInputDisabled}
            onFocus={(e) => e.target.select()} 
            onChange={(e) => {
              const val = e.target.value;
              if (onEdit) onEdit(val === "" ? 0 : parseFloat(val));
            }}
            className="w-full text-right bg-white border border-gray-300 rounded-md py-1 px-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none placeholder-gray-300 transition-shadow"
          />
        ) : (
          // ✅ ถ้าเป็น Read-only หรือตัวหัก หรือค่า 0 ที่ไม่ต้องกรอก ให้แสดง Text
          <div className={`text-right text-sm font-bold px-2 py-1 ${isDeduction ? "text-red-600" : "text-gray-900"}`}>
            {value && value !== 0 ? value.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "-"}
          </div>
        )}
      </div>
    </div>
  );
}