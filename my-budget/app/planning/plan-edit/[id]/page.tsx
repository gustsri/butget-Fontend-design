"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/shared/Sidebar";
import { 
    ArrowLeft, 
    Save, 
    Plus, 
    Trash2,
    Calculator,
    FileText,
    AlertCircle
} from 'lucide-react';

// Mock data for plan editing
const mockPlanData = {
    id: 1,
    title: "แผนจัดทำรายจ่ายปีงบประมาณ 1/2567",
    year: "2567",
    quarter: 1,
    totalBudget: 5000000,
    income: [
        { id: 1, category: "รายได้จากการขาย", amount: 3000000, percentage: 60 },
        { id: 2, category: "รายได้จากการบริการ", amount: 1500000, percentage: 30 },
        { id: 3, category: "รายได้อื่นๆ", amount: 500000, percentage: 10 }
    ],
    expenses: [
        { id: 1, category: "ค่าใช้จ่ายด้านบุคลากร", amount: 2000000, percentage: 40 },
        { id: 2, category: "ค่าใช้จ่ายด้านดำเนินการ", amount: 1800000, percentage: 36 },
        { id: 3, category: "ค่าใช้จ่ายด้านการตลาด", amount: 800000, percentage: 16 },
        { id: 4, category: "ค่าใช้จ่ายอื่นๆ", amount: 400000, percentage: 8 }
    ]
};

interface BudgetItem {
    id: number;
    category: string;
    amount: number;
    percentage: number;
}

