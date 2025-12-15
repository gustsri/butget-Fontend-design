import React from 'react';
import RevenueRow from './RevenueRow';

type Item = { item_id: number; item_name: string; amount: number; is_deduction: boolean; };
type Section = { section_id: number; section_name: string; items: Item[]; };

interface RevenueTableProps {
  sections: Section[];
  onUpdate: (itemId: number, val: number) => void;
  readOnly: boolean;
}

export default function RevenueTable({ sections, onUpdate, readOnly }: RevenueTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Grid Header */}
      <div className="flex bg-gray-100/80 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        <div className="flex-1 py-3 px-6">รายการ (Description)</div>
        <div className="w-64 py-3 px-4 text-right border-l border-gray-200">จำนวนเงิน (Amount)</div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-100">
        {sections.map((section) => (
          <React.Fragment key={section.section_id}>
            {/* Main Section Header */}
            <RevenueRow label={section.section_name} type="header" indentLevel={0} />

            {section.items.map((item) => {
              // --- Logic เดิมในการจัด Type และ Indent ---
              let type: any = 'input';
              let indent = 1;

              if (item.item_name.match(/^\d+\.\d+/)) { type = 'sub-header'; indent = 1; } 
              else if (item.item_name.startsWith("(")) { type = 'readonly'; indent = 2; }
              else if (item.item_name.includes("ภาคเรียนที่")) { type = 'input'; indent = 2; }
              else if (item.item_name.includes("35%") || item.item_name.includes("คงเหลือ") || item.item_name.includes("รายรับก่อนหัก")) {
                 type = item.item_name.includes("35%") ? 'deduction' : 'summary';
                 indent = 2;
              } else { indent = 1; }

              const isItemReadOnly = readOnly || type === 'summary' || type === 'deduction' || type === 'sub-header' || type === 'readonly';

              return (
                <RevenueRow
                  key={item.item_id}
                  label={item.item_name}
                  amount={type === 'sub-header' || type === 'readonly' ? undefined : item.amount}
                  type={type}
                  indentLevel={indent}
                  onChange={(val) => onUpdate(item.item_id, val)}
                  readOnly={isItemReadOnly}
                />
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}