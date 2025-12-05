"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/shared/Sidebar";
import { Edit, Save, BookOpen, Globe, Plus, X } from "lucide-react";
import { getProgramsWithFees, updateProgramDetails, createProgram } from "./actions";

// Types
type ProgramWithFee = {
    academic_program_id: number;
    program_name: string;
    degree_level: "bachelor" | "bachelor_master" | "master" | "phd";
    program_type: "normal" | "international";
    is_active: boolean;
    student_fee_id?: number | null;
    tuition_per_semester?: number | null;
};

const initialCreateForm = {
    program_name: "",
    degree_level: "bachelor" as const,
    program_type: "normal" as const,
    tuition_per_semester: ""
};

export default function TuitionManagement() {
    const [programs, setPrograms] = useState<ProgramWithFee[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"edit" | "create">("edit");
    
    // State
    const [editingItem, setEditingItem] = useState<ProgramWithFee | null>(null);
    const [editFeeInput, setEditFeeInput] = useState<string>("");
    const [editStatusInput, setEditStatusInput] = useState<boolean>(true);
    const [createForm, setCreateForm] = useState(initialCreateForm);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            const data = await getProgramsWithFees();
            setPrograms(data as any);
        } catch (err) { console.error(err); }
        finally { setIsLoading(false); }
    }

    const formatCurrency = (amount?: number | null) => {
        if (amount === undefined || amount === null) return "0.00 บาท";
        return new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB" }).format(amount);
    };

    const handleEditClick = (item: ProgramWithFee) => {
        setModalMode("edit");
        setEditingItem(item);
        setEditFeeInput(item.tuition_per_semester?.toString() || "");
        setEditStatusInput(item.is_active);
        setIsModalOpen(true);
    };

    const handleCreateClick = () => {
        setModalMode("create");
        setCreateForm(initialCreateForm);
        setIsModalOpen(true);
    }

    const handleSave = async () => {
        if (modalMode === "edit") {
            if (!editingItem) return;
            const newFee = parseFloat(editFeeInput) || 0;
            
            const result = await updateProgramDetails(editingItem.academic_program_id, newFee, editStatusInput);
            
            if (result.success) {
                fetchData(); 
                setIsModalOpen(false);
            } else {
                alert("บันทึกไม่สำเร็จ");
            }
        } else {
            // Create Mode
            if (!createForm.program_name) {
                alert("กรุณากรอกชื่อหลักสูตร");
                return;
            }
            const feeValue = parseFloat(createForm.tuition_per_semester) || 0;

            const result = await createProgram({
                program_name: createForm.program_name,
                degree_level: createForm.degree_level,
                program_type: createForm.program_type,
                tuition_per_semester: feeValue
            });

            if (result.success) {
                await fetchData();
                setIsModalOpen(false);
            } else {
                alert("สร้างหลักสูตรไม่สำเร็จ");
            }
        }
    };

    const renderRows = (items: ProgramWithFee[]) => {
        if (items.length === 0) return <tr><td colSpan={5} className="text-center py-4 text-gray-400">ไม่มีข้อมูล</td></tr>;
        return items.map((program) => (
            <tr key={program.academic_program_id} className={`hover:bg-blue-50/50 transition border-b border-gray-100 last:border-0 ${!program.is_active ? 'opacity-50 bg-gray-50' : ''}`}>
                <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{program.program_name}</div>
                    {!program.is_active && <span className="text-[10px] text-red-500 font-bold ml-2">(ปิดใช้งาน)</span>}
                </td>
                <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded border 
                        ${program.degree_level.includes('bachelor') ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>
                        {program.degree_level === 'bachelor' ? 'ปริญญาตรี' : 
                         program.degree_level === 'bachelor_master' ? 'ปริญญาตรี-โท' :
                         program.degree_level === 'master' ? 'ปริญญาโท' : 'ปริญญาเอก'}
                    </span>
                </td>
                <td className="px-6 py-4 text-right font-bold text-gray-700">
                    {formatCurrency(program.tuition_per_semester)}
                </td>
                <td className="px-6 py-4 text-center">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${program.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {program.is_active ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td className="px-6 py-4 text-center">
                    <button
                        onClick={() => handleEditClick(program)}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 px-3 py-1 rounded border border-blue-200 text-sm flex items-center gap-1 mx-auto transition bg-white"
                    >
                        <Edit className="w-3 h-3" /> แก้ไข
                    </button>
                </td>
            </tr>
        ));
    };

    const normalPrograms = programs.filter(p => p.program_type === 'normal');
    const interPrograms = programs.filter(p => p.program_type === 'international');

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 ml-64 p-6">
                <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden min-h-[80vh]">
                    
                    <div className="bg-gradient-to-r from-slate-900 to-blue-900 rounded-xl shadow-lg mb-6 text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <svg width="100" height="100" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" /></svg>
                        </div>

                        <div className="px-8 py-8 flex flex-col md:flex-row justify-between items-start md:items-center relative z-10">
                            <div>
                                <h2 className="text-blue-200 text-xs font-bold tracking-widest uppercase mb-1">
                                    IT Budget Planning System
                                </h2>
                                <h1 className="text-3xl font-bold text-white tracking-tight">
                                    จัดการค่าธรรมเนียมการศึกษา
                                </h1>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className="bg-blue-800/50 text-blue-100 text-xs px-2 py-1 rounded border border-blue-700">
                                        Master Data
                                    </span>
                                </div>
                            </div>
                            
                            <button 
                                onClick={handleCreateClick}
                                className="mt-4 md:mt-0 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-all transform hover:scale-105 font-medium border border-orange-400"
                            >
                                <Plus className="w-5 h-5" />
                                เพิ่มหลักสูตรใหม่
                            </button>
                        </div>
                        <div className="h-1 bg-orange-500 w-full"></div>
                    </div>

                    <div className="p-6">
                        {isLoading ? (
                            <div className="text-center py-10 text-gray-500 animate-pulse">กำลังโหลดข้อมูล...</div>
                        ) : (
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ชื่อหลักสูตร</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ระดับ</th>
                                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">ค่าเทอม (เหมาจ่าย)</th>
                                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">สถานะ</th>
                                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">จัดการ</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                        <tr className="bg-gray-100">
                                            <td colSpan={5} className="px-6 py-2 text-sm font-bold text-gray-700 flex items-center gap-2"><BookOpen className="w-4 h-4" /> หลักสูตรปกติ</td>
                                        </tr>
                                        {renderRows(normalPrograms)}
                                        <tr className="bg-blue-50">
                                            <td colSpan={5} className="px-6 py-2 text-sm font-bold text-blue-800 flex items-center gap-2 border-t border-blue-100"><Globe className="w-4 h-4" /> หลักสูตรนานาชาติ</td>
                                        </tr>
                                        {renderRows(interPrograms)}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-900 opacity-50" onClick={() => setIsModalOpen(false)}></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="relative z-10 inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 border-b border-gray-100 flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">
                                        {modalMode === 'edit' ? 'แก้ไขข้อมูลหลักสูตร' : 'เพิ่มหลักสูตรใหม่'}
                                    </h3>
                                    {modalMode === 'edit' && editingItem && (
                                        <p className="text-sm text-gray-500 mt-1">{editingItem.program_name}</p>
                                    )}
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="px-6 py-6 space-y-6">
                                {modalMode === 'create' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อหลักสูตร</label>
                                            <input
                                                type="text"
                                                value={createForm.program_name}
                                                onChange={(e) => setCreateForm({...createForm, program_name: e.target.value})}
                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 border px-3"
                                                placeholder="ระบุชื่อหลักสูตร..."
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">ระดับการศึกษา</label>
                                                <select
                                                    value={createForm.degree_level}
                                                    onChange={(e) => setCreateForm({...createForm, degree_level: e.target.value as any})}
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 border px-3"
                                                >
                                                    <option value="bachelor">ปริญญาตรี</option>
                                                    <option value="bachelor_master">ปริญญาตรี-โท</option>
                                                    <option value="master">ปริญญาโท</option>
                                                    <option value="phd">ปริญญาเอก</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">ประเภทหลักสูตร</label>
                                                <select
                                                    value={createForm.program_type}
                                                    onChange={(e) => setCreateForm({...createForm, program_type: e.target.value as any})}
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 border px-3"
                                                >
                                                    <option value="normal">หลักสูตรปกติ</option>
                                                    <option value="international">นานาชาติ</option>
                                                </select>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ค่าธรรมเนียมต่อภาคการศึกษา (บาท)
                                    </label>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <span className="text-gray-500 sm:text-sm">฿</span>
                                        </div>
                                        <input
                                            type="number"
                                            value={modalMode === 'edit' ? editFeeInput : createForm.tuition_per_semester}
                                            onChange={(e) => modalMode === 'edit' 
                                                ? setEditFeeInput(e.target.value) 
                                                : setCreateForm({...createForm, tuition_per_semester: e.target.value})
                                            }
                                            className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 border"
                                            placeholder="0.00"
                                        />
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                            <span className="text-gray-500 sm:text-sm">บาท</span>
                                        </div>
                                    </div>
                                    <p className="mt-2 text-xs text-gray-500">* ราคามาตรฐานสำหรับการจัดทำงบประมาณ</p>
                                </div>

                                {modalMode === 'edit' && (
                                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                                        <div>
                                            <span className="block text-sm font-medium text-gray-900">สถานะการใช้งาน</span>
                                            <span className="text-xs text-gray-500">ปิดเพื่อซ่อนหลักสูตรนี้</span>
                                        </div>
                                        <button
                                            onClick={() => setEditStatusInput(!editStatusInput)}
                                            type="button"
                                            className={`${editStatusInput ? 'bg-green-500' : 'bg-gray-300'} 
                              relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                                        >
                                            <span aria-hidden="true" className={`${editStatusInput ? 'translate-x-5' : 'translate-x-0'} 
                              pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                                            />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                                <button onClick={handleSave} className="w-full inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">
                                    <Save className="w-4 h-4 mr-2" /> 
                                    {modalMode === 'edit' ? 'บันทึกการเปลี่ยนแปลง' : 'ยืนยันการเพิ่มหลักสูตร'}
                                </button>
                                <button onClick={() => setIsModalOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                    ยกเลิก
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}