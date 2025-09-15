type RowItemProps = {
  label: string;      
  value?: string;     
  indent?: boolean;   
  highlight?: "normal" | "total" | "deduct"; 
  type?: "row" | "head"; // 👈 เพิ่ม type
};

export default function RowItem({ 
  label, 
  value, 
  indent, 
  highlight = "normal", 
  type = "row" 
}: RowItemProps) {

  // base styles
  let rowStyle = "flex items-center px-4 py-2";
  let labelStyle = "flex-1 text-gray-800";
  let inputStyle = "w-40 text-right border rounded px-2 py-1 focus:outline-none focus:ring-2";

  // indent
  if (indent) labelStyle += " pl-8";

  // highlight deduct  ฝฝ total
  if (highlight === "deduct") {
    rowStyle += " bg-gray-50 font-semibold";
    inputStyle += " focus:ring-red-500";
  } else if (highlight === "total") {
    rowStyle += " bg-green-50 font-bold text-green-800";
    inputStyle += " bg-green-100 focus:ring-green-500 text-green-900 font-bold";
  }

  // head row
  if (type === "head") {
    rowStyle += " font-semibold bg-gray-50 px-6";
  }

  return (
    <div className={rowStyle}>
      <span className={labelStyle}>{label}</span>
      {type === "row" && (
        <input
          type="text"
          defaultValue={value}
          className={inputStyle}
        />
      )}
    </div>
  );
}
