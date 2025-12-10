// app/expense/page.tsx
import Link from "next/link";

export default function ExpenseDashboard() {
  return (
    <div className="space-y-8">
      {/* Header ของหน้า */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">จัดการแผนงบประมาณรายจ่าย</h1>
        <p className="text-gray-500 mt-2">
          เลือกรายการแบบฟอร์มที่ต้องการดำเนินการ
        </p>
      </div>

      {/* Grid เมนูเลือก F-Type */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card: F-3 */}
        <Link 
          href="/planning/expense/f-5" 
          className="group block p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-blue-300 transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
              {/* Icon Table */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0 1 12 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 1.5v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M19.125 12h-1.5a.375.375 0 0 1-.375-.375v-.75a.375.375 0 0 1 .375-.375h1.5a.375.375 0 0 1 .375.375v.75a.375.375 0 0 1-.375.375Z" />
              </svg>
            </div>
            <span className="text-gray-400 group-hover:text-blue-600 text-sm">Action</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">จัดสรรงบรายได้ (F-5)</h3>
          <p className="text-gray-500 text-sm mb-4">
            จัดสรรเงินรายได้เข้าสู่โครงการและกิจกรรมต่างๆ ตามแผนงาน
          </p>
          <span className="text-blue-600 text-sm font-medium group-hover:underline">เข้าสู่หน้าทำงาน &rarr;</span>
        </Link>

        {/* Card: F-5 */}
        <Link 
          href="/planning/expense/f-3" 
          className="group block p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-green-300 transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-colors">
              {/* Icon Chart */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
              </svg>
            </div>
            <span className="text-gray-400 group-hover:text-green-600 text-sm">Report</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">สรุปงบประมาณ (F-3)</h3>
          <p className="text-gray-500 text-sm mb-4">
            ดูภาพรวมการประมาณการรายรับและรายจ่ายทั้งหมดประจำปี
          </p>
          <span className="text-green-600 text-sm font-medium group-hover:underline">ดูรายงาน &rarr;</span>
        </Link>

        {/* Card: F-23 */}
        <Link 
          href="/planning/expense/f-23" 
          className="group block p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-purple-300 transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
              {/* Icon List */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 17.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
            </div>
            <span className="text-gray-400 group-hover:text-purple-600 text-sm">Report</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">สรุปรายจ่าย (F-23)</h3>
          <p className="text-gray-500 text-sm mb-4">
            รายละเอียดสรุปหมวดรายจ่ายตามแผนงานและกิจกรรม
          </p>
          <span className="text-purple-600 text-sm font-medium group-hover:underline">ดูรายงาน &rarr;</span>
        </Link>
      </div>
    </div>
  );
}