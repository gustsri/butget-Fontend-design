"use client";

import React, { useMemo, useState } from "react";
import Sidebar from "@/components/shared/Sidebar";
import YearDropdown from "@/components/shared/year";
import structure from "@/data/budgetStructure.json";
import initialData from "@/data/f3Data.json";

type Sub = { label: string; budget: number; income: number; total: number; codes?: Record<string,string> };
type Item = { code?: string; label: string; budget: number; income: number; total: number; codes?: Record<string,string>; subItems?: Sub[] };
type Section = { sectionCode: string; sectionLabel: string; items: Item[] };

const fmt=(n:number)=>Number(n||0).toLocaleString();

export default function ExpensePage() {
  const [year, setYear] = useState(2569);
  const [data, setData] = useState<Section[]>(initialData as Section[]);

  const grand = useMemo(()=>{
    let s=0;
    data.forEach(sec=>{
      sec.items.forEach(it=>{
        s+=(it.total||0);
        it.subItems?.forEach(sb=>s+=(sb.total||0));
      });
    });
    return s;
  },[data]);

  const onChange=(sIdx:number,iIdx:number,field:"budget"|"income"|"total",v:string,subIdx?:number)=>{
    setData(prev=>{
      const next = structuredClone(prev) as Section[];
      if(subIdx!==undefined){
        next[sIdx].items[iIdx].subItems![subIdx][field]=Number(v||0);
      }else{
        next[sIdx].items[iIdx][field]=Number(v||0);
      }
      return next;
    });
  };

  // แปะ path ชื่อหมวดจาก budgetStructure.json โดยใช้ prefix ของรหัส
  const findPath=(code?:string)=>{
    if(!code) return "";
    const walk=(nodes:any[], acc:string[]):string=>{
      for(const n of nodes){
        if(code.startsWith(n.code)){
          const here=[...acc, n.label];
          if(n.children?.length){
            const deeper = walk(n.children, here);
            return deeper || here.join(" → ");
          }
          return here.join(" → ");
        }
      }
      return "";
    };
    return walk(structure as any[], []);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar/>
      <main className="flex-1 ml-64 p-6">
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md border">
          <div className="p-6 border-b text-center">
            <h1 className="text-2xl font-bold">สรุปรายจ่าย (F-3)</h1>
            <div className="mt-2 flex items-center justify-center gap-6 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <span>ปีงบประมาณ:</span>
                <YearDropdown onYearChange={setYear}/>
                <span className="font-semibold">{year}</span>
              </div>
              <div>รวมทั้งสิ้น: <b className="text-blue-700">{fmt(grand)}</b> บาท</div>
            </div>
          </div>

          <div className="p-6">
            {data.map((sec, sIdx)=>(
              <div key={sec.sectionCode} className="mb-10">
                <div className="bg-gray-100 px-4 py-2 rounded font-semibold text-gray-800">
                  {sec.sectionLabel} ({sec.sectionCode})
                </div>

                <div className="overflow-x-auto mt-3">
                  <table className="min-w-full border border-gray-300 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="border px-3 py-2 w-40 text-left">รหัสโครงสร้าง</th>
                        <th className="border px-3 py-2 text-left">รายการ</th>
                        <th className="border px-3 py-2 w-56 text-left">หมวด/ลำดับ (จากโครงสร้าง)</th>
                        <th className="border px-3 py-2 w-28 text-right">งบประมาณ</th>
                        <th className="border px-3 py-2 w-28 text-right">รายได้</th>
                        <th className="border px-3 py-2 w-28 text-right">รวม</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sec.items.map((it, iIdx)=>(
                        <React.Fragment key={`${sec.sectionCode}-${it.code || it.label}-${iIdx}`}>
                          <tr className="hover:bg-gray-50">
                            <td className="border px-3 py-2 font-mono">{it.code || ""}</td>
                            <td className="border px-3 py-2">{it.label}</td>
                            <td className="border px-3 py-2 text-xs text-gray-600">{findPath(it.code)}</td>
                            {(["budget","income","total"] as const).map((f)=>(
                              <td key={f} className="border px-3 py-2 text-right">
                                <input
                                  type="number"
                                  className="w-full text-right bg-transparent focus:outline-none"
                                  value={it[f]}
                                  onChange={(e)=>onChange(sIdx,iIdx,f,e.target.value)}
                                />
                              </td>
                            ))}
                          </tr>

                          {/* บรรทัดลูก (ไม่มีรหัส) → indent + italic */}
                          {it.subItems?.map((sb, subIdx)=>(
                            <tr key={`${sec.sectionCode}-${iIdx}-sub-${subIdx}`} className="bg-gray-50">
                              <td className="border px-3 py-2 font-mono text-xs text-gray-500">
                                {sb.codes?.structure || ""}
                              </td>
                              <td className="border px-3 py-2 pl-8 italic text-gray-700">{sb.label}</td>
                              <td className="border px-3 py-2 text-xs text-gray-600">{findPath(sb.codes?.structure)}</td>
                              {(["budget","income","total"] as const).map((f)=>(
                                <td key={f} className="border px-3 py-2 text-right">
                                  <input
                                    type="number"
                                    className="w-full text-right bg-transparent focus:outline-none"
                                    value={sb[f]}
                                    onChange={(e)=>onChange(sIdx,iIdx,f,e.target.value,subIdx)}
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
