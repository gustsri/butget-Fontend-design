"use client";
import Image from "next/image";
import Sidebar from "@/components/shared/Sidebar";
import { useState } from "react";


export default function Home() {

    return (
        <div className="flex min-h-screen">

            <main className="flex-1 p-6 pl-32 bg-gray-50">
                <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
                    <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
                        <Sidebar />

                    </main>
                </div>
            </main>
        </div>
    );
}