"use client";
import { useState } from "react";
import Sidebar from "@/components/shared/Sidebar";
import YearDropdown from "@/components/shared/year";
import RowItem from "@/components/plan/RowItem";


export default function Home() {
    const [activeTab, setActiveTab] = useState("year");

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />

            {/* Main content - เพิ่ม margin-left เท่ากับ width ของ sidebar */}
            <main className="flex-1 ml-64 p-6">
                <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">

                    <div className="flex items-center gap-2 border-b border-gray-200 p-4">
                        <YearDropdown onYearChange={() => { }} />
                    </div>

                    {/* Main Content */}
                    <div className="p-6">
                        <div className="mb-8 text-gray-800">
                            {/* Header */}
                            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                                <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
                                    คณะเทคโนโลยีสารสนเทศ
                                </h1>
                                <h2 className="text-xl font-semibold text-center text-gray-700 mb-1">
                                    ประมาณการรายรับเงินรายได้
                                </h2>
                                <p className="text-center text-gray-600">
                                    ประจำปีงบประมาณ 256x
                                </p>
                            </div>

                            {/* รายการรายรับ */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center bg-gray-100 px-4 py-2 rounded font-semibold">
                                    <span className="flex-1">ประเภทรายรับ</span>
                                    <span className="w-40 text-right ">จำนวนเงิน (บาท)</span>
                                </div>

                                {/* 1. เงินค่าบำรุงการศึกษา */}
                                <div className="divide-y divide-gray-200">

                                    {/* Section 1 */}
                                    <RowItem label="1. เงินค่าบำรุงการศึกษา และค่าธรรมเนียมต่าง ๆ และเงินอุดหนุนสมทบ" type="head" />
                                    <RowItem label="1.1 ค่าบำรุงการศึกษา ค่าธรรมเนียมการศึกษา ค่าธรรมเนียมต่าง ๆ และเงินอุดหนุนสมทบ" type="head" />

                                    <RowItem label="ภาคเรียนที่ 1/2567 (ต.ค.67)" value="6,899,220" indent />
                                    <RowItem label="ภาคเรียนที่ 2/2567 (มี.ค.68)" value="17,260,000" indent />
                                    <RowItem label="ภาคเรียนที่ 3/2567 (มิ.ย.68)" value="10,302,000" indent />
                                    <RowItem label="รายรับก่อนหักโอนให้หน่วยงานกลาง" value="" />
                                    <RowItem label="หักให้งบกลาง 35%" value="12,061,427" highlight="deduct" />
                                    <RowItem label="คงเหลือ" value="22,399,793" highlight="total" />

                                    <RowItem label="1.2 ค่าธรรมเนียมการรับนักศึกษา" value="3,500" indent />

                                    {/* Section 2 */}
                                    <RowItem label="2. เงินรายได้จากงานบริการ" type="head" />
                                    <RowItem label="- รายรับค่าลงทะเบียนจากประชุมวิชาการ" value="10,000" indent />

                                    {/* Section 3 */}
                                    <RowItem label="3. เงินผลประโยชน์ เช่น ค่าบริการโรงอาหาร เป็นต้น" type="head" />
                                    <RowItem label="" value="20,000" />

                                    {/* Section 4 */}
                                    <RowItem label="4. เงินรายได้การรับบริจาค หรือ เงินอุดหนุน" type="head" />
                                    <RowItem label="- รายได้จากการรับเงินอุดหนุนเพื่อการศึกษา" value="10,800" indent />

                                    {/* รวมรายรับ */}
                                    <RowItem label="รวมรายรับ" value="22,444,093" highlight="total" />

                                    {/* หักรายจ่ายบริการ */}
                                    <RowItem label="หักรายจ่ายบริการ" type="head" />
                                    <RowItem label="1. เงินเป็นค่าใช้จ่ายสำหรับนักศึกษาทั่วไป" value="13,184" indent />

                                    {/* ค่าตอบแทนพนักงานที่เป็นส่วนเกินสายราชการพนักงาน รายได้ เป็นพนักงาน เงินงบประมาณ */}
                                    <RowItem label="ค่าตอบแทนพนักงานที่เป็นส่วนเกินสายราชการพนักงาน รายได้ เป็นพนักงาน เงินงบประมาณ" type="head" />
                                    <RowItem label="1. เงินเป็นค่าตอบแทนพนักงานที่แต่งตั้งเป็นตำแหน่งพนักงาน 12 อัตรา" value="41,334" indent />
                                    <RowItem label="2. เงินเป็นค่าตอบแทนผู้ปฏิบัติราชการ (พนง.รายได้) (เบี้ยประชุม เงินรางวัล ฯลฯ 5 อัตรา 50%)" value="97,590" indent />

                                    {/* รวมรายรับสุทธิ */}
                                    <RowItem label="รวมรายรับสุทธิ" value="" highlight="total" />

                                </div>
                            </div>

                        </div>



                        {/* พื้นที่สำหรับ Section อื่น ๆ */}
                        <div className="mb-8">
                            <p>Section จะอยู่ที่นี่</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}