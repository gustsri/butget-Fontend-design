"use client";

import { Plus, Trash2, Edit2 } from "lucide-react";
import React from "react";

interface RevenueTableProps {
  sections: any[];
  readOnly?: boolean;
  onUpdateAmount: (itemId: number, newVal: number) => void;
  onAddSection?: () => void;
  onAddItem?: (sectionId: number) => void;
  onDeleteItem?: (itemId: number) => void;
  
  // ✅ Props ใหม่
  onUpdateItemName?: (itemId: number, newVal: string) => void;
  onUpdateSectionName?: (sectionId: number, newVal: string) => void;
  onDeleteSection?: (sectionId: number) => void;
}

export default function RevenueTable({ 
    sections, 
    readOnly = false, 
    onUpdateAmount, 
    onAddSection, 
    onAddItem, 
    onDeleteItem,
    onUpdateItemName,
    onUpdateSectionName,
    onDeleteSection
}: RevenueTableProps) {
  
  if (!sections || sections.length === 0) {
      return <div className="p-8 text-center text-gray-400">ไม่มีรายการงบประมาณ</div>;
  }

  return (
    <div className="overflow-x-auto pb-20"> {/* pb-20 เผื่อพื้นที่ด้านล่าง */}
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 uppercase tracking-wider text-xs">
          <tr>
            <th className="px-6 py-4 w-[60%]">รายการ (Description)</th>
            <th className="px-6 py-4 text-right w-[25%]">จำนวนเงิน (Amount)</th>
            {!readOnly && <th className="px-4 py-4 w-[15%] text-center">จัดการ</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sections.map((section) => (
            <React.Fragment key={section.section_id}>
              
              {/* --- Section Header (แก้ไขชื่อได้ + ลบได้) --- */}
              <tr className="bg-slate-100/80 group/section">
                <td colSpan={readOnly ? 2 : 2} className="px-6 py-3 font-bold text-slate-800 border-t border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    {/* Input แก้ไขชื่อ Section */}
                    <input 
                        type="text"
                        disabled={readOnly}
                        value={section.section_name}
                        onChange={(e) => onUpdateSectionName && onUpdateSectionName(section.section_id, e.target.value)}
                        className={`w-full bg-transparent border-b border-transparent focus:border-blue-500 outline-none font-bold text-slate-800 placeholder-slate-400
                            ${!readOnly ? 'hover:border-slate-300' : ''}
                        `}
                    />
                  </div>
                </td>
                
                {/* ปุ่มลบ Section (แสดงเมื่อเอาเมาส์ชี้ และไม่ readOnly) */}
                {!readOnly && (
                    <td className="px-4 py-3 text-center border-t border-b border-slate-200">
                        {onDeleteSection && (
                             <button 
                                onClick={() => onDeleteSection(section.section_id)}
                                className="text-gray-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors"
                                title="ลบทั้งหมวดหมู่"
                             >
                                 <Trash2 className="w-4 h-4" />
                             </button>
                        )}
                    </td>
                )}
                {/* กรณี ReadOnly ต้องมี td เปล่าเพื่อให้ตารางไม่เบี้ยว ถ้า colSpan ไม่ครบ */}
                {readOnly && <td className="border-t border-b border-slate-200"></td>}
              </tr>

              {/* --- Items (แก้ไขชื่อได้) --- */}
              {section.items.map((item: any) => (
                <tr key={item.item_id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-2 pl-10 text-gray-700 flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${item.is_deduction ? 'bg-red-400' : 'bg-green-400'}`}></span>
                    
                    {/* Input แก้ไขชื่อ Item */}
                    <input 
                        type="text"
                        disabled={readOnly}
                        value={item.item_name}
                        onChange={(e) => onUpdateItemName && onUpdateItemName(item.item_id, e.target.value)}
                        className={`w-full bg-transparent border border-transparent rounded px-2 py-1 outline-none transition-all
                            ${!readOnly ? 'hover:bg-white hover:border-gray-200 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100' : ''}
                        `}
                    />
                  </td>
                  
                  {/* ช่องกรอกจำนวนเงิน */}
                  <td className="px-6 py-2 text-right">
                    <input
                        type="number"
                        disabled={readOnly}
                        value={Number(item.amount).toString()} 
                        onChange={(e) => onUpdateAmount(item.item_id, parseFloat(e.target.value) || 0)}
                        className={`w-full text-right px-2 py-1 rounded border focus:ring-2 focus:ring-blue-500 outline-none transition-all
                            ${readOnly ? 'bg-transparent border-transparent' : 'bg-white border-gray-300 hover:border-blue-400'}
                            ${item.is_deduction ? 'text-red-600 font-medium' : 'text-gray-800'}
                        `}
                    />
                  </td>
                  
                  {/* ปุ่มลบ Item */}
                  {!readOnly && (
                      <td className="px-4 py-2 text-center">
                          <button 
                             onClick={() => onDeleteItem && onDeleteItem(item.item_id)}
                             className="text-gray-300 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                             title="ลบรายการ"
                          >
                              <Trash2 className="w-4 h-4" />
                          </button>
                      </td>
                  )}
                </tr>
              ))}

              {/* ปุ่มเพิ่ม Item */}
              {!readOnly && onAddItem && (
                  <tr>
                      <td colSpan={3} className="px-6 py-2">
                          <button 
                             onClick={() => onAddItem(section.section_id)}
                             className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 hover:underline pl-10 opacity-60 hover:opacity-100 transition-opacity"
                          >
                              <Plus className="w-3 h-3" /> เพิ่มรายการย่อย
                          </button>
                      </td>
                  </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {/* ปุ่มเพิ่ม Section */}
      {!readOnly && onAddSection && (
          <div className="p-4 border-t border-gray-200 bg-gray-50/50 flex justify-center">
              <button 
                 onClick={onAddSection}
                 className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-blue-300 hover:text-blue-600 transition-all"
              >
                  <Plus className="w-4 h-4" /> เพิ่มหมวดหมู่ใหม่
              </button>
          </div>
      )}
    </div>
  );
}