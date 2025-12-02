"use client";

import React from "react";

interface TableRowProps {
  category: React.ReactNode;
  year1: number;
  year2: number;
  year3: number;
  year4: number;
  year5: number;
  year6: number;
  total: number;
  highlight?: "plan" | "actual";
  editable?: boolean;
  onEdit?: (field: string, value: number) => void;
}

export default function TableRow({
  category,
  year1,
  year2,
  year3,
  year4,
  year5,
  year6,
  total,
  highlight,
  editable = false,
  onEdit,
}: TableRowProps) {

  // ✅ แก้ไขฟังก์ชันนี้: เพิ่มการดักค่า undefined/null
  const renderInput = (field: string, value: number | undefined | null) => {
    // ถ้า value เป็น null/undefined ให้ใช้ 0 แทนทันที (กันแอปพัง)
    const safeValue = value ?? 0;

    if (!editable) {
      return <span className="text-gray-600 font-medium">{safeValue.toLocaleString()}</span>;
    }

    return (
      <input
        type="number"
        value={safeValue === 0 ? "" : safeValue}
        placeholder="0"
        disabled={!editable}
        // 🔥 แก้ไขตรงนี้: เพิ่ม Class เพื่อซ่อนปุ่มลูกศร
        className={`w-full text-right bg-transparent border-b border-transparent focus:border-blue-500 focus:outline-none transition-colors py-1 px-1 font-medium 
          [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
          ${highlight === "actual" ? "text-blue-900 placeholder-blue-300" : "text-gray-900 placeholder-gray-300"}`}

        onFocus={(e) => e.target.select()}
        onChange={(e) => {
          const val = e.target.value;
          if (onEdit) onEdit(field, val === "" ? 0 : parseFloat(val));
        }}
        // เพิ่มบรรทัดนี้เพื่อกัน User เลื่อนเมาส์ (Scroll) แล้วตัวเลขเปลี่ยน
        onWheel={(e) => e.currentTarget.blur()}
      />
    );
  };

  const rowClass = highlight === "plan"
    ? "bg-white hover:bg-gray-50"
    : highlight === "actual"
      ? "bg-blue-50/50 hover:bg-blue-50"
      : "bg-white";

  return (
    <div className={`grid grid-cols-12 gap-2 p-3 items-center border-b border-gray-100 last:border-0 transition-colors duration-200 ${rowClass}`}>

      {/* Category Name */}
      <div className="col-span-3 text-sm font-semibold text-gray-700 truncate pl-2">
        {category}
      </div>

      {/* Input Fields */}
      <div className="col-span-1 text-right">{renderInput("year1", year1)}</div>
      <div className="col-span-1 text-right">{renderInput("year2", year2)}</div>
      <div className="col-span-1 text-right">{renderInput("year3", year3)}</div>
      <div className="col-span-1 text-right">{renderInput("year4", year4)}</div>
      <div className="col-span-1 text-right">{renderInput("year5", year5)}</div>
      <div className="col-span-1 text-right">{renderInput("year6", year6)}</div>

      {/* Total: ต้องใส่ ?? 0 กันเหนียวด้วยเช่นกัน */}
      <div className="col-span-2 text-right pr-4">
        <span className={`font-bold ${highlight === 'actual' ? 'text-blue-600' : 'text-gray-800'}`}>
          {(total ?? 0).toLocaleString()}
        </span>
      </div>
    </div>
  );
}