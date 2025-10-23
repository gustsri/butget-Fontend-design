"use client";

type RowItemProps = {
  label: string;
  value?: number;
  indent?: boolean;
  highlight?: "deduct" | "total";
  type?: "row" | "head";
};

export default function RowItem({
  label,
  value,
  indent,
  highlight,
  type,
}: RowItemProps) {
  const formattedValue =
    typeof value === "number"
      ? value.toLocaleString("th-TH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
      : "";

  if (type === "head") {
    return (
      <div className="bg-blue-500 px-6 py-3 border-b border-blue-600">
        <h3 className="text-white font-semibold text-sm">{label}</h3>
      </div>
    );
  }



  // base styles
  let rowClass =
    "flex items-center justify-between px-6 py-3.5 border-b border-gray-200 hover:bg-gray-50 transition-colors";
  let labelClass = "text-gray-700 text-sm";
  let valueClass = "text-right font-medium text-sm min-w-[180px]";

  if (indent) {
    labelClass += " pl-8";
  }

  // highlight style
  if (highlight === "deduct") {
    rowClass = "flex items-center justify-between px-6 py-3.5 bg-red-50 border-b border-gray-200";
    labelClass += " text-red-800 font-medium";
    valueClass += " text-red-700";
  } else if (highlight === "total") {
    rowClass =
      "flex items-center justify-between px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200";
    labelClass += " text-green-800 font-bold";
    valueClass += " text-green-700 font-bold text-base";
  }

  return (
    <div className={rowClass}>
      <span className={labelClass}>{label}</span>
      <div className="flex items-center gap-2">
        {highlight === "deduct" && (
          <span className="text-red-600 text-xs font-medium">หัก</span>
        )}
        <span className={valueClass}>{formattedValue}</span>
        <span className="text-gray-500 text-xs ml-1">บาท</span>
      </div>
    </div>
  );
}
