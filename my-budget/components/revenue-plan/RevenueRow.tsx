import React from 'react';
import { cn } from "@/lib/utils";

interface RevenueRowProps {
  label: string;
  amount?: number;
  type: 'header' | 'sub-header' | 'input' | 'readonly' | 'summary' | 'deduction';
  indentLevel?: number;
  isLast?: boolean;
  onChange?: (val: number) => void;
  readOnly?: boolean;
}

export default function RevenueRow({ 
  label, amount, type, indentLevel = 0, isLast = false, onChange, readOnly 
}: RevenueRowProps) {

  // Styling Logic
  const isHeader = type === 'header';
  const isSubHeader = type === 'sub-header';
  const isSummary = type === 'summary';
  const isDeduction = type === 'deduction';
  
  // Dynamic Background
  const bgClass = isHeader ? "bg-gray-50/80" : "bg-white hover:bg-gray-50 transition-colors";
  
  // Font Styling
  const labelStyle = cn(
    "text-sm",
    isHeader ? "font-bold text-gray-900" : "text-gray-700",
    isSubHeader && "font-semibold text-gray-800",
    isSummary && "font-bold text-blue-700",
    label.includes("รวมค่าบำรุง") && "text-gray-500 italic text-xs"
  );

  return (
    <div className={cn("flex group border-b border-gray-100 last:border-none", bgClass)}>
      
      {/* Column 1: Label Name */}
      <div 
        className="flex-1 py-3 pr-4 flex items-center relative"
        style={{ paddingLeft: `${1.5 + (indentLevel * 1.5)}rem` }} // Base padding + Indent
      >
        {/* เส้น Guide Line สีจางๆ สำหรับ Indent */}
        {indentLevel > 0 && (
           <div className="absolute left-6 top-0 bottom-0 border-l border-gray-100 border-dashed" />
        )}
        <span className={labelStyle}>{label}</span>
      </div>

      {/* Column 2: Amount Input / Display */}
      <div className="w-64 border-l border-gray-100 flex items-stretch">
        {type === 'input' && !readOnly ? (
          <div className="w-full relative">
            <input
              type="number"
              value={amount === 0 ? '' : amount} // ถ้าเป็น 0 ให้ว่างไว้ดูสะอาดตา (Excel Style)
              placeholder="0.00"
              onChange={(e) => onChange?.(Number(e.target.value))}
              className="w-full h-full text-right px-4 text-sm text-gray-900 bg-transparent outline-none focus:bg-blue-50 focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all placeholder-gray-300 font-medium"
            />
          </div>
        ) : amount !== undefined ? (
           <div className={cn(
             "w-full flex items-center justify-end px-4 text-sm font-medium",
             isDeduction && "text-red-500",
             isSummary && "text-blue-700 bg-blue-50/30",
             amount === 0 && "text-gray-300"
           )}>
             {amount !== 0 ? amount?.toLocaleString(undefined, {minimumFractionDigits: 2}) : "-"}
           </div>
        ) : (
            <div className="w-full bg-gray-50/50"></div> // ช่องว่างสำหรับ Header
        )}
      </div>
    </div>
  );
}