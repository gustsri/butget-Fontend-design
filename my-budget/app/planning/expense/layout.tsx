// app/expense/layout.tsx
import React from "react";
import Sidebar from "@/components/shared/Sidebar"; // <-- import path ตามที่คุณเก็บไฟล์ไว้

export default function ExpenseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 1. ใส่ Sidebar เดิมลงไป (มันเป็น fixed position) */}
      <Sidebar />

      {/* 2. พื้นที่เนื้อหาหลัก (Main Content) */}
      {/* ต้องใส่ ml-64 (margin-left: 16rem) เพื่อดันเนื้อหาหนี Sidebar ที่กว้าง w-64 */}
      <main className="ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}