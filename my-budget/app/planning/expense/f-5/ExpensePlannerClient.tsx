'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { 
    ArrowLeft, Wallet, TrendingUp, TrendingDown, 
    Layout, Calendar, Send, Loader2, FileText, FolderTree, CheckCircle2
} from 'lucide-react'
import F5TableView from './F5TableView'
import DashboardView from './DashboardView'
import YearDropdown from '@/components/shared/year'
import { 
    getExpenseBudgetSummary, 
    updateExpenseBudgetStatus,
    createBudgetYear // ✅ Import Action สร้างปี
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

  // ... (useEffect loadSummary เหมือนเดิม) ...
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

  const handleYearChange = (yearId: number | null, yearVal: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('year', yearVal.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  // ✅ เพิ่มฟังก์ชันนี้: เพื่อรับ Event การสร้างปีใหม่จาก Dropdown
  const handleCreateYear = async (newYear: number) => {
    console.log("🟢 Client: กดสร้างปี " + newYear + " แล้ว (ถ้าไม่ขึ้น แสดงว่าปุ่มเสีย)");
      try {
          setIsSaving(true)
          // เรียก Server Action เพื่อสร้างและ Clone ข้อมูล
          const res = await createBudgetYear(newYear)
          
          if (res.success) {
              alert(`สร้างปีงบประมาณ ${newYear} และคัดลอกข้อมูลเรียบร้อยแล้ว`)
              // เปลี่ยนหน้าไปปีใหม่ทันที
              handleYearChange(null, newYear)
          } else {
              alert('เกิดข้อผิดพลาด: ' + (res.error || 'Unknown error'))
          }
      } catch (error) {
          console.error(error)
          alert('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้')
      } finally {
          setIsSaving(false)
      }
  }

  const handleBack = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('activityId')
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleSubmitPlan = async () => {
      // ... (Logic เดิม) ...
      if (!confirm('ยืนยันการ "ยื่นเสนอ" แผนงบประมาณ? ข้อมูลจะไม่สามารถแก้ไขได้หลังจากนี้')) return

      setIsSaving(true)
      try {
          const res = await updateExpenseBudgetStatus(currentYear, 'submitted')
          if (res.success) {
              alert('ยื่นเสนอแผนงบประมาณเรียบร้อยแล้ว')
              setSummary(prev => ({ ...prev, status: 'submitted' }))
              router.refresh()
          } else {
              alert('เกิดข้อผิดพลาด: ' + res.error)
          }
      } catch (e) {
          console.error(e)
          alert('เกิดข้อผิดพลาดในการเชื่อมต่อ')
      } finally {
          setIsSaving(false)
      }
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
       
       {/* HEADER */}
       <div className="w-full bg-[#1e293b] shadow-md z-30 relative">
            <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                
                {/* Title */}
                <div className="space-y-2">
                    <h6 className="text-blue-300 text-xs font-bold tracking-wider uppercase">
                        IT BUDGET PLANNING SYSTEM
                    </h6>
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <Layout className="w-8 h-8 text-blue-400" />
                        ประมาณการรายจ่าย (Expense Forecast)
                    </h1>
                </div>

                {/* Right Controls */}
                <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-4 text-white">
                        <div className="flex items-center gap-2"> 
                            <span className="text-sm text-slate-300 flex items-center gap-1">
                                <Calendar className="w-4 h-4" /> ปีงบประมาณ:
                            </span>
                            <div className="bg-white/10 rounded-lg p-0.5">
                                {/* ✅ ส่ง onCreateYear ไปให้ Dropdown */}
                                <YearDropdown 
                                    selectedYear={currentYear}
                                    onYearChange={handleYearChange}
                                    allowCreate={true}
                                    onCreateYear={handleCreateYear} 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2 w-full md:w-auto justify-end">
                        {summary.status !== 'submitted' ? (
                            <button
                                onClick={handleSubmitPlan}
                                disabled={isSaving}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shadow-lg transition-all text-sm h-10 min-w-[140px]"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                <span>ยื่นเสนอตรวจสอบ</span>
                            </button>
                        ) : (
                            <div className="px-6 py-2 bg-green-500/20 text-green-100 border border-green-500/30 rounded font-medium text-sm flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" /> ส่งตรวจสอบแล้ว
                            </div>
                        )}
                    </div>
                </div>
            </div>
       </div>

      {/* CONTENT AREA */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 space-y-6">
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <StatCard 
                title="วงเงินงบประมาณรวม (Total)" 
                value={summary.totalIncome} 
                icon={<Wallet className="w-6 h-6 text-white" />}
                gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
                shadow="shadow-sm hover:shadow-md"
            />
            <StatCard 
                title="งบประมาณแผ่นดิน (Limit)" 
                value={summary.totalBudget} 
                icon={<TrendingUp className="w-6 h-6 text-white" />}
                gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
                shadow="shadow-sm hover:shadow-md"
            />
            <StatCard 
                title="เงินรายได้ (Plan)" 
                value={summary.totalIncome} 
                icon={<TrendingDown className="w-6 h-6 text-white" />}
                gradient="bg-gradient-to-br from-orange-400 to-red-500"
                shadow="shadow-sm hover:shadow-md"
            />
        </div>

        {/* Content Switcher */}
        {detailData ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
             <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={handleBack}
                        className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors border border-gray-200"
                        title="ย้อนกลับ"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wide mb-0.5">Editing Project</div>
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-mono border border-gray-200">{detailData.activity.code}</span>
                            {detailData.activity.name}
                        </h2>
                    </div>
                </div>
                <div className="text-xs text-gray-400 italic flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> บันทึกข้อมูลอัตโนมัติเมื่อพิมพ์เสร็จ
                </div>
             </div>
             
             <F5TableView data={detailData} year={currentYear} />
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in duration-700">
             <div className="flex items-center justify-between px-1 pt-2">
                <h3 className="text-lg font-bold text-gray-700 flex items-center gap-2">
                    <FolderTree className="w-5 h-5 text-gray-400" />
                    โครงสร้างแผนงาน (Project Structure)
                </h3>
             </div>
             <DashboardView hierarchy={hierarchy} currentYear={currentYear} />
          </div>
        )}
      </main>
    </div>
  )
}

function StatCard({ title, value, icon, gradient, shadow }: any) {
    return (
        <div className={`bg-white p-5 rounded-xl border border-gray-200 ${shadow} flex items-center justify-between transition-all duration-300`}>
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                <div className="text-2xl font-bold text-gray-800 tracking-tight">
                    {value.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    <span className="text-xs font-normal text-gray-400 ml-1.5">บาท</span>
                </div>
            </div>
            <div className={`p-3 rounded-lg shadow-inner ${gradient}`}>
                {icon}
            </div>
        </div>
    )
}