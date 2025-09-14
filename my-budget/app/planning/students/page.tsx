"use client";
import Image from "next/image";
import Sidebar from "@/components/shared/Sidebar";
import { useState } from "react";


export default function Home() {

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 p-6 pl-32 bg-gray-50">
               
            </main>
        </div>
    );
}