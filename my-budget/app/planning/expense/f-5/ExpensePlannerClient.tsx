'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { 
    ArrowLeft, Wallet, TrendingUp, TrendingDown, 
    Layout, Calendar, Send, Loader2, FolderTree, CheckCircle2
} from 'lucide-react'
import F5TableView from './F5TableView'
import DashboardView from './DashboardView'
// ต้อง import ให้ถูก path
import ExpenseYearDropdown from '@/components/planning/expense/ExpenseYearDropdown' 
import { 
    getExpenseBudgetSummary, 
    updateExpenseBudgetStatus,
    createBudgetYear 
} from './actions'

type Props = {
    currentYear: number
    hierarchy: any[]
    detailData: any | null
}

export default function ExpensePlannerClient({ currentYear, hierarchy, detailData }: Props) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [summary, setSummary] = useState({ totalBudget: 0, totalIncome: 0, status: 'draft' })
    const [isSaving, setIsSaving] = useState(false)

    // Load Summary (Header)
    useEffect(() => {
        const loadSummary = async () => {
            const res = await getExpenseBudgetSummary(currentYear)
            if (res) {
                setSummary({
                    totalBudget: res.totalBudget,
                    totalIncome: res.totalIncome,
                    status: res.status
                })
            }
        }
        loadSummary()
    }, [currentYear, detailData])

    // ✅ FIX: แก้ Search Params เป็น Null
    const handleYearChange = (yearVal: number) => {
        const currentParams = searchParams ? searchParams.toString() : ""
        const params = new URLSearchParams(currentParams)
        
        if (yearVal) {
            params.set('year', yearVal.toString())
            router.push(`${pathname}?${params.toString()}`)
        }
    }

    const handleCreateYear = async (newYear: number) => {
        try {
            setIsSaving(true)
            const res = await createBudgetYear(newYear)
            
            if (res.success) {
                alert(`สร้างปีงบประมาณ ${newYear} เรียบร้อยแล้ว`)
                handleYearChange(newYear) 
            } else {
                alert('เกิดข้อผิดพลาด: ' + (res.error || 'Unknown error'))
            }
        } catch (error: any) {
            console.error(error)
            alert(`เกิดข้อผิดพลาด: ${error.message || 'Server error'}`)
        } finally {
            setIsSaving(false)
        }
    }

    // ✅ FIX: ฟังก์ชันรับค่า Update Real-time (ต้องมีฟังก์ชันนี้!)
    const handleBudgetUpdate = useCallback((newTotalBudget: number, newTotalIncome: number) => {
        console.log("💰 Parent Received:", newTotalBudget, newTotalIncome)
        setSummary(prev => ({
            ...prev,
            totalBudget: newTotalBudget,
            totalIncome: newTotalIncome
        }))
    }, [])

    const handleBack = () => {
        const currentParams = searchParams ? searchParams.toString() : ""
        const params = new URLSearchParams(currentParams)
        params.delete('activityId')
        router.push(`${pathname}?${params.toString()}`)
    }

    const handleSubmitPlan = async () => {
        if (!confirm('ยืนยันการ "ยื่นเสนอ" แผนงบประมาณ?')) return
        setIsSaving(true)
        try {
            const res = await updateExpenseBudgetStatus(currentYear, 'submitted')
            if (res.success) {
                alert('ยื่นเสนอเรียบร้อยแล้ว')
                setSummary(prev => ({ ...prev, status: 'submitted' }))
                router.refresh()
            }
        } catch (e) {
            alert('Error submitting plan')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
            {/* Header */}
            <div className="w-full bg-[#1e293b] shadow-md z-30 relative">
                <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div className="space-y-2">
                        <h6 className="text-blue-300 text-xs font-bold tracking-wider uppercase">IT BUDGET SYSTEM</h6>
                        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                            <Layout className="w-8 h-8 text-blue-400" />
                            ประมาณการรายจ่าย
                        </h1>
                    </div>

                    <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                        <div className="flex items-center gap-4 text-white">
                            <div className="flex items-center gap-2"> 
                                <span className="text-sm text-slate-300 flex items-center gap-1">
                                    <Calendar className="w-4 h-4" /> ปีงบประมาณ:
                                </span>
                                <div className="bg-white/10 rounded-lg p-0.5">
                                    <ExpenseYearDropdown 
                                        selectedYear={currentYear}
                                        onChange={(y) => handleYearChange(y)}
                                        onCreate={handleCreateYear} 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 w-full md:w-auto justify-end">
                            {summary.status !== 'submitted' ? (
                                <button
                                    onClick={handleSubmitPlan}
                                    disabled={isSaving}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shadow-lg text-sm h-10"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    <span>ยื่นเสนอตรวจสอบ</span>
                                </button>
                            ) : (
                                <div className="px-6 py-2 bg-green-500/20 text-green-100 border border-green-500/30 rounded text-sm flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" /> ส่งตรวจสอบแล้ว
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <StatCard 
                        title="รวมงบประมาณ (Total)" value={summary.totalBudget + summary.totalIncome} 
                        icon={<Wallet className="w-6 h-6 text-white" />} gradient="bg-emerald-500" 
                    />
                    <StatCard 
                        title="งบประมาณแผ่นดิน" value={summary.totalBudget} 
                        icon={<TrendingUp className="w-6 h-6 text-white" />} gradient="bg-blue-500" 
                    />
                    <StatCard 
                        title="เงินรายได้" value={summary.totalIncome} 
                        icon={<TrendingDown className="w-6 h-6 text-white" />} gradient="bg-orange-500" 
                    />
                </div>

                {detailData ? (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <button onClick={handleBack} className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200">
                                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                                </button>
                                <div>
                                    <div className="text-[10px] font-bold text-blue-600 uppercase">Editing Project</div>
                                    <h2 className="text-lg font-bold text-gray-800">{detailData.activity.name}</h2>
                                </div>
                            </div>
                        </div>
                        
                        {/* 🔥🔥🔥 จุดสำคัญที่สุด: ต้องมีบรรทัดนี้ 🔥🔥🔥 */}
                        <F5TableView 
                            data={detailData} 
                            year={currentYear} 
                            onBudgetUpdate={handleBudgetUpdate} 
                        />
                    </div>
                ) : (
                    <div className="space-y-4 animate-in fade-in duration-700">
                        <h3 className="text-lg font-bold text-gray-700 flex items-center gap-2">
                            <FolderTree className="w-5 h-5 text-gray-400" /> โครงสร้างแผนงาน
                        </h3>
                        <DashboardView hierarchy={hierarchy} currentYear={currentYear} />
                    </div>
                )}
            </main>
        </div>
    )
}

function StatCard({ title, value, icon, gradient }: any) {
    return (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500 mb-1">{title}</p>
                <div className="text-2xl font-bold text-gray-800">
                    {value.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </div>
            </div>
            <div className={`p-3 rounded-lg shadow-inner ${gradient}`}>{icon}</div>
        </div>
    )
}