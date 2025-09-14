// components/shared/Sidebar.tsx
import React from "react";
import Link from "next/link";

const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 h-screen bg-white shadow-md flex flex-col p-4 fixed left-0 top-0 z-10">

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
      <p className="text-xs text-gray-400 mb-2 uppercase">Menu</p>
      <ul className="space-y-2">
        <li>
          <Link href="#" className="flex items-center px-3 py-2 rounded bg-indigo-50 text-indigo-600 font-medium">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M13 5v6h6" />
            </svg>
            Dashboard
          </Link>
        </li>

        <li>
          <Link href="#" className="flex items-center px-3 py-2 rounded text-gray-700 hover:bg-gray-100">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2v-5H3v5a2 2 0 002 2z" />
            </svg>
            Calendar
          </Link>
        </li>

        <li>
          <Link href="#" className="flex items-center px-3 py-2 rounded text-gray-700 hover:bg-gray-100">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A4 4 0 017 16h10a4 4 0 011.879.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            User Profile
          </Link>
        </li>

        {/* Forms Dropdown */}
        <li>
          <details className="group">
            <summary className="flex items-center px-3 py-2 rounded text-gray-700 hover:bg-gray-100 cursor-pointer">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m2 0a2 2 0 100-4H7a2 2 0 000 4h10z" />
              </svg>
              Forms
            </summary>
            <ul className="pl-10 mt-1 text-sm text-gray-600 space-y-1">
              <li>
                <Link href="#" className="hover:underline">Form Elements</Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">Form Layouts</Link>
              </li>
            </ul>
          </details>
        </li>

        {/* Tables Dropdown */}
        <li>
          <details className="group">
            <summary className="flex items-center px-3 py-2 rounded text-gray-700 hover:bg-gray-100 cursor-pointer">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 6h18M3 14h18M3 18h18" />
              </svg>
              Tables
            </summary>
            <ul className="pl-10 mt-1 text-sm text-gray-600 space-y-1">
              <li>
                <Link href="#" className="hover:underline">Simple Table</Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">Advanced Table</Link>
              </li>
            </ul>
          </details>
        </li>

        {/* Pages Dropdown */}
        <li>
          <details className="group">
            <summary className="flex items-center px-3 py-2 rounded text-gray-700 hover:bg-gray-100 cursor-pointer">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
              </svg>
              Pages
            </summary>
            <ul className="pl-10 mt-1 text-sm text-gray-600 space-y-1">
              <li>
                <Link href="#" className="hover:underline">Login</Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">Register</Link>
              </li>
            </ul>
          </details>
        </li>
      </ul>

      {/* Others */}
      <p className="text-xs text-gray-400 mt-6 mb-2 uppercase">Others</p>
      <ul className="space-y-2">
        <li>
          <details className="group">
            <summary className="flex items-center px-3 py-2 rounded text-gray-700 hover:bg-gray-100 cursor-pointer">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 11V3m0 0L7 7m4-4l4 4M11 21v-4m0 0l-4 4m4-4l4 4" />
              </svg>
              Charts
            </summary>
          </details>
        </li>

        <li>
          <details className="group">
            <summary className="flex items-center px-3 py-2 rounded text-gray-700 hover:bg-gray-100 cursor-pointer">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              UI Elements
            </summary>
          </details>
        </li>

        <li>
          <details className="group">
            <summary className="flex items-center px-3 py-2 rounded text-gray-700 hover:bg-gray-100 cursor-pointer">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 .55-.45 1-1 1s-1-.45-1-1 .45-1 1-1 1 .45 1 1zm0 0V9m0 2v2m0 2h.01M4 4h16v16H4V4z" />
              </svg>
              Authentication
            </summary>
          </details>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
