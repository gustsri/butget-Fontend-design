"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/shared/Sidebar";
import YearDropdown from "@/components/shared/year"; // ✅ Import Component นี้มาใช้
import { Calculator, Loader2 } from "lucide-react";
import { getRevenueSimulationData } from "./actions";

export default function RevenueCalculationPage() {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);

    // ✅ เปลี่ยน State เริ่มต้นเป็น null รอให้ YearDropdown ส่งค่าปีปัจจุบันมาให้
    const [selectedFiscalYear, setSelectedFiscalYear] = useState<number | null>(null);

    // Effect: ทำงานเมื่อปีเปลี่ยน (YearDropdown ส่งค่ามา)
    useEffect(() => {
        if (selectedFiscalYear) {
            fetchData(selectedFiscalYear);
        }
    }, [selectedFiscalYear]);

    const fetchData = async (year: number) => {
        setLoading(true);
        try {
            const result = await getRevenueSimulationData(year);
            setData(result);
        } catch (error) {
            console.error("Failed to fetch simulation data:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- Helper Functions (เหมือนเดิม) ---
    const getDataForSemester = (year: number, semester: number) => {
        if (!data) return [];
        return data.programs.map((prog: any) => {
            const fee = prog.tuition_per_semester || 0;

            // ✅ Logic ดึงข้อมูล enrollment ที่ตรงกับ ปี/เทอม (รองรับ Schema ใหม่)
            const enrollment = prog.EnrollmentInformation.find(
                (e: any) => e.academic_year === year && e.semester === semester
            ) || { year1_count: 0, year2_count: 0, year3_count: 0, year4_count: 0 };

            const totalStudents =
                (enrollment.year1_count || 0) +
                (enrollment.year2_count || 0) +
                (enrollment.year3_count || 0) +
                (enrollment.year4_count || 0);

            return {
                id: prog.academic_program_id,
                name: prog.program_name,
                level: prog.degree_level,
                fee: Number(fee),
                students: enrollment,
                totalStudents,
                totalRevenue: totalStudents * Number(fee)
            };
        }).filter((item: any) => item.totalRevenue > 0 || item.fee > 0);
    };

    const getSemesterTotalRevenue = (year: number, semester: number) => {
        if (!selectedFiscalYear) return 0; // กัน Error กรณีปียังไม่มา
        const items = getDataForSemester(year, semester);
        return items.reduce((acc: number, cur: any) => acc + cur.totalRevenue, 0);
    };

    // --- Logic คำนวณ (ทำงานเฉพาะเมื่อมีปีแล้ว) ---
    // ถ้ายังไม่มี selectedFiscalYear ให้ใช้ค่า 0 ไปก่อนเพื่อกัน Crash
    const currentYear = selectedFiscalYear || new Date().getFullYear() + 543;

    const rawTerm1Prev = getSemesterTotalRevenue(currentYear - 1, 1);
    const rawTerm2Prev = getSemesterTotalRevenue(currentYear - 1, 2);
    const rawTerm1Curr = getSemesterTotalRevenue(currentYear, 1);

    const budgetPart1 = (rawTerm1Prev / 5) * 2;
    const budgetPart2 = rawTerm2Prev;
    const budgetPart3 = (rawTerm1Curr / 5) * 3;

    const totalRevenue = budgetPart1 + budgetPart2 + budgetPart3;
    const deduction = totalRevenue * 0.35;
    const netRevenue = totalRevenue - deduction;

    // --- Sub-Component (เหมือนเดิม) ---
    const SemesterTable = ({ title, year, semester, colorClass, headerColor }: any) => {
        const semesterData = getDataForSemester(year, semester);
        const totalSemRevenue = semesterData.reduce((acc: number, cur: any) => acc + cur.totalRevenue, 0);

        return (
            <div className={`rounded-xl border shadow-sm mb-8 overflow-hidden bg-white ${colorClass}`}>
                <div className={`px-6 py-4 border-b flex justify-between items-center ${headerColor}`}>
                    <div>
                        <h3 className="font-bold text-lg text-gray-800">{title}</h3>
                        <p className="text-sm text-gray-600">ปีการศึกษา {year} ภาคเรียนที่ {semester}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-600 font-medium">รวมรายรับภาคเรียนนี้</p>
                        <p className="text-xl font-bold text-blue-700">{totalSemRevenue.toLocaleString()} บาท</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600 font-semibold border-b">
                            <tr>
                                <th className="px-6 py-3 w-1/3">หลักสูตร</th>
                                <th className="px-4 py-3 text-right">ค่าเทอม</th>
                                <th className="px-2 py-3 text-center w-12 text-xs">ปี 1</th>
                                <th className="px-2 py-3 text-center w-12 text-xs">ปี 2</th>
                                <th className="px-2 py-3 text-center w-12 text-xs">ปี 3</th>
                                <th className="px-2 py-3 text-center w-12 text-xs">ปี 4+</th>
                                <th className="px-4 py-3 text-center font-bold bg-gray-100/50">รวม นศ.</th>
                                <th className="px-6 py-3 text-right font-bold bg-green-50 text-green-800">รวมเป็นเงิน</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {semesterData.map((item: any) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-3 font-medium text-gray-700">
                                        {item.name} <span className="text-xs text-gray-400 font-normal ml-1">({item.level})</span>
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-600">{item.fee.toLocaleString()}</td>
                                    <td className="px-2 py-3 text-center text-gray-500">{item.students.year1_count || '-'}</td>
                                    <td className="px-2 py-3 text-center text-gray-500">{item.students.year2_count || '-'}</td>
                                    <td className="px-2 py-3 text-center text-gray-500">{item.students.year3_count || '-'}</td>
                                    <td className="px-2 py-3 text-center text-gray-500">
                                        {(item.students.year4_count || 0) + (item.students.year5_count || 0) + (item.students.year6_count || 0)}
                                    </td>
                                    <td className="px-4 py-3 text-center font-bold text-gray-800 bg-gray-50/50">
                                        {item.totalStudents}
                                    </td>
                                    <td className="px-6 py-3 text-right font-bold text-green-700 bg-green-50/30">
                                        {item.totalRevenue.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                            {semesterData.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center text-gray-400 bg-gray-50/20">
                                        {loading ? "กำลังโหลด..." : "ไม่พบข้อมูลนักศึกษาสำหรับเทอมนี้"}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="flex min-h-screen bg-gray-50/50">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">

                {/* Header */}
                <div className="bg-[#1e293b] rounded-xl shadow-lg relative p-8 z-20 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
                        <div className="space-y-4">
                            <div>
                                <h6 className="text-blue-300 text-xs font-bold tracking-wider uppercase mb-1">
                                    IT BUDGET PLANNING SYSTEM
                                </h6>
                                <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                                    <Calculator className="w-8 h-8 text-blue-400" />
                                    คำนวณรายรับ (Simulation)
                                </h1>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 bg-blue-500/20 text-blue-200 text-xs rounded border border-blue-500/30">
                                    Real-time Calculation
                                </span>
                                <span className="px-3 py-1 bg-green-500/20 text-green-200 text-xs rounded border border-green-500/30">
                                    Fiscal Year Based
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-3">

                            {/* ✅ เปลี่ยนมาใช้ YearDropdown */}
                            <YearDropdown
                                onYearChange={(id, year) => setSelectedFiscalYear(year)}
                                allowCreate={false} // หน้า Sim ควรให้เลือกปีที่มีอยู่แล้วเท่านั้น ไม่ควรสร้างใหม่
                            />

                            <p className="text-xs text-slate-400">เลือกปีงบประมาณเพื่อคำนวณรายรับ</p>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                {/* ถ้ายังไม่เลือกปี หรือกำลังโหลด ให้แสดง Loading */}
                {!selectedFiscalYear || loading ? (
                    <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                        <p className="text-gray-500 font-medium">
                            {loading ? "กำลังคำนวณ..." : "กรุณาเลือกปีงบประมาณ"}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6 pb-20 animate-fade-in">

                        {/* Tables */}
                        <SemesterTable
                            title={`1. ภาคเรียนที่ 1/${selectedFiscalYear - 1} (ต.ค.-พ.ย.)`}
                            year={selectedFiscalYear - 1}
                            semester={1}
                            colorClass="border-blue-200"
                            headerColor="bg-blue-50"
                        />
                        <SemesterTable
                            title={`2. ภาคเรียนที่ 2/${selectedFiscalYear - 1} (ธ.ค.-เม.ย.)`}
                            year={selectedFiscalYear - 1}
                            semester={2}
                            colorClass="border-indigo-200"
                            headerColor="bg-indigo-50"
                        />
                        <SemesterTable
                            title={`3. ภาคเรียนที่ 1/${selectedFiscalYear} (ก.ค.-ก.ย.)`}
                            year={selectedFiscalYear}
                            semester={1}
                            colorClass="border-purple-200"
                            headerColor="bg-purple-50"
                        />

                        {/* Summary */}
                        <div className="mt-12 space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-8 w-1 bg-blue-600 rounded-full"></div>
                                <h2 className="text-2xl font-bold text-slate-800">
                                    สรุปงบประมาณรายรับ ปี {selectedFiscalYear}
                                </h2>
                                <span className="text-sm text-gray-500">(คำนวณตามสัดส่วนระยะเวลา)</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Box 1 */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                                    <div className="bg-gray-50 px-4 py-3 border-b text-sm font-semibold text-gray-700">
                                        1. เทอม 1/{selectedFiscalYear - 1} (ต.ค.-พ.ย.)
                                    </div>
                                    <div className="p-5 flex-1 space-y-3">
                                        <div className="flex justify-between text-sm text-gray-500">
                                            <span>ยอดรวมเทอม:</span>
                                            <span>{rawTerm1Prev.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-500">
                                            <span>เฉลี่ยต่อเดือน (หาร 5):</span>
                                            <span>{(rawTerm1Prev / 5).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                        </div>
                                        <div className="pt-3 border-t border-dashed">
                                            <p className="text-xs text-blue-600 mb-1 font-medium">เข้าปีงบ {selectedFiscalYear} (2 เดือน)</p>
                                            <p className="text-2xl font-bold text-blue-700">
                                                {budgetPart1.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Box 2 */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                                    <div className="bg-gray-50 px-4 py-3 border-b text-sm font-semibold text-gray-700">
                                        2. เทอม 2/{selectedFiscalYear - 1} (ธ.ค.-เม.ย.)
                                    </div>
                                    <div className="p-5 flex-1 space-y-3">
                                        <div className="flex justify-between text-sm text-gray-500">
                                            <span>ยอดรวมเทอม:</span>
                                            <span>{rawTerm2Prev.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-400 opacity-50">
                                            <span>- เต็มจำนวน -</span>
                                        </div>
                                        <div className="pt-3 border-t border-dashed">
                                            <p className="text-xs text-indigo-600 mb-1 font-medium">เข้าปีงบ {selectedFiscalYear} (เต็มจำนวน)</p>
                                            <p className="text-2xl font-bold text-indigo-700">
                                                {budgetPart2.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Box 3 */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                                    <div className="bg-gray-50 px-4 py-3 border-b text-sm font-semibold text-gray-700">
                                        3. เทอม 1/{selectedFiscalYear} (ก.ค.-ก.ย.)
                                    </div>
                                    <div className="p-5 flex-1 space-y-3">
                                        <div className="flex justify-between text-sm text-gray-500">
                                            <span>ยอดรวมเทอม:</span>
                                            <span>{rawTerm1Curr.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-500">
                                            <span>เฉลี่ยต่อเดือน (หาร 5):</span>
                                            <span>{(rawTerm1Curr / 5).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                        </div>
                                        <div className="pt-3 border-t border-dashed">
                                            <p className="text-xs text-purple-600 mb-1 font-medium">เข้าปีงบ {selectedFiscalYear} (3 เดือน)</p>
                                            <p className="text-2xl font-bold text-purple-700">
                                                {budgetPart3.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#f0fdf4] border border-green-200 rounded-xl p-8 shadow-sm mt-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-green-100 rounded-full opacity-50 blur-2xl pointer-events-none"></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-bold text-green-900 border-b border-green-200 pb-2">
                                            สรุปยอดรวม (Grand Summary)
                                        </h3>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 font-medium">รวมประมาณการรายรับทั้งสิ้น</span>
                                            <span className="text-xl font-bold text-gray-800">{totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-red-600">
                                            <span className="font-medium">หัก ให้หน่วยงานกลาง (35%)</span>
                                            <span className="text-xl font-bold">-{deduction.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-center items-end border-l border-green-200 pl-8">
                                        <span className="text-sm font-semibold text-green-600 uppercase tracking-wider mb-1">
                                            รายรับคงเหลือสุทธิ
                                        </span>
                                        <span className="text-4xl md:text-5xl font-extrabold text-green-700 drop-shadow-sm">
                                            ฿{netRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </main>
        </div>
    );
}