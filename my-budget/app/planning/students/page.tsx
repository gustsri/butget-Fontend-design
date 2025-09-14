"use client";
import { useState } from "react";
import Sidebar from "@/components/shared/Sidebar";

export default function Home() {
  const [activeTab, setActiveTab] = useState("year");

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      {/* Main content - เพิ่ม margin-left เท่ากับ width ของ sidebar */}
      <main className="flex-1 ml-64 p-6">
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header Tabs */}
          <div className="flex bg-gray-100 border-b">
            <button
              onClick={() => setActiveTab("year")}
              className={`px-6 py-3 font-medium rounded-tl-lg transition-colors ${
                activeTab === "year"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Year 📅
            </button>
            <button
              onClick={() => setActiveTab("plan")}
              className={`px-6 py-3 font-medium border-x border-gray-300 transition-colors ${
                activeTab === "plan"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              แผน
            </button>
            <button
              onClick={() => setActiveTab("real")}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === "real"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              จริง
            </button>
          </div>

          {/* Main Content */}
          <div className="p-6">
            {/* Section 1: ปริมาดเสีย */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  ปริมาดเสีย
                </h2>
                <button className="ml-2 text-gray-400 hover:text-gray-600 transition-colors">
                  📋
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="text-sm text-gray-600 border-b border-gray-200">
                      <th className="text-left pb-3 px-2 w-48">
                        วท.บ. (เทคโนโลยีสารสนเทศ)
                      </th>
                      <th className="text-center pb-3 px-2 w-20">บีที 1</th>
                      <th className="text-center pb-3 px-2 w-20">บีที 2</th>
                      <th className="text-center pb-3 px-2 w-20">บีที 3</th>
                      <th className="text-center pb-3 px-2 w-20">บีที 4</th>
                      <th className="text-center pb-3 px-2 w-20">บีที 5</th>
                      <th className="text-center pb-3 px-2 w-20">บีที 6</th>
                      <th className="text-center pb-3 px-2 w-20">รวม</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-2">
                        <div className="bg-blue-500 text-white px-4 py-2 rounded text-center font-medium shadow-sm">
                          แผน
                        </div>
                      </td>
                      <td className="px-2">
                        <div className="bg-gray-50 border border-gray-300 px-3 py-2 rounded text-center hover:bg-gray-100 transition-colors">
                          210
                        </div>
                      </td>
                      <td className="px-2">
                        <div className="bg-gray-50 border border-gray-300 px-3 py-2 rounded text-center hover:bg-gray-100 transition-colors">
                          222
                        </div>
                      </td>
                      <td className="px-2">
                        <div className="bg-gray-50 border border-gray-300 px-3 py-2 rounded text-center hover:bg-gray-100 transition-colors">
                          172
                        </div>
                      </td>
                      <td className="px-2">
                        <div className="bg-gray-50 border border-gray-300 px-3 py-2 rounded text-center hover:bg-gray-100 transition-colors">
                          160
                        </div>
                      </td>
                      <td className="px-2">
                        <div className="bg-gray-50 border border-gray-300 px-3 py-2 rounded text-center hover:bg-gray-100 transition-colors">
                          29
                        </div>
                      </td>
                      <td className="px-2">
                        <div className="bg-gray-50 border border-gray-300 px-3 py-2 rounded text-center hover:bg-gray-100 transition-colors">
                          0
                        </div>
                      </td>
                      <td className="px-2">
                        <div className="bg-blue-100 border border-blue-300 px-3 py-2 rounded text-center font-semibold text-blue-800">
                          764
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-2">
                        <div className="bg-blue-400 text-white px-4 py-2 rounded text-center font-medium shadow-sm">
                          จริง
                        </div>
                      </td>
                      <td className="px-2">
                        <div className="bg-gray-50 border border-gray-300 px-3 py-2 rounded text-center hover:bg-gray-100 transition-colors">
                          209
                        </div>
                      </td>
                      <td className="px-2">
                        <div className="bg-gray-50 border border-gray-300 px-3 py-2 rounded text-center hover:bg-gray-100 transition-colors">
                          192
                        </div>
                      </td>
                      <td className="px-2">
                        <div className="bg-gray-50 border border-gray-300 px-3 py-2 rounded text-center hover:bg-gray-100 transition-colors">
                          162
                        </div>
                      </td>
                      <td className="px-2">
                        <div className="bg-gray-50 border border-gray-300 px-3 py-2 rounded text-center hover:bg-gray-100 transition-colors">
                          159
                        </div>
                      </td>
                      <td className="px-2">
                        <div className="bg-gray-50 border border-gray-300 px-3 py-2 rounded text-center hover:bg-gray-100 transition-colors">
                          29
                        </div>
                      </td>
                      <td className="px-2">
                        <div className="bg-gray-50 border border-gray-300 px-3 py-2 rounded text-center hover:bg-gray-100 transition-colors">
                          0
                        </div>
                      </td>
                      <td className="px-2">
                        <div className="bg-blue-100 border border-blue-300 px-3 py-2 rounded text-center font-semibold text-blue-800">
                          751
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* พื้นที่สำหรับ Section อื่น ๆ */}
            <div className="text-center text-gray-400 py-8">
              <p>Section 2, 3, 4 ... จะอยู่ที่นี่</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}