"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import Sidebar from "@/components/shared/Sidebar";
import { FileText, Upload, Send, X } from "lucide-react";

// mock เอกสาร
const mockDocs = {
  "1": { docNo: "BR-2025-001", date: "2025-09-15", status: "อนุมัติแล้ว" },
  "2": { docNo: "BR-2025-002", date: "2025-09-17", status: "อนุมัติแล้ว" },
};

export default function ApprovedDetail() {
  const params = useParams();
  const { id } = params;
  const doc = mockDocs[id as keyof typeof mockDocs];

  const [file, setFile] = useState<File | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFile(e.target.files[0]);
  };

  const handleUpload = () => {
    if (file) {
      setUploadedFiles([...uploadedFiles, file]);
      setFile(null);
    }
  };

  const handleRemove = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  if (!doc) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 ml-64 p-6 text-black">
          ไม่พบเอกสาร
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 ml-64 p-6 text-black">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <FileText className="text-blue-600 w-7 h-7" />
          รายละเอียดการเบิก {doc.docNo}
        </h1>

        {/* ข้อมูลเอกสาร */}
        <div className="bg-white shadow rounded-2xl p-6 mb-6">
          <p><span className="font-semibold">เลขที่เอกสาร:</span> {doc.docNo}</p>
          <p><span className="font-semibold">วันที่อนุมัติ:</span> {doc.date}</p>
          <p><span className="font-semibold">สถานะ:</span> ✅ {doc.status}</p>
        </div>

        {/* ส่งไฟล์กลับ */}
        <div className="bg-white shadow rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-purple-600" />
            ส่งเอกสารกลับ
          </h2>

          <div className="flex items-center gap-3">
            <input
              type="file"
              onChange={handleFileChange}
              className="block text-sm text-black 
                         file:mr-4 file:py-2 file:px-4
                         file:rounded-full file:border-0
                         file:text-sm file:font-semibold
                         file:bg-purple-50 file:text-purple-700
                         hover:file:bg-purple-100"
            />
            <button
              onClick={handleUpload}
              disabled={!file}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              ส่งเอกสาร
            </button>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">📂 ไฟล์ที่ส่งแล้ว:</h3>
              <ul className="space-y-2">
                {uploadedFiles.map((f, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center bg-gray-50 border rounded-lg px-4 py-2"
                  >
                    <span className="text-sm">{f.name}</span>
                    <button
                      onClick={() => handleRemove(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
