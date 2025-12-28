'use client'

import React from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { 
    ArrowLeft, Wallet, TrendingUp, TrendingDown, 
    Layout, Calendar, Save, Send, Loader2, FileText
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

  // 1. คำนวณยอดรวม (สำหรับ Summary)
  const totalGov = detailData?.groupedData?.reduce((sum: number, group: any) => {
      return sum + group.tree.reduce((s: number, node: any) => s + node.amountGov, 0)
  }, 0) || 0

  const totalIncome = detailData?.groupedData?.reduce((sum: number, group: any) => {
      return sum + group.tree.reduce((s: number, node: any) => s + node.amountIncome, 0)
  }, 0) || 0

  const totalBudget = totalGov + totalIncome

  // 2. Mock State
  const [isSaving, setIsSaving] = React.useState(false)
  const status = detailData?.status || 'draft' 

  // 3. Handlers
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
    <div className="flex flex-col min-h-screen bg-gray-50/30 font-sans text-slate-900 pb-20">
       
       {/* ==================================================================================
           🟢 1. HEADER (Design ตามหน้า Revenue เป๊ะๆ)
       ================================================================================== */}
       <div className="bg-[#1e293b] shadow-lg z-20 relative px-8 py-8 rounded-b-3xl">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
                
                {/* Left: Title */}
                <div className="space-y-3">
                    <div>
                        <h6 className="text-blue-300 text-xs font-bold tracking-wider uppercase mb-1">
                            IT BUDGET PLANNING SYSTEM
                        </h6>
                        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                            <Layout className="w-8 h-8 text-blue-400" />
                            ประมาณการรายจ่าย (Expense Forecast)
                        </h1>
                    </div>
                </div>

                {/* Right: Controls */}
                <div className="flex flex-col items-end gap-4">
                    <div className="flex items-center gap-4 text-white">
                        
                        {/* Year Selector */}
                        <div className="flex items-center gap-2 relative z-50"> 
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

                    {/* Action Buttons (แสดงเฉพาะหน้า Detail) */}
                    {detailData && (
                        <div className="flex gap-2">
                            {status !== 'submitted' ? (
                                <>
                                    <button
                                        onClick={() => handleSave('draft')}
                                        disabled={isSaving}
                                        className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 font-semibold rounded shadow-sm transition-all text-sm h-10"
                                    >
                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        <span>บันทึกร่าง</span>
                                    </button>

                                    <button
                                        onClick={() => handleSave('submitted')}
                                        disabled={isSaving}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shadow-lg transition-all text-sm h-10"
                                    >
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

      {/* ==================================================================================
           🟢 2. CONTENT AREA
       ================================================================================== */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 space-y-8 -mt-8 relative z-10">
        
        {/* CASE A: แสดงหน้ารายละเอียด (Table View) */}
        {detailData ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
             
             {/* 💰 SUMMARY CARDS (วางทับ Header นิดหน่อยเพื่อให้ดูมีมิติ) */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <StatCard 
                    title="วงเงินงบประมาณรวม" 
                    value={totalBudget} 
                    icon={<Wallet className="w-6 h-6 text-white" />}
                    gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
                    shadow="shadow-emerald-100/50"
                />
                <StatCard 
                    title="งบประมาณแผ่นดิน" 
                    value={totalGov} 
                    icon={<TrendingUp className="w-6 h-6 text-white" />}
                    gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
                    shadow="shadow-blue-100/50"
                />
                <StatCard 
                    title="งบประมาณรายได้" 
                    value={totalIncome} 
                    icon={<TrendingDown className="w-6 h-6 text-white" />}
                    gradient="bg-gradient-to-br from-orange-400 to-red-500"
                    shadow="shadow-orange-100/50"
                />
             </div>

             {/* Navigation Bar */}
             <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={handleBack}
                        className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors"
                        title="ย้อนกลับไปหน้าเลือกกิจกรรม"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <div className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-0.5">Project / Activity</div>
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-sm font-mono">{detailData.activity.code}</span>
                            {detailData.activity.name}
                        </h2>
                    </div>
                </div>
             </div>

             {/* Data Table */}
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ring-1 ring-black/5">
                <F5TableView data={detailData} year={currentYear} />
             </div>
          </div>

        ) : (
          // CASE B: แสดงหน้า Dashboard (Hierarchy Selection)
          <div className="space-y-8 animate-in fade-in duration-700 mt-12">
             {/* Hero Section */}
             <div className="bg-white rounded-2xl p-10 border border-gray-100 shadow-xl text-center space-y-4">
                <div className="inline-flex items-center justify-center p-4 bg-blue-50 rounded-full mb-2">
                    <FileText className="w-10 h-10 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 tracking-tight">เลือกรายการเพื่อจัดทำงบประมาณ</h2>
                <p className="text-gray-500 max-w-2xl mx-auto text-lg">
                    กรุณาเลือก <span className="font-semibold text-gray-700">กิจกรรม</span> หรือ <span className="font-semibold text-gray-700">โครงการ</span> จากโครงสร้างด้านล่าง เพื่อเข้าสู่หน้าบันทึกรายละเอียดงบประมาณ
                </p>
             </div>
             
             <DashboardView hierarchy={hierarchy} currentYear={currentYear} />
          </div>
        )}
      </main>
    </div>
  )
}

// --- Sub-Component: Stat Card ---
function StatCard({ title, value, icon, gradient, shadow }: any) {
    return (
        <div className={`bg-white p-5 rounded-xl border border-gray-100 shadow-lg ${shadow} flex items-center justify-between hover:-translate-y-1 transition-transform duration-300`}>
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                <div className="text-2xl font-bold text-gray-800 tracking-tight">
                    {value.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    <span className="text-xs font-normal text-gray-400 ml-1.5">บาท</span>
                </div>
            </div>
            <div className={`p-3.5 rounded-xl shadow-md ${gradient}`}>
                {icon}
            </div>
        </div>
    )
}