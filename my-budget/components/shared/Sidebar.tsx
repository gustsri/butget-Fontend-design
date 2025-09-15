// components/shared/Sidebar.tsx
import React from "react";
import Link from "next/link";

const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 h-screen bg-white shadow-md flex flex-col p-4 fixed left-0 top-0 z-10 overflow-y-auto">


      {/* Logo */}
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center mr-2">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
        </div>
        <span className="text-xl font-semibold text-gray-800">TailAdmin</span>
      </div>

      {/* Menu */}
      <p className="text-xs text-gray-400 mb-2 uppercase">จัดทำแผนงบประมาณ</p>
      <ul className="space-y-1">
        <li>
          <Link href="/planning/students" className="flex items-center px-3 py-2 rounded text-gray-700 hover:bg-gray-100">
            <img src="/img/icon/person-add.svg" alt="" className="w-5 h-5 mr-3" />
            บันทึกจำนวนนักศึกษา
          </Link>
        </li>

        <li>
          <Link href="/planning/revenue" className="flex items-center px-3 py-2 rounded text-gray-700 hover:bg-gray-100">
            <img src="/img/icon/person-add.svg" alt="" className="w-5 h-5 mr-3" />
            จัดทำแผนรายรับ
          </Link>
        </li>

        <li>
          <Link href="/planning/students" className="flex items-center px-3 py-2 rounded text-gray-700 hover:bg-gray-100">
            <img src="/img/icon/person-add.svg" alt="" className="w-5 h-5 mr-3" />
            จัดทำแผนรายจ่าย
          </Link>
        </li>
        
        <li>
          <Link href="/planning/students" className="flex items-center px-3 py-2 rounded text-gray-700 hover:bg-gray-100">
            <img src="/img/icon/document.svg" alt="" className="w-5 h-5 mr-3" />
            จัดทำแผนงบประมาณ
          </Link>
        </li>
        <li>
          <Link href="/planning/students" className="flex items-center px-3 py-2 rounded text-gray-700 hover:bg-gray-100">
            <img src="/img/icon/document-signed.svg" alt="" className="w-5 h-5 mr-3" />
            การเบิกจ่าย
          </Link>
        </li>
            </ul>

      {/* tracking */}
      <p className="text-xs text-gray-400 mb-2 uppercase">ติดตาม</p>
      <ul className="space-y-1">
        <li>
          <Link href="/planning/students" className="flex items-center px-3 py-2 rounded text-gray-700 hover:bg-gray-100">
            <img src="/img/icon/person-add.svg" alt="" className="w-5 h-5 mr-3" />
            ติดตามแผนงบประมาณ
          </Link>
        </li>

        <li>
          <Link href="/planning/students" className="flex items-center px-3 py-2 rounded text-gray-700 hover:bg-gray-100">
            <img src="/img/icon/person-add.svg" alt="" className="w-5 h-5 mr-3" />
            ติดตามการอนุมัติเอกสาร
          </Link>
        </li>

        <li>
          <Link href="/planning/students" className="flex items-center px-3 py-2 rounded text-gray-700 hover:bg-gray-100">
            <img src="/img/icon/person-add.svg" alt="" className="w-5 h-5 mr-3" />
            ตรวจสอบหลักฐานการเบิกจ่าย
          </Link>
        </li>
        </ul>
        {/* allow */}
      <p className="text-xs text-gray-400 mt-6 mb-2 uppercase">อนุมัติ</p>
            <ul className="space-y-1">
        <li>
          <Link href="/planning/students" className="flex items-center px-3 py-2 rounded text-gray-700 hover:bg-gray-100">
            <img src="/img/icon/person-add.svg" alt="" className="w-5 h-5 mr-3" />
            การอนุมัติเอกสาร
          </Link>
        </li>

        <li>
          <Link href="/planning/students" className="flex items-center px-3 py-2 rounded text-gray-700 hover:bg-gray-100">
            <img src="/img/icon/person-add.svg" alt="" className="w-5 h-5 mr-3" />
            การอนุมัติการเบิกจ่าย
          </Link>
        </li>
        </ul>

      <p className="text-xs text-gray-400 mt-6 mb-2 uppercase">อื่นๆ</p>
      <ul className="space-y-1">
        <li>
          <details className="group">
            <summary className="flex items-center px-3 py-2 rounded text-gray-700 hover:bg-gray-100 cursor-pointer">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 11V3m0 0L7 7m4-4l4 4M11 21v-4m0 0l-4 4m4-4l4 4" />
              </svg>
              เอกสาร
            </summary>
          </details>
        </li>
        </ul>
    </aside>
  );
};

export default Sidebar;