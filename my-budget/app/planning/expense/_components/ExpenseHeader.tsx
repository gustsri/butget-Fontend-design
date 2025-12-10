"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import YearDropdown from "@/components/shared/year";

// สมมติว่านี่คือหน้าตาของ Props ปีงบประมาณที่คุณมีอยู่ (หรือ import ของจริงมาใช้)
interface ExpenseHeaderProps {
    title: string;
    subtitle?: string;
    // รับ Component YearDropdown เข้ามา หรือรับเป็น Function ก็ได้
    yearSelector?: React.ReactNode;
}

export default function ExpenseHeader({ title, subtitle, yearSelector }: ExpenseHeaderProps) {
    const pathname = usePathname();

    // รายการ Tabs ที่จะให้สลับไปมาได้เลย
    const tabs = [
        { name: "F-3 จัดสรรงบ", href: "/expense/f-3" },
        { name: "F-5 สรุปงบประมาณ", href: "/expense/f-5" },
        { name: "F-23 สรุปรายจ่าย", href: "/expense/f-23" },
    ];

    return (
        <div className="bg-white border-b border-gray-200 mb-6 -mx-8 -mt-8 px-8 pt-6 pb-0 shadow-sm">
            {/* 1. ส่วนปุ่มย้อนกลับ */}
            <div className="mb-4">
                <Link
                    href="/expense"
                    className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors"
                >
                    <ArrowLeftIcon className="w-4 h-4 mr-1" />
                    กลับหน้าหลัก
                </Link>
            </div>

            {/* 2. ส่วนหัวข้อ (Title) และ ปีงบประมาณ (Year Selector) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                    {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
                </div>

                {/* พื้นที่วาง Dropdown ปีงบประมาณ */}
                <div className="flex items-center bg-gray-50 p-1.5 rounded-lg border">
                    <span className="text-xs text-gray-500 font-medium px-2">ปีงบประมาณ:</span>
                    {/* ถ้าคุณส่ง Component YearDropdown มา ก็จะแสดงตรงนี้ */}
                    <div className="min-w-[120px]">
                        <YearDropdown onYearChange={(id) => setSelectedYear(id)} />
                    </div>
                </div>
            </div>

            {/* 3. ส่วน Tabs สลับแผน (Active State อิงตาม URL) */}
            <div className="flex space-x-1 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.href;
                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={`
                whitespace-nowrap px-4 py-3 text-sm font-medium border-b-2 transition-colors
                ${isActive
                                    ? "border-blue-600 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }
              `}
                        >
                            {tab.name}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}