// prisma/data/expenseItems.ts

// กำหนด Type ให้ชัดเจน (Optional แต่ดีต่อใจ)
type ExpenseItemSeed = {
  catCode: string;
  code: string;
  name: string;
  formType: string;
};

export const expenseItemsData: ExpenseItemSeed[] = [
  // --- 51000 งบบุคลากร ---
  { 
    catCode: '51000', 
    code: '5101010017', 
    name: 'ค่าจ้างลูกจ้างสัญญาจ้างพนักงาน (งบประมาณเงินรายได้)', 
    formType: 'salary' 
  },
  { 
    catCode: '51000', 
    code: '5101010038', 
    name: 'ค่าจ้างพนักงานสถาบันประเภทพิเศษ', 
    formType: 'salary' 
  },
  { 
    catCode: '51000', 
    code: '5101010000', 
    name: 'เงินเดือนและค่าจ้าง (ยอดรวม)', 
    formType: 'simple'
  },

  // --- 52000 งบดำเนินงาน ---
  { 
    catCode: '52000', 
    code: '5101010010', 
    name: 'ค่าล่วงเวลา', 
    formType: 'simple' 
  },
  { 
    catCode: '52000', 
    code: '5104030201', 
    name: 'ค่าเบี้ยประชุม', 
    formType: 'simple' 
  },
  // ... (ใส่รายการอีก 100 บรรทัดได้เต็มที่ โดยไม่รกไฟล์หลัก) ...
  {
      catCode: '52000',
      code: '5104010203',
      name: 'ค่าจ้างเหมาบริการ',
      formType: 'simple'
  }
];