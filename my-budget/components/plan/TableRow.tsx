type TableRowProps = {
  category: string;
  year1?: number;
  year2?: number;
  year3?: number;
  year4?: number;
  year5?: number;
  year6?: number;
  total?: number;
  highlight?: "normal" | "plan" | "actual";
  type?: "row" | "head";
  editable?: boolean;
  onEdit?: (field: string, value: number) => void;
};

export default function TableRow({
  category,
  year1,
  year2,
  year3,
  year4,
  year5,
  year6,
  total,
  highlight = "normal",
  type = "row",
  editable = false,
  onEdit,
}: TableRowProps) {
  // ✅ หัวตาราง
  if (type === "head") {
    return (
      <div className="grid grid-cols-8 gap-3 mb-3 text-sm text-gray-700 items-center">
        <div className="text-center font-medium">หมวด</div>
        <div className="text-center font-medium">ปีที่ 1</div>
        <div className="text-center font-medium">ปีที่ 2</div>
        <div className="text-center font-medium">ปีที่ 3</div>
        <div className="text-center font-medium">ปีที่ 4</div>
        <div className="text-center font-medium">ปีที่ 5</div>
        <div className="text-center font-medium">ปีที่ 6</div>
        <div className="text-center font-medium">รวม</div>
      </div>
    );
  }

  // ✅ สไตล์หมวด (แผน/จริง)
  let categoryBadgeStyle = "inline-block px-4 py-2 text-sm font-medium rounded text-white min-w-[80px] text-center";
  if (highlight === "plan") {
    categoryBadgeStyle += " bg-blue-500";
  } else if (highlight === "actual") {
    categoryBadgeStyle += " bg-blue-400";
  } else {
    categoryBadgeStyle += " bg-gray-500";
  }

  const renderCell = (field: string, value?: number, isTotal = false) => {
    const containerClass =
      "border rounded min-w-[60px] h-10 flex items-center justify-center relative";
    const bgClass = isTotal ? "bg-blue-50" : editable ? "bg-white" : "bg-gray-100";
    const textClass = isTotal
      ? "font-semibold text-blue-800"
      : editable
        ? ""
        : "text-gray-500";

    return (
      <div className={`${containerClass} ${bgClass} ${textClass}`}>
        {editable && !isTotal ? (
          <input
            type="number"
            value={value || 0}
            onChange={(e) => onEdit?.(field, Number(e.target.value))}
            className="w-full h-full text-center bg-transparent outline-none appearance-none border-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            style={{ MozAppearance: "textfield" }}
          />
        ) : (
          <span>{value || 0}</span>
        )}
      </div>
    );
  };


  // ✅ แสดง row แบบเดิม (แผน/จริง คนละแถว)
  return (
    <div className="grid grid-cols-8 gap-3 items-center mb-2">
      <div className={categoryBadgeStyle}>{category}</div>
      {renderCell("year1", year1)}
      {renderCell("year2", year2)}
      {renderCell("year3", year3)}
      {renderCell("year4", year4)}
      {renderCell("year5", year5)}
      {renderCell("year6", year6)}
      {renderCell("total", total, true)}
    </div>
  );
}