"use client";

import Sidebar from "@/components/shared/Sidebar";
import { useState, useEffect } from "react";
import {
  PieChart, Pie, Cell, Tooltip,
  CartesianGrid, XAxis, YAxis, ResponsiveContainer,
  BarChart, Bar, ComposedChart, Area, Legend
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign, FileText } from "lucide-react";
import mockBudgetData from "@/data/mockBudgetData.json";

/* 🔹 Summary Card (UI แบบใหม่) */
function SummaryCard({ title, value, color, bgColor, icon: Icon }: any) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-start justify-between transition hover:shadow-lg">
      {/* Icon + Title */}
      <div className={`p-3 rounded-xl ${bgColor} mb-3`}>
        <Icon className={color} size={22} />
      </div>

      {/* Text */}
      <p className="text-gray-500 text-sm mb-1">{title}</p>
      <p className={`text-2xl font-bold ${color}`}>
        ฿{value.toLocaleString()}
      </p>
    </div>
  );
}


/* 🔹 Legend Item (ใช้ด้านข้าง Pie Chart) */
function LegendItem({ color, label, percent, value }: any) {
  return (
    <div className="flex items-center justify-between p-2">
      <div className="flex items-center gap-2">
        <span className={`w-3 h-3 rounded-full ${color}`}></span>
        <span className="text-gray-700 text-sm">{label}</span>
      </div>
      <div className="text-right text-sm">
        <span className="font-semibold text-gray-800 ml-1">{percent}%</span>
      </div>
    </div>
  );
}

