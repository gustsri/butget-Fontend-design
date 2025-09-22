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
  const rowStyle = "grid grid-cols-8 items-center";

  // ✅ หัวตาราง
  if (type === "head") {
    return (
      <div className={`${rowStyle} border-b-2 border-gray-300 font-semibold`}>
        <div className="text-left px-3 py-2">{category}</div>
        <div className="text-center py-2">ปีที่ 1</div>
        <div className="text-center py-2">ปีที่ 2</div>
        <div className="text-center py-2">ปีที่ 3</div>
        <div className="text-center py-2">ปีที่ 4</div>
        <div className="text-center py-2">ปีที่ 5</div>
        <div className="text-center py-2">ปีที่ 6</div>
        <div className="text-center py-2">รวม</div>
      </div>
    );
  }

  // ✅ สไตล์หมวด (แผน/จริง)
  let categoryStyle =
    "flex items-center justify-center font-medium px-3 py-2 min-w-[80px]";
  if (highlight === "plan") {
    categoryStyle += " bg-blue-500 text-white rounded";
  } else if (highlight === "actual") {
    categoryStyle += " bg-blue-400 text-white rounded";
  } else {
    categoryStyle += " bg-gray-500 text-white rounded";
  }

  const cellStyle =
    "text-center px-2 py-2 min-w-[70px] border rounded bg-white";
  const totalStyle =
    "text-center px-2 py-2 min-w-[70px] border rounded bg-blue-50 font-semibold text-blue-800";

  const baseCellStyle =
    "flex items-center justify-center text-center h-10 leading-10 min-w-[70px]";

  const renderCell = (field: string, value?: number) =>
    editable ? (
      <input
        type="number"
        value={value || 0}
        onChange={(e) => onEdit?.(field, Number(e.target.value))}
        className={`${baseCellStyle} bg-white appearance-none outline-none`}
        style={{ MozAppearance: "textfield" }} // ✅ fix Firefox
      />
    ) : (
      <div className={`${baseCellStyle} bg-gray-50`}>{value || 0}</div>
    );


  // ✅ row ข้อมูลจริง
  return (
    <div className={rowStyle}>
      <div className={categoryStyle}>{category}</div>
      {renderCell("year1", year1)}
      {renderCell("year2", year2)}
      {renderCell("year3", year3)}
      {renderCell("year4", year4)}
      {renderCell("year5", year5)}
      {renderCell("year6", year6)}
      <div className={totalStyle}>{total || 0}</div>
    </div>
  );
}
