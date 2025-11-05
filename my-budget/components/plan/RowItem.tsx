"use client";

import { useEffect, useMemo, useState } from "react";

type RowItemProps = {
  label: string;
  value?: number;
  indent?: boolean;
  highlight?: "deduct" | "total";
  type?: "row" | "head";
  editable?: boolean;
  onEdit?: (value: number) => void;
};

export default function RowItem({
  label,
  value,
  indent,
  highlight,
  type,
  editable = false,
  onEdit,
}: RowItemProps) {
  if (type === "head") {
    return (
      <div className="bg-white px-6 py-3 border-b border-blue-900">
        <h3 className="text-blue-900 font-semibold text-sm">{label}</h3>
      </div>
    );
  }

  // base styles
  let rowClass =
    "flex items-center justify-between px-6 py-3.5 border-b border-gray-200 hover:bg-gray-50 transition-colors";
  let labelClass = "text-gray-700 text-sm";
  let valueClass = "text-right font-medium text-sm min-w-[180px]";

  if (indent) labelClass += " pl-8";

  // highlight style
  if (highlight === "deduct") {
    rowClass =
      "flex items-center justify-between px-6 py-3.5 bg-red-50 border-b border-gray-200";
    labelClass += " text-red-800 font-medium";
    valueClass += " text-red-700";
  } else if (highlight === "total") {
    rowClass =
      "flex items-center justify-between px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200";
    labelClass += " text-green-800 font-bold";
    valueClass += " text-green-700 font-bold text-base";
  }

  const [text, setText] = useState<string>("");

  useEffect(() => {
    if (typeof value === "number") {
      setText(
        value.toLocaleString("th-TH", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
    } else {
      setText("");
    }
  }, [value]);

  // ฟังก์ชันแปลง string -> number ปลอดภัย
  const toNumber = (s: string) => {
    // ตัดคอมมาและช่องว่าง
    const clean = s.replace(/,/g, "").trim();
    const n = Number(clean);
    return isNaN(n) ? 0 : n;
  };
  const ReadOnlyValue = useMemo(() => {
    const formatted =
      typeof value === "number"
        ? value.toLocaleString("th-TH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        : "";
    return (
      <>
        <span className={valueClass}>{formatted}</span>
        <span className="text-gray-500 text-xs ml-1">บาท</span>
      </>
    );
  }, [value, valueClass]);

  const EditableValue = (
    <>
      <input
        inputMode="decimal"
        className={`text-right ${valueClass} border rounded-md px-2 py-1 w-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white`}
        value={text}
        onChange={(e) => {
          // ยอมให้พิมพ์ได้อิสระ แล้วค่อยฟอร์แมตตอน blur
          setText(e.target.value);
        }}
        onBlur={() => {
          const num = toNumber(text);
          // ฟอร์แมตกลับเป็นมีคอมมา
          const formatted = num.toLocaleString("th-TH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
          setText(formatted);
          onEdit?.(num);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            (e.target as HTMLInputElement).blur();
          }
        }}
      />
      <span className="text-gray-500 text-xs ml-1">บาท</span>
    </>
  );

  return (
    <div className={rowClass}>
      <span className={labelClass}>{label}</span>
      <div className="flex items-center gap-2">
        {highlight === "deduct" && (
          <span className="text-red-600 text-xs font-medium">หัก</span>
        )}
        {editable ? EditableValue : ReadOnlyValue}
      </div>
    </div>
  );
}
