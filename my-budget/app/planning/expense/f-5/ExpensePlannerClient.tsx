'use client'

import React from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { 
    ArrowLeft, Wallet, TrendingUp, TrendingDown, 
    Layout, Calendar, Save, Send, Loader2, FileText, FolderTree
} from 'lucide-react'
import F5TableView from './F5TableView'
import DashboardView from './DashboardView'
import YearDropdown from '@/components/shared/year'

type Props = {
  currentYear: number
  hierarchy: any[]
  detailData: any | null
}

export default function ExpensePlannerClient({ currentYear, hierarchy, detailData }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // 1. คำนวณยอดรวม (แก้ไขสูตรตาม Requirement)
  const totalGov = detailData?.groupedData?.reduce((sum: number, group: any) => {
      return sum + group.tree.reduce((s: number, node: any) => s + node.amountGov, 0)
  }, 0) || 0

  const totalIncome = detailData?.groupedData?.reduce((sum: number, group: any) => {
      return sum + group.tree.reduce((s: number, node: any) => s + node.amountIncome, 0)
  }, 0) || 0

  // ✅ แก้ไข: วงเงินงบประมาณรวม = เงินรายได้ (Income) เท่านั้น
  const totalBudget = totalIncome 

  const [isSaving, setIsSaving] = React.useState(false)
  const status = detailData?.status || 'draft' 

  // ... (Handlers เดิม ไม่ต้องแก้) ...
  const handleYearChange = (yearId: number | null, yearVal: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('year', yearVal.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleBack = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('activityId')
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleSave = async (type: 'draft' | 'submitted') => {
      setIsSaving(true)
      await new Promise(r => setTimeout(r, 1000)) 
      setIsSaving(false)
      alert(`บันทึกสถานะ ${type} เรียบร้อย (Mock)`)
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
       
       {/* 1. HEADER (เหมือนเดิม) */}
       <div className="w-full bg-[#1e293b] shadow-md z-30 relative">
            <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                    <h6 className="text-blue-300 text-xs font-bold tracking-wider uppercase">
                        IT BUDGET PLANNING SYSTEM
                    </h6>
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <Layout className="w-8 h-8 text-blue-400" />
                        ประมาณการรายจ่าย (Expense Forecast)
                    </h1>
                </div>
                <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-4 text-white">
                        <div className="flex items-center gap-2"> 
                            <span className="text-sm text-slate-300 flex items-center gap-1">
                                <Calendar className="w-4 h-4" /> ปีงบประมาณ:
                            </span>
                            <div className="bg-white/10 rounded-lg p-0.5">
                                <YearDropdown 
                                    selectedYear={currentYear}
                                    onYearChange={handleYearChange}
                                    allowCreate={true}
                                />
                            </div>
                        </div>
                    </div>
                    {detailData && (
                        <div className="flex gap-2 w-full md:w-auto justify-end">
                            {status !== 'submitted' ? (
                                <>
                                    <button onClick={() => handleSave('draft')} disabled={isSaving} className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 font-semibold rounded shadow-sm transition-all text-sm h-10 min-w-[100px]">
                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        <span>บันทึกร่าง</span>
                                    </button>
                                    <button onClick={() => handleSave('submitted')} disabled={isSaving} className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shadow-lg transition-all text-sm h-10 min-w-[100px]">
                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                        <span>ยื่นเสนอ</span>
                                    </button>
                                </>
                            ) : (
                                <div className="px-6 py-2 bg-blue-500/20 text-blue-200 border border-blue-500/30 rounded font-medium text-sm flex items-center gap-2">
                                    <FileText className="w-4 h-4" /> ส่งตรวจสอบแล้ว
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
       </div>

      {/* 2. CONTENT AREA */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 space-y-6">
        
        {/* ✅ SUMMARY CARDS: ปรับข้อความให้ชัดเจน */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <StatCard 
                title="วงเงินงบประมาณรวม (Total Budget)" 
                value={totalBudget} // = Income
                icon={<Wallet className="w-6 h-6 text-white" />}
                gradient="bg-gradient-to-br from-orange-500 to-red-500" // สีส้มแดงเพื่อให้รู้ว่าเป็นยอดหลัก (Income)
                shadow="shadow-sm hover:shadow-md"
            />
            <StatCard 
                title="งบประมาณแผ่นดิน (Budget Limit)" 
                value={totalGov} 
                icon={<TrendingUp className="w-6 h-6 text-white" />}
                gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
                shadow="shadow-sm hover:shadow-md"
            />
            <StatCard 
                title="เงินรายได้ (Plan)" 
                value={totalIncome} 
                icon={<TrendingDown className="w-6 h-6 text-white" />}
                gradient="bg-gradient-to-br from-emerald-500 to-teal-600" // สีเขียวเหมือนเดิม
                shadow="shadow-sm hover:shadow-md"
            />
        </div>

        {detailData ? (
          // View A: Detail Table
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
             {/* Navigation */}
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
             </div>

             {/* Table */}
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <F5TableView data={detailData} year={currentYear} />
             </div>
          </div>

        ) : (
          // View B: Hierarchy Selection
          <div className="space-y-4 animate-in fade-in duration-700">
             <div className="flex items-center justify-between px-1 pt-2">
                <h3 className="text-lg font-bold text-gray-700 flex items-center gap-2">
                    <FolderTree className="w-5 h-5 text-gray-400" />
                    โครงสร้างแผนงาน (Project Structure)
                </h3>
                <span className="text-xs text-gray-400 font-medium bg-white px-3 py-1 rounded-full border border-gray-200">
                    เลือกรายการเพื่อระบุงบประมาณ
                </span>
             </div>
             
             <DashboardView hierarchy={hierarchy} currentYear={currentYear} />
          </div>
        )}
      </main>
    </div>
  )
}

// ... StatCard เหมือนเดิม ...
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