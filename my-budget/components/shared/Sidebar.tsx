// components/shared/Sidebar.tsx
import React from "react";
import Link from "next/link";

const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 h-screen bg-white shadow-md flex flex-col p-4 fixed left-0 top-0 z-10 overflow-y-auto">


      {/* Logo */}
      <div className="flex items-center mb-6">
        <img src="/img/icon/IT logo.png" alt="Logo" className="w-20 h-20" />
        <span className="text-xl font-semibold text-gray-800">Budget Management</span>
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
          <Link href="/planning/expense" className="flex items-center px-3 py-2 rounded text-gray-700 hover:bg-gray-100">
            <img src="/img/icon/person-add.svg" alt="" className="w-5 h-5 mr-3" />
            จัดทำแผนรายจ่าย
          </Link>
        </li>

        <li>
          <Link href="/planning/revenue-adjust" className="flex items-center px-3 py-2 rounded text-gray-700 hover:bg-gray-100">
            <img src="/img/icon/document.svg" alt="" className="w-5 h-5 mr-3" />
            ปรับแก้แผนงบประมาณ
          </Link>
        </li>

        <li>
          <Link href="/planning/" className="flex items-center px-3 py-2 rounded text-gray-700 hover:bg-gray-100">
            <img src="/img/icon/document.svg" alt="" className="w-5 h-5 mr-3" />
            จัดทำแผนงบประมาณ
          </Link>
        </li>
        <li>
          <Link href="/planning/appprovedisbursemnet" className="flex items-center px-3 py-2 rounded text-gray-700 hover:bg-gray-100">
            <img src="/img/icon/document-signed.svg" alt="" className="w-5 h-5 mr-3" />
            ส่งเอกสารใบเสร็จ
          </Link>
        </li>
      </ul>

      {/* tracking */}
      <p className="text-xs text-gray-400 mb-2 uppercase">ติดตาม</p>
      <ul className="space-y-1">
        <li>
          <Link href="/planning/dashboard" className="flex items-center px-3 py-2 rounded text-gray-700 hover:bg-gray-100">
            <img src="/img/icon/person-add.svg" alt="" className="w-5 h-5 mr-3" />
            ติดตามแผนงบประมาณ
          </Link>
        </li>

        <li>
          <Link href="/tracking" className="flex items-center px-3 py-2 rounded text-gray-700 hover:bg-gray-100">
            <img src="/img/icon/person-add.svg" alt="" className="w-5 h-5 mr-3" />
            ติดตามการอนุมัติเอกสาร
          </Link>
        </li>

        <li>
          <Link href="/trackdisbursement" className="flex items-center px-3 py-2 rounded text-gray-700 hover:bg-gray-100">
            <img src="/img/icon/person-add.svg" alt="" className="w-5 h-5 mr-3" />
            ตรวจสอบหลักฐานการเบิกจ่าย
          </Link>
        </li>
      </ul>
      {/* allow */}
      <p className="text-xs text-gray-400 mt-6 mb-2 uppercase">อนุมัติ</p>
      <ul className="space-y-1">
        <li>
          <Link href="/approval/AppDocument" className="flex items-center px-3 py-2 rounded text-gray-700 hover:bg-gray-100">
            <img src="/img/icon/person-add.svg" alt="" className="w-5 h-5 mr-3" />
            การอนุมัติแผนงบประมาณ
          </Link>
        </li>

        <li>
          <Link href="/appdisbursement" className="flex items-center px-3 py-2 rounded text-gray-700 hover:bg-gray-100">
            <img src="/img/icon/person-add.svg" alt="" className="w-5 h-5 mr-3" />
            การอนุมัติการเบิกจ่าย
          </Link>
        </li>
      </ul>

      <p className="text-xs text-gray-400 mb-2 uppercase">อื่นๆ</p>
      <ul className="space-y-1">
        <li>
          <Link href="/other/dowloadfile" className="flex items-center px-3 py-2 rounded text-gray-700 hover:bg-gray-100">
            <img src="/img/icon/person-add.svg" alt="" className="w-5 h-5 mr-3" />
            เอกสาร
          </Link>
        </li>
      </ul>
      <ul className="space-y-1">
        <li>
          <Link href="/other/disbursement" className="flex items-center px-3 py-2 rounded text-gray-700 hover:bg-gray-100">
            <img src="/img/icon/person-add.svg" alt="" className="w-5 h-5 mr-3" />
            ยื่นเอกสารการเบิก
          </Link>
        </li>ห
      </ul>
    </aside>
  );
};

export default Sidebar;