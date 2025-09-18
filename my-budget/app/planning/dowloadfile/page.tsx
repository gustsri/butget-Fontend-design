"use client";

import Sidebar from "@/components/shared/Sidebar";
import { FileText, FileSpreadsheet, FileImage, Download } from "lucide-react";

export default function DownloadPage() {
  const categories = [
    {
      title: ":bookmark_tabs: เอกสารทั่วไป",
      files: [
        {
          name: "ใบเสนอราคา.docx",
          path: "/documents/quotation.docx",
          icon: <FileText className="w-6 h-6 text-blue-500" />,
        },
        {
          name: "รายงานประจำเดือน.pdf",
          path: "/documents/report.pdf",
          icon: <FileText className="w-6 h-6 text-red-500" />,
        },
      ],
    },
    {
      title: ":moneybag: การเงิน",
      files: [
        {
          name: "ข้อมูลการเงิน.xlsx",
          path: "/documents/finance.xlsx",
          icon: <FileSpreadsheet className="w-6 h-6 text-green-500" />,
        },
      ],
    },
    {
      title: ":frame_photo: รูปภาพ",
      files: [
        {
          name: "รูปตัวอย่าง.jpg",
          path: "/images/myw3schoolsimage.jpg",
          icon: <FileImage className="w-6 h-6 text-purple-500" />,
        },
      ],
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 ml-64 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <h1 className="text-4xl font-extrabold text-gray-900 mb-10 border-b-4 border-blue-500 pb-2">
            :open_file_folder: ดาวน์โหลดเอกสาร
          </h1>

          {/* Categories */}
          {categories.map((category, idx) => (
            <div key={idx} className="mb-10">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {category.title}
              </h2>
              <div className="grid gap-4">
                {category.files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition"
                  >
                    <div className="flex items-center gap-3">
                      {file.icon}
                      <span className="text-gray-700 font-medium">{file.name}</span>
                    </div>
                    <a
                      href={file.path}
                      download
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
