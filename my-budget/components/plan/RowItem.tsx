type RowItemProps = {
  label: string;      // ข้อความด้านซ้าย
  value?: string;     // ค่า default ของ input
  indent?: boolean;   // จะเยื้องข้อความไหม
  highlight?: "normal" | "total" | "deduct"; // สไตล์พิเศษ
};

export default function RowItem({ label, value, indent, highlight = "normal" }: RowItemProps) {
  let rowStyle = "flex justify-between items-center px-4 py-2";
  let inputStyle = "w-40 text-right border rounded px-2 py-1 focus:outline-none focus:ring-2";
  let labelStyle = "flex-1 text-gray-800";

  // ถ้ามี indent → เพิ่ม padding-left
  if (indent) labelStyle += " pl-8";

  // ถ้าเป็นแถวพิเศษ เช่น total, deduct
  if (highlight === "deduct") {
    rowStyle += " bg-gray-50 font-semibold";
    inputStyle += " focus:ring-red-500";
  } else if (highlight === "total") {
    rowStyle += " bg-green-50 font-bold text-green-800";
    inputStyle += " bg-green-100 focus:ring-green-500 text-green-900 font-bold";
  }

  return (
    <div className={rowStyle}>
      <span className={labelStyle}>{label}</span>
      <input
        type="text"
        defaultValue={value}
        className={inputStyle}
      />
    </div>
  );
}