/* 🔹 Status Badge */
function StatusBadge({ status }: any) {
  const style: Record<string, string> = {
    "ดำเนินการอยู่": "bg-blue-100 text-blue-700 border-blue-200",
    "เสร็จสิ้น": "bg-green-100 text-green-700 border-green-200",
    "รอเบิก": "bg-yellow-100 text-yellow-700 border-yellow-200",
  };
  return (
    <span className={`px-3 py-1 text-xs font-semibold border rounded-full ${style[status] || "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
}

export default function Dashboard() {
  const years = Object.keys(mockBudgetData);
  const [selectedYear, setSelectedYear] = useState(years[0]);
  const [data, setData] = useState(mockBudgetData[selectedYear]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => setData(mockBudgetData[selectedYear]), [selectedYear]);
  const { summary, monthlySpending, projects } = data;

  const filteredProjects = projects.filter((p: any) => {
    const t = searchTerm.toLowerCase();
    return p.name.toLowerCase().includes(t) || p.department.toLowerCase().includes(t);
  });

  const COLORS = ["#EF4444", "#FACC15", "#22C55E"];
  const pieData = [
    { name: "รายจ่ายจริง", value: summary.spent },
    { name: "งบรอเบิก", value: summary.pending },
    { name: "งบคงเหลือ", value: summary.remaining },
  ];

  const percentSpent = ((summary.spent / summary.total) * 100).toFixed(1);
  const percentPending = ((summary.pending / summary.total) * 100).toFixed(1);
  const percentRemaining = ((summary.remaining / summary.total) * 100).toFixed(1);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Card (รวม Top Bar + Faculty Header) */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
            {/* 🔹 Top Bar */}
            <div className="bg-gradient-to-r from-blue-800 to-blue-900 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-white">ระบบสนับสนุนการจัดทำงบประมาณคณะเทคโนโลยีสารสนเทศ</h1>
                  </div>
                </div>

                <select
                  className="px-4 py-2.5 bg-white border-2 border-blue-500 text-blue-700 font-medium rounded-lg shadow-sm hover:bg-blue-50 transition"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      ปีงบประมาณ {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 🔹 Faculty Header Section */}
            <div className="bg-gradient-to-r from-blue-800 to-blue-900 px-8 py-6 border-b-4 border-orange-400 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">ติดตามการใช้จ่ายงบประมาณ </h2>
                <h1 className="text-blue-200 text-xl mt-1">ประจำปีงบประมาณ {selectedYear}</h1>
              </div>

              <div className="text-right">
                <p className="text-blue-100 text-sm">งบประมาณทั้งหมด</p>
                <p className="text-3xl font-bold text-white mt-1">
                  ฿{summary.total.toLocaleString()}
                </p>
              </div>
            </div>
          </div>


          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-6">
            <SummaryCard title="งบทั้งหมด" value={summary.total} color="text-blue-600" bgColor="bg-blue-100" icon={DollarSign} />
            <SummaryCard title="รายจ่ายจริง" value={summary.spent} color="text-red-600" bgColor="bg-red-100" icon={TrendingDown} />
            <SummaryCard title="งบรอเบิก" value={summary.pending} color="text-yellow-600" bgColor="bg-yellow-100" icon={FileText} />
            <SummaryCard title="งบคงเหลือ" value={summary.remaining} color="text-green-600" bgColor="bg-green-100" icon={TrendingUp} />
          </div>

          {/* Pie Chart + Legend (side-by-side) */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <h2 className="text-xl font-bold mb-6 text-gray-800">สัดส่วนการใช้งบประมาณ</h2>
            <div className="flex justify-center items-center gap-10">
              <ResponsiveContainer width="50%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={120}
                    startAngle={90}
                    endAngle={-270}
                    cornerRadius={8}
                    paddingAngle={3}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => `฿${v.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>

              {/* Legend ด้านข้าง */}
              <div className="flex flex-col space-y-3">
                <LegendItem color="bg-red-500" label="รายจ่ายจริง" percent={percentSpent} value={summary.spent} />
                <LegendItem color="bg-yellow-400" label="งบรอเบิก" percent={percentPending} value={summary.pending} />
                <LegendItem color="bg-green-500" label="งบคงเหลือ" percent={percentRemaining} value={summary.remaining} />
              </div>
            </div>
          </div>

          {/* Dual Chart Section */}
          <div className="grid grid-cols-2 gap-6">
            {/* Line/Area Chart */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <h2 className="text-lg font-bold mb-4 text-gray-800">แนวโน้มรายรับ - รายจ่าย (รายเดือน)</h2>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={monthlySpending}>
                  <defs>
                    <linearGradient id="incomeColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(v) => `฿${(v / 1000000).toFixed(0)}M`} />
                  <Tooltip formatter={(v: number, n) => [`฿${v.toLocaleString()}`, n === "income" ? "รายรับ" : "รายจ่าย"]} />
                  <Area type="monotone" dataKey="income" stroke="#3B82F6" fill="url(#incomeColor)" strokeWidth={3} />
                  <Area type="monotone" dataKey="expense" stroke="#EF4444" fill="url(#expenseColor)" strokeWidth={3} />
                  <Legend />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Stacked Bar */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <h2 className="text-lg font-bold mb-4 text-gray-800">
                รายรับ - รายจ่าย (Stacked)
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlySpending} barGap={0} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(v) => `฿${(v / 1000000).toFixed(0)}M`} />
                  <Tooltip formatter={(v: number, n) => [`฿${v.toLocaleString()}`, n === "income" ? "income" : "expense"]} />
                  <Legend />
                  <Bar dataKey="expense" stackId="a" fill="#EF4444" />
                  <Bar dataKey="income" stackId="a" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

          </div>

          {/* Project Table + Search */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-800">รายการโครงการ / งบรายจ่ายต่าง ๆ</h2>
                <p className="text-gray-500 text-sm">ติดตามความคืบหน้าของโครงการทั้งหมด</p>
              </div>
              <input
                type="text"
                placeholder="🔍 ค้นหาโครงการหรือหน่วยงาน..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-72 focus:ring-2 focus:ring-blue-300"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left">ชื่อโครงการ</th>
                    <th className="px-6 py-3 text-left">หน่วยงาน</th>
                    <th className="px-6 py-3 text-right">งบที่ได้รับ</th>
                    <th className="px-6 py-3 text-right">ใช้ไปแล้ว</th>
                    <th className="px-6 py-3 text-right">คงเหลือ</th>
                    <th className="px-6 py-3 text-center">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProjects.length > 0 ? (
                    filteredProjects.map((p: any, i: number) => {
                      const usage = ((p.used / p.budget) * 100).toFixed(0);
                      return (
                        <tr key={i} className="hover:bg-blue-50">
                          <td className="px-6 py-4">
                            <div className="font-medium">{p.name}</div>
                            <div className="mt-1 bg-gray-200 rounded-full h-1.5">
                              <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${usage}%` }}></div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{usage}% ใช้ไปแล้ว</div>
                          </td>
                          <td className="px-6 py-4">{p.department}</td>
                          <td className="px-6 py-4 text-right text-blue-600 font-semibold">฿{p.budget.toLocaleString()}</td>
                          <td className="px-6 py-4 text-right text-red-600 font-semibold">฿{p.used.toLocaleString()}</td>
                          <td className="px-6 py-4 text-right text-green-600 font-semibold">฿{p.remaining.toLocaleString()}</td>
                          <td className="px-6 py-4 text-center"><StatusBadge status={p.status} /></td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr><td colSpan={6} className="text-center py-6 text-gray-500">ไม่พบโครงการที่ตรงกับคำค้นหา</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
