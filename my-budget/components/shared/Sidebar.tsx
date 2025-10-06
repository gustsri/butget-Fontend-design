// components/shared/Sidebar.tsx
import React from "react";
import Link from "next/link";

const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 h-screen bg-white shadow-md flex flex-col p-4 fixed left-0 top-0 z-10 overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center mb-6 space-x-3">
        <img src="/img/icon/IT logo.png" alt="Logo" className="w-12 h-12" />
        <span className="text-xl font-semibold text-gray-800 leading-tight">
          Budget Management
        </span>
      </div>

      {/* ======================== */}
      {/* จัดทำแผนงบประมาณ */}
      {/* ======================== */}
      <p className="text-xs text-gray-400 mb-2 uppercase">จัดทำแผนงบประมาณ</p>
      <ul className="space-y-1 pl-1">
        <li>
          <Link href="/planning/students" className="flex items-center px-3 py-2 rounded text-gray-700 hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              strokeWidth="2" stroke="currentColor"
              className="w-5 h-5 mr-3 flex-shrink-0 text-gray-700">
              <path d="M11.5 15H7a4 4 0 0 0-4 4v2" />
              <path d="M21.378 16.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z" />
              <circle cx="10" cy="7" r="4" />
            </svg>
            <span>บันทึกจำนวนนักศึกษา</span>
          </Link>
        </li>

        <li>
          <Link href="/planning/revenue" className="flex items-center px-3 py-2 rounded text-gray-700 hover:bg-gray-100">
            <svg width="24" height="24" viewBox="0 0 26 33" fill="none" xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 mr-3 flex-shrink-0 text-gray-700">
              <path d="M18.9521 3.66504H22.4224C23.036 3.66504 23.6244 3.90879 24.0583 4.34266C24.4922 4.77653 24.7359 5.36499 24.7359 5.97857V29.1139C24.7359 29.7275 24.4922 30.316 24.0583 30.7498C23.6244 31.1837 23.036 31.4275 22.4224 31.4275H3.91412C3.30053 31.4275 2.71208 31.1837 2.2782 30.7498C1.84433 30.316 1.60059 29.7275 1.60059 29.1139V5.97857C1.60059 5.36499 1.84433 4.77653 2.2782 4.34266C2.71208 3.90879 3.30053 3.66504 3.91412 3.66504H7.38442"
                stroke="#000001" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16.6387 1.35156H9.69806C8.42033 1.35156 7.38452 2.38737 7.38452 3.6651V4.82187C7.38452 6.0996 8.42033 7.1354 9.69806 7.1354H16.6387C17.9164 7.1354 18.9522 6.0996 18.9522 4.82187V3.6651C18.9522 2.38737 17.9164 1.35156 16.6387 1.35156Z"
                stroke="#000001" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M13.1682 14.0759V23.3301" stroke="#000001" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M17.7954 18.7031H8.54126" stroke="#000001" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>จัดทำแผนรายรับ</span>
          </Link>
        </li>

        <li>
          <Link href="/planning/expense" className="flex items-center px-3 py-2 rounded text-gray-700 hover:bg-gray-100">
            <svg width="24" height="24" viewBox="0 0 29 36" fill="none" xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 mr-3 flex-shrink-0 text-gray-700">
              <path d="M20.75 4.5H24.5C25.163 4.5 25.7989 4.76339 26.2678 5.23223C26.7366 5.70107 27 6.33696 27 7V32C27 32.663 26.7366 33.2989 26.2678 33.7678C25.7989 34.2366 25.163 34.5 24.5 34.5H4.5C3.83696 34.5 3.20107 34.2366 2.73223 33.7678C2.26339 33.2989 2 32.663 2 32V7C2 6.33696 2.26339 5.70107 2.73223 5.23223C3.20107 4.76339 3.83696 4.5 4.5 4.5H8.25"
                stroke="#000001" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M18.25 2H10.75C9.36929 2 8.25 3.11929 8.25 4.5V5.75C8.25 7.13071 9.36929 8.25 10.75 8.25H18.25C19.6307 8.25 20.75 7.13071 20.75 5.75V4.5C20.75 3.11929 19.6307 2 18.25 2Z"
                stroke="#000001" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M19.5 20.75H9.5" stroke="#000001" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>จัดทำแผนรายจ่าย</span>
          </Link>
        </li>

        <li>
          <Link href="/planning/revenue-adjust" className="flex items-center px-3 py-2 rounded text-gray-700 hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              strokeWidth="2" stroke="currentColor"
              className="w-5 h-5 mr-3 flex-shrink-0 text-gray-700">
              <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z" />
            </svg>
            <span>ปรับแก้แผนงบประมาณ</span>
          </Link>
        </li>

        <li>
          <Link href="/planning/" className="flex items-center px-3 py-2 rounded text-gray-700 hover:bg-gray-100">
            <img src="/img/icon/document.svg" alt="" className="w-5 h-5 mr-3 flex-shrink-0" />
            <span>จัดทำแผนงบประมาณ</span>
          </Link>
        </li>

        <li>
          <Link href="/planning/appprovedisbursemnet" className="flex items-center px-3 py-2 rounded text-gray-700 hover:bg-gray-100">
            <img src="/img/icon/document-signed.svg" alt="" className="w-5 h-5 mr-3 flex-shrink-0" />
            <span>ส่งเอกสารใบเสร็จ</span>
          </Link>
        </li>
      </ul>

      {/* ======================== */}
      {/* ติดตาม */}
      {/* ======================== */}
      <p className="text-xs text-gray-400 mt-6 mb-2 uppercase">ติดตาม</p>
      <ul className="space-y-1 pl-1">
        <li>
          <Link href="/planning/dashboard" className="flex items-center px-3 py-2 rounded text-gray-700 hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
              viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="w-5 h-5 mr-3 flex-shrink-0 text-gray-700">
              <rect width="20" height="14" x="2" y="3" rx="2" />
              <line x1="8" x2="16" y1="21" y2="21" />
              <line x1="12" x2="12" y1="17" y2="21" />
            </svg>
            <span>ติดตามแผนงบประมาณ</span>
          </Link>
        </li>

        <li>
          <Link href="/tracking" className="flex items-center px-3 py-2 rounded text-gray-700 hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
              viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="w-5 h-5 mr-3 flex-shrink-0 text-gray-700">
              <path d="M16 14v2.2l1.6 1" />
              <path d="M16 4h2a2 2 0 0 1 2 2v.832" />
              <path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h2" />
              <circle cx="16" cy="16" r="6" />
              <rect x="8" y="2" width="8" height="4" rx="1" />
            </svg>
            <span>ติดตามการอนุมัติเอกสาร</span>
          </Link>
        </li>

        <li>
          <Link href="/trackdisbursement" className="flex items-center px-3 py-2 rounded text-gray-700 hover:bg-gray-100">
            <img src="/img/icon/person-add.svg" alt="" className="w-5 h-5 mr-3 flex-shrink-0" />
            <span>ตรวจสอบหลักฐานการเบิกจ่าย</span>
          </Link>
        </li>
      </ul>

      {/* ======================== */}
      {/* อนุมัติ */}
      {/* ======================== */}
      <p className="text-xs text-gray-400 mt-6 mb-2 uppercase">อนุมัติ</p>
      <ul className="space-y-1 pl-1">
        <li>
          <Link href="/approval/AppDocument" className="flex items-center px-3 py-2 rounded text-gray-700 hover:bg-gray-100">
            <svg width="24" height="24" viewBox="0 0 27 34" fill="none" xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 mr-3 flex-shrink-0 text-gray-700">
              <path d="M19.1215 4.44385H22.5918C23.2054 4.44385 23.7939 4.68759 24.2278 5.12147C24.6616 5.55534 24.9054 6.14379 24.9054 6.75738V29.8927C24.9054 30.5063 24.6616 31.0948 24.2278 31.5286C23.7939 31.9625 23.2054 32.2063 22.5918 32.2063H4.08355C3.46997 32.2063 2.88151 31.9625 2.44764 31.5286C2.01377 31.0948 1.77002 30.5063 1.77002 29.8927V6.75738C1.77002 6.14379 2.01377 5.55534 2.44764 5.12147C2.88151 4.68759 3.46997 4.44385 4.08355 4.44385H7.55386"
                stroke="#000001" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16.8081 2.13037H9.86749C8.58976 2.13037 7.55396 3.16618 7.55396 4.44391V5.60067C7.55396 6.8784 8.58976 7.91421 9.86749 7.91421H16.8081C18.0858 7.91421 19.1216 6.8784 19.1216 5.60067V4.44391C19.1216 3.16618 18.0858 2.13037 16.8081 2.13037Z"
                stroke="#000001" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7.55396 20.6386L12.181 24.1089L17.9649 14.8547"
                stroke="#000001" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>การอนุมัติแผนงบประมาณ</span>
          </Link>
        </li>

        <li>
          <Link href="/appdisbursement" className="flex items-center px-3 py-2 rounded text-gray-700 hover:bg-gray-100">
            <svg width="24" height="24" viewBox="0 0 27 34" fill="none" xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 mr-3 flex-shrink-0 text-gray-700">
              <path d="M19.1215 4.44385H22.5918C23.2054 4.44385 23.7939 4.68759 24.2278 5.12147C24.6616 5.55534 24.9054 6.14379 24.9054 6.75738V29.8927C24.9054 30.5063 24.6616 31.0948 24.2278 31.5286C23.7939 31.9625 23.2054 32.2063 22.5918 32.2063H4.08355C3.46997 32.2063 2.88151 31.9625 2.44764 31.5286C2.01377 31.0948 1.77002 30.5063 1.77002 29.8927V6.75738C1.77002 6.14379 2.01377 5.55534 2.44764 5.12147C2.88151 4.68759 3.46997 4.44385 4.08355 4.44385H7.55386"
                stroke="#000001" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16.8081 2.13037H9.86749C8.58976 2.13037 7.55396 3.16618 7.55396 4.44391V5.60067C7.55396 6.8784 8.58976 7.91421 9.86749 7.91421H16.8081C18.0858 7.91421 19.1216 6.8784 19.1216 5.60067V4.44391C19.1216 3.16618 18.0858 2.13037 16.8081 2.13037Z"
                stroke="#000001" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7.55396 20.6386L12.181 24.1089L17.9649 14.8547"
                stroke="#000001" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>การอนุมัติการเบิกจ่าย</span>
          </Link>
        </li>
      </ul>

      {/* ======================== */}
      {/* อื่นๆ */}
      {/* ======================== */}
      <p className="text-xs text-gray-400 mt-6 mb-2 uppercase">อื่นๆ</p>
      <ul className="space-y-1 pl-1">
        <li>
          <Link href="/other/dowloadfile" className="flex items-center px-3 py-2 rounded text-gray-700 hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              strokeWidth="1.5" stroke="currentColor"
              className="w-5 h-5 mr-3 flex-shrink-0 text-gray-700">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span>เอกสาร</span>
          </Link>
        </li>

        <li>
          <Link
            href="/other/slip"
            className="flex items-center px-3 py-2 rounded text-gray-700 hover:bg-gray-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 mr-3 flex-shrink-0 text-gray-700"
            >
              <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
              <path d="M14 8H8" />
              <path d="M16 12H8" />
              <path d="M13 16H8" />
            </svg>
            <span>ใบเสร็จ</span>
          </Link>
        </li>

      </ul>
    </aside>
  );
};

export default Sidebar;