export default function PlanEditPage() {
    const router = useRouter();
    const params = useParams();
    
    const [planData, setPlanData] = useState(mockPlanData);
    const [income, setIncome] = useState<BudgetItem[]>(mockPlanData.income);
    const [expenses, setExpenses] = useState<BudgetItem[]>(mockPlanData.expenses);
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<{[key: string]: string}>({});

    const formatBudget = (amount: number) => {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const calculateTotal = (items: BudgetItem[]) => {
        return items.reduce((sum, item) => sum + item.amount, 0);
    };

    const calculatePercentage = (amount: number, total: number) => {
        return total > 0 ? Math.round((amount / total) * 100) : 0;
    };

    const updateItem = (
        items: BudgetItem[], 
        setItems: (items: BudgetItem[]) => void,
        id: number, 
        field: 'category' | 'amount', 
        value: string | number
    ) => {
        const updatedItems = items.map(item => {
            if (item.id === id) {
                const updatedItem = { ...item, [field]: value };
                if (field === 'amount') {
                    const total = calculateTotal(items.map(i => i.id === id ? updatedItem : i));
                    updatedItem.percentage = calculatePercentage(Number(value), total);
                }
                return updatedItem;
            }
            return item;
        });

        // Recalculate all percentages
        const total = calculateTotal(updatedItems);
        const finalItems = updatedItems.map(item => ({
            ...item,
            percentage: calculatePercentage(item.amount, total)
        }));

        setItems(finalItems);
    };

    const addItem = (items: BudgetItem[], setItems: (items: BudgetItem[]) => void) => {
        const newId = Math.max(...items.map(item => item.id)) + 1;
        const newItem: BudgetItem = {
            id: newId,
            category: "",
            amount: 0,
            percentage: 0
        };
        setItems([...items, newItem]);
    };

    const removeItem = (items: BudgetItem[], setItems: (items: BudgetItem[]) => void, id: number) => {
        const filteredItems = items.filter(item => item.id !== id);
        const total = calculateTotal(filteredItems);
        const updatedItems = filteredItems.map(item => ({
            ...item,
            percentage: calculatePercentage(item.amount, total)
        }));
        setItems(updatedItems);
    };

    const validateData = () => {
        const newErrors: {[key: string]: string} = {};
        
        // Validate income
        income.forEach((item, index) => {
            if (!item.category.trim()) {
                newErrors[`income-category-${index}`] = 'กรุณาระบุหมวดหมู่รายรับ';
            }
            if (item.amount <= 0) {
                newErrors[`income-amount-${index}`] = 'จำนวนเงินต้องมากกว่า 0';
            }
        });

        // Validate expenses
        expenses.forEach((item, index) => {
            if (!item.category.trim()) {
                newErrors[`expenses-category-${index}`] = 'กรุณาระบุหมวดหมู่รายจ่าย';
            }
            if (item.amount <= 0) {
                newErrors[`expenses-amount-${index}`] = 'จำนวนเงินต้องมากกว่า 0';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateData()) {
            alert('กรุณาตรวจสอบข้อมูลให้ครบถ้วนและถูกต้อง');
            return;
        }

        setIsSaving(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            alert('บันทึกการปรับแผนเรียบร้อยแล้ว');
            router.push(`/approval/${params.id}`);
        } catch (error) {
            alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
        } finally {
            setIsSaving(false);
        }
    };

    const totalIncome = calculateTotal(income);
    const totalExpenses = calculateTotal(expenses);
    const netAmount = totalIncome - totalExpenses;

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />

            <main className="flex-1 ml-64 p-6">
                <div className="max-w-6xl mx-auto">
                    {/* Back Button */}
                    <button
                        onClick={() => router.back()}
                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>กลับไปหน้ารายละเอียด</span>
                    </button>

                    {/* Header */}
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6">
                            <div className="flex items-center space-x-3">
                                <FileText className="w-8 h-8" />
                                <div>
                                    <h1 className="text-2xl font-bold">ปรับแผนงบประมาณ</h1>
                                    <p className="text-orange-100">{planData.title}</p>
                                </div>
                            </div>
                        </div>

                        {/* Summary Cards */}
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                    <div className="text-green-800">
                                        <p className="text-sm font-medium">รายรับรวม</p>
                                        <p className="text-2xl font-bold">{formatBudget(totalIncome)}</p>
                                    </div>
                                </div>
                                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                                    <div className="text-red-800">
                                        <p className="text-sm font-medium">รายจ่ายรวม</p>
                                        <p className="text-2xl font-bold">{formatBudget(totalExpenses)}</p>
                                    </div>
                                </div>
                                <div className={`rounded-lg p-4 border ${netAmount >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-yellow-50 border-yellow-200'}`}>
                                    <div className={netAmount >= 0 ? 'text-blue-800' : 'text-yellow-800'}>
                                        <p className="text-sm font-medium">ยอดสุทธิ</p>
                                        <p className="text-2xl font-bold">{formatBudget(netAmount)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Income Section */}
                    <div className="bg-white rounded-lg shadow-lg mb-6">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-900">รายรับ</h2>
                                <button
                                    onClick={() => addItem(income, setIncome)}
                                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>เพิ่มรายการ</span>
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {income.map((item, index) => (
                                    <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                value={item.category}
                                                onChange={(e) => updateItem(income, setIncome, item.id, 'category', e.target.value)}
                                                placeholder="หมวดหมู่รายรับ"
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                                                    errors[`income-category-${index}`] ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                            />
                                            {errors[`income-category-${index}`] && (
                                                <p className="text-red-500 text-sm mt-1">{errors[`income-category-${index}`]}</p>
                                            )}
                                        </div>
                                        <div className="w-40">
                                            <input
                                                type="number"
                                                value={item.amount}
                                                onChange={(e) => updateItem(income, setIncome, item.id, 'amount', Number(e.target.value))}
                                                placeholder="จำนวนเงิน"
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                                                    errors[`income-amount-${index}`] ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                            />
                                            {errors[`income-amount-${index}`] && (
                                                <p className="text-red-500 text-sm mt-1">{errors[`income-amount-${index}`]}</p>
                                            )}
                                        </div>
                                        <div className="w-20 text-center">
                                            <span className="text-sm font-medium text-gray-600">{item.percentage}%</span>
                                        </div>
                                        {income.length > 1 && (
                                            <button
                                                onClick={() => removeItem(income, setIncome, item.id)}
                                                className="text-red-600 hover:text-red-800 p-2"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Expenses Section */}
                    <div className="bg-white rounded-lg shadow-lg mb-6">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-900">รายจ่าย</h2>
                                <button
                                    onClick={() => addItem(expenses, setExpenses)}
                                    className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>เพิ่มรายการ</span>
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {expenses.map((item, index) => (
                                    <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                value={item.category}
                                                onChange={(e) => updateItem(expenses, setExpenses, item.id, 'category', e.target.value)}
                                                placeholder="หมวดหมู่รายจ่าย"
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                                                    errors[`expenses-category-${index}`] ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                            />
                                            {errors[`expenses-category-${index}`] && (
                                                <p className="text-red-500 text-sm mt-1">{errors[`expenses-category-${index}`]}</p>
                                            )}
                                        </div>
                                        <div className="w-40">
                                            <input
                                                type="number"
                                                value={item.amount}
                                                onChange={(e) => updateItem(expenses, setExpenses, item.id, 'amount', Number(e.target.value))}
                                                placeholder="จำนวนเงิน"
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                                                    errors[`expenses-amount-${index}`] ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                            />
                                            {errors[`expenses-amount-${index}`] && (
                                                <p className="text-red-500 text-sm mt-1">{errors[`expenses-amount-${index}`]}</p>
                                            )}
                                        </div>
                                        <div className="w-20 text-center">
                                            <span className="text-sm font-medium text-gray-600">{item.percentage}%</span>
                                        </div>
                                        {expenses.length > 1 && (
                                            <button
                                                onClick={() => removeItem(expenses, setExpenses, item.id)}
                                                className="text-red-600 hover:text-red-800 p-2"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Warning for negative balance */}
                    {netAmount < 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                            <div className="flex items-start space-x-3">
                                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="text-yellow-800 font-medium">คำเตือน</h3>
                                    <p className="text-yellow-700 text-sm mt-1">
                                        รายจ่ายมากกว่ารายรับ กรุณาตรวจสอบและปรับแผนงบประมาณให้เหมาะสม
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex flex-col sm:flex-row gap-4 justify-end">
                            <button
                                onClick={() => router.back()}
                                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                            >
                                <Save className="w-5 h-5" />
                                <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึกการปรับแผน'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}