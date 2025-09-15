"use client";

import Sidebar from "@/components/shared/Sidebar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function Dashboard() {
  // ข้อมูลสรุปรายรับ/รายจ่าย
  const summaryData = [
    { name: "รายรับจริง", value: 42097559.55 },
    { name: "รายจ่ายจริง", value: 26860000.09 },
    { name: "คงเหลือจริง", value: 15237559.46 },
  ];

  // ข้อมูลเปรียบเทียบแผนกับจริง
  const planVsActual = [
    {
      name: "รายรับ",
      แผน: 54091300,
      จริง: 42097559.55,
    },
    {
      name: "รายจ่าย",
      แผน: 44354900,
      จริง: 26860000.09,
    },
  ];

  // ข้อมูลรายเดือน (mock จากรูป)
  const monthlyData = [
    { เดือน: "ต.ค.", รายรับ: 8106843.89, รายจ่าย: 5248180.98 },
    { เดือน: "พ.ย.", รายรับ: 9106843.39, รายจ่าย: 5248180.98 },
    { เดือน: "ธ.ค.", รายรับ: 14893442.97, รายจ่าย: 8214427.92 },
    { เดือน: "ม.ค.", รายรับ: 23767454.53, รายจ่าย: 10595855.06 },
    { เดือน: "ก.พ.", รายรับ: 27728995.28, รายจ่าย: 13050585.85 },
    { เดือน: "มี.ค.", รายรับ: 32114161.61, รายจ่าย: 16175649.64 },
    { เดือน: "เม.ย.", รายรับ: 32817104.78, รายจ่าย: 18926377.6 },
    { เดือน: "พ.ค.", รายรับ: 33562425.1, รายจ่าย: 22025330.94 },
    { เดือน: "มิ.ย.", รายรับ: 38114161.61, รายจ่าย: 24176043.29 },
    { เดือน: "ก.ค.", รายรับ: 42097559.55, รายจ่าย: 26860000.09 },
  ];

  // สีของ Pie Chart
  const COLORS = ["#0088FE", "#FF8042", "#00C49F"];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 ml-64 p-6 space-y-8">
        <h1 className="text-2xl font-bold">📊 Dashboard รายรับ - รายจ่าย ปี 2568</h1>

        {/* กราฟเปรียบเทียบรายรับ/รายจ่าย แผน vs จริง */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-lg font-semibold mb-4">รายรับ/รายจ่าย: แผน vs จริง</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={planVsActual}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="แผน" fill="#FF6B6B" />
              <Bar dataKey="จริง" fill="#4ECDC4" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* กราฟรายเดือน */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-lg font-semibold mb-4">แนวโน้มรายเดือน</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="เดือน" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="รายรับ" stroke="#36A2EB" />
              <Line type="monotone" dataKey="รายจ่าย" stroke="#FF6384" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* กราฟสรุป Pie */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-lg font-semibold mb-4">สรุปสัดส่วนการใช้จ่าย</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={summaryData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {summaryData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </main>
    </div>
  );
}
