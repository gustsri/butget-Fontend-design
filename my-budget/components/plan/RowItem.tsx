"use client";

import React from "react";

interface RowItemProps {
  label: string;
  value?: number;     // ถ้าเป็น undefined คือเป็นหัวข้อ (Head) ไม่มีช่องกรอก
  indent?: boolean;   // ย่อหน้าหรือไม่
  type?: "row" | "head"; 
  isDeduction?: boolean; // เป็นรายการหักเงินหรือไม่ (สีแดง)
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
  
  // Style สำหรับหัวข้อ (Head) vs รายการปกติ (Row)
  if (type === "head") {
    return (
      <div className="py-3 px-4 bg-gray-50 border-b border-gray-200 font-bold text-gray-800 text-sm">
        {label}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between py-3 px-4 border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
      {/* Label: จัดย่อหน้าตาม indent */}
      <div className={`flex-1 text-sm ${indent ? "pl-8 text-gray-600" : "font-medium text-gray-800"}`}>
        {isDeduction && <span className="text-red-500 mr-1">(-)</span>}
        {label}
      </div>

      {/* Input Field */}
      <div className="w-48">
        {editable ? (
          <input
            type="number"
            value={value === 0 ? "" : value} // ซ่อนเลข 0
            placeholder="0"
            disabled={!editable}
            onFocus={(e) => e.target.select()} // คลุมดำตอนคลิก
            onChange={(e) => {
              const val = e.target.value;
              if (onEdit) onEdit(val === "" ? 0 : parseFloat(val));
            }}
            // Tailwind Class ซ่อนปุ่มลูกศร + จัดขวา
            className={`w-full text-right bg-white border border-gray-200 rounded-md py-1 px-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none 
              [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
              ${isDeduction ? "text-red-600 font-bold" : "text-gray-900"}`}
          />
        ) : (
          <div className={`text-right text-sm font-bold ${isDeduction ? "text-red-600" : "text-gray-900"}`}>
            {value?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        )}
      </div>
    </div>
  );
}