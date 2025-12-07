"use client";

import { useState, useEffect, useMemo } from "react";
import Sidebar from "@/components/shared/Sidebar"; // ปรับ path ตามจริง
import YearDropdown from "@/components/shared/year"; // ปรับ path ตามจริง
import { Loader2, Save, RotateCcw } from "lucide-react";
import { getExpenseData, saveExpenseItems, type ExpenseRow } from "./actions";

export default function ExpensePage() {
  const [year, setYear] = useState(2569);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Data State
  const [budgetId, setBudgetId] = useState<number | null>(null);
  const [rows, setRows] = useState<ExpenseRow[]>([]);
  const [originalRows, setOriginalRows] = useState<ExpenseRow[]>([]);

  // Fetch Data เมื่อปีเปลี่ยน
  useEffect(() => {
    loadData();
  }, [year]);

  async function loadData() {
    setLoading(true);
    try {
      const data = await getExpenseData(year);
      setBudgetId(data.budget_id);
      setRows(data.rows);
      setOriginalRows(JSON.parse(JSON.stringify(data.rows))); // เก็บค่าตั้งต้นไว้เทียบ
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // --- Logic คำนวณ Real-time (หัวใจสำคัญ) ---
  const calculatedRows = useMemo(() => {
    // Clone rows เพื่อไม่ให้กระทบ state หลักโดยตรงระหว่างคำนวณ
    const map = new Map<number, ExpenseRow & { gov_sum: number; income_sum: number }>();
    
    // Init: ใส่ค่า user input ลงไปก่อน
    rows.forEach(r => {
      map.set(r.structure_id, { 
        ...r, 
        gov_sum: r.is_header ? 0 : r.gov_amount, 
        income_sum: r.is_header ? 0 : r.income_amount 
      });
    });

    // Loop: บวกจาก Level ลึกสุด ขึ้นมาหา Level 0
    const maxLevel = Math.max(...rows.map(r => r.level));
    for (let l = maxLevel; l >= 0; l--) {
      const currentLevelRows = rows.filter(r => r.level === l);
      currentLevelRows.forEach(row => {
        if (row.parent_id) {
          const parent = map.get(row.parent_id);
          const current = map.get(row.structure_id);
          if (parent && current) {
            parent.gov_sum += current.gov_sum;
            parent.income_sum += current.income_sum;
          }
        }
      });
    }
    // Return เป็น Array เรียงตามลำดับเดิม
    return rows.map(r => map.get(r.structure_id)!);
  }, [rows]);

  // Handle Input Change
  const handleInputChange = (id: number, field: 'gov_amount' | 'income_amount', value: string) => {
    const numValue = parseFloat(value) || 0;
    setRows(prev => prev.map(row => 
      row.structure_id === id ? { ...row, [field]: numValue } : row
    ));
  };

  // Save Function
  const handleSave = async () => {
    if (!budgetId) return;
    setSaving(true);
    
    // ส่งเฉพาะรายการที่เป็น Leaf Node (ตัวที่กรอกได้) ไปบันทึก
    const itemsToSave = rows
      .filter(r => !r.is_header) 
      .map(r => ({
        structure_id: r.structure_id,
        gov: r.gov_amount,
        income: r.income_amount
      }));

    await saveExpenseItems(budgetId, itemsToSave);
    await loadData(); // Reload เพื่อ update state ให้ sync กับ DB
    setSaving(false);
  };

  // ตรวจสอบว่ามีการแก้ไขหรือไม่ (เพื่อเปิด/ปิดปุ่ม Save)
  const hasChanges = JSON.stringify(rows) !== JSON.stringify(originalRows);
  const totalBudget = calculatedRows.find(r => r.parent_id === null)?.gov_sum || 0;
  const totalIncome = calculatedRows.find(r => r.parent_id === null)?.income_sum || 0;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col">
        
        {/* Header */}
        <div className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">ประมาณการรายจ่าย (F5)</h1>
            <p className="text-gray-500 text-sm">ปีงบประมาณ {year}</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right text-sm mr-4">
                <div className="text-gray-500">ยอดรวมทั้งสิ้น</div>
                <div className="font-bold text-blue-600 text-lg">{(totalBudget + totalIncome).toLocaleString()} บาท</div>
             </div>
             <YearDropdown selectedYear={year} onChange={setYear} />
             {hasChanges && (
                <button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  {saving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
                  บันทึก
                </button>
             )}
          </div>
        </div>

        {/* Table Area */}
        <div className="flex-1 p-8 overflow-auto">
          {loading ? (
             <div className="flex justify-center items-center h-full text-gray-400">
               <Loader2 className="animate-spin w-8 h-8" />
             </div>
          ) : (
            <div className="bg-white rounded-xl shadow border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 text-gray-600 font-medium border-b">
                  <tr>
                    <th className="py-3 px-4 w-24 text-center">รหัส</th>
                    <th className="py-3 px-4">รายการ</th>
                    <th className="py-3 px-4 w-40 text-right">เงินงบประมาณ</th>
                    <th className="py-3 px-4 w-40 text-right">เงินรายได้</th>
                    <th className="py-3 px-4 w-40 text-right bg-gray-50">รวม</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {calculatedRows.map((row) => (
                    <tr key={row.structure_id} className={`hover:bg-blue-50/50 transition-colors ${row.is_header ? 'bg-gray-50/30' : ''}`}>
                      <td className="py-2 px-4 text-center text-gray-400 font-mono text-xs">{row.code}</td>
                      <td className="py-2 px-4">
                        <div style={{ paddingLeft: `${row.level * 24}px` }} 
                             className={`${row.is_header ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                          {row.name}
                        </div>
                      </td>
                      <td className="py-2 px-4 text-right">
                        {row.is_header ? (
                          <span className="text-gray-400 font-medium">{row.gov_sum > 0 ? row.gov_sum.toLocaleString() : '-'}</span>
                        ) : (
                          <input 
                            type="number" 
                            className="w-full text-right border-gray-200 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            value={row.gov_amount || ''}
                            onChange={e => handleInputChange(row.structure_id, 'gov_amount', e.target.value)}
                            placeholder="-"
                          />
                        )}
                      </td>
                      <td className="py-2 px-4 text-right">
                        {row.is_header ? (
                          <span className="text-gray-400 font-medium">{row.income_sum > 0 ? row.income_sum.toLocaleString() : '-'}</span>
                        ) : (
                          <input 
                            type="number" 
                            className="w-full text-right border-gray-200 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            value={row.income_amount || ''}
                            onChange={e => handleInputChange(row.structure_id, 'income_amount', e.target.value)}
                            placeholder="-"
                          />
                        )}
                      </td>
                      <td className="py-2 px-4 text-right font-medium text-gray-700 bg-gray-50/30">
                        {(row.gov_sum + row.income_sum).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}