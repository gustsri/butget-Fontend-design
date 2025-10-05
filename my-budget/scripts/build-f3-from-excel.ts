// scripts/build-f3-from-excel.ts
// ts-node scripts/build-f3-from-excel.ts "path/to/F3-69 IT.xlsx"

import * as fs from "fs";
import * as path from "path";
import * as XLSX from "xlsx";

type Row = (string | number | null | undefined)[];
type Node = { code: string; label: string; children?: Node[] };
type Section = {
  sectionCode: string;
  sectionLabel: string;
  items: Array<{
    code?: string;
    label: string;
    budget: number;
    income: number;
    total: number;
    codes?: Record<string, string>;
    subItems?: Array<{
      label: string;
      budget: number;
      income: number;
      total: number;
      codes?: Record<string, string>;
    }>;
  }>;
};

/** ======== ปรับค่าตามชีตของคุณได้ที่นี่ ======== */
const SHEET_MATCH = /F3/i;        // ชื่อชีตที่มีคำว่า F3
const COL_CODE = 0;               // คอลัมน์ A (เริ่มที่ 0)
const COL_LABEL_PRIMARY = 2;      // คอลัมน์ C : ชื่อรายการหลัก
const COL_LABEL_ALT = 1;          // คอลัมน์ B : ถ้าบางแถว label อยู่ที่นี่
const NUM_LAST_K = 3;             // ดึงเลขท้ายสุด 3 คอลัมน์เป็น (budget, income, total)
/** ============================================= */

const filePath = process.argv[2];
if (!filePath) {
  console.error("Usage: ts-node scripts/build-f3-from-excel.ts <excel-file>");
  process.exit(1);
}

const wb = XLSX.readFile(filePath);
const sheetName =
  wb.SheetNames.find((n) => SHEET_MATCH.test(n)) || wb.SheetNames[0];
const sheet = wb.Sheets[sheetName];
const rows: Row[] = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as Row[];

// ช่วยฟังก์ชัน
const isCode = (v: any) =>
  typeof v === "string" &&
  /^\d{2,}$/.test(v.replace(/\D/g, "")); // ตัวเลขยาว (รหัส 2 หลักขึ้นไป)

const toNum = (v: any) => {
  const n = Number(String(v ?? "").replace(/[, ]/g, ""));
  return isFinite(n) ? n : 0;
};
const trim = (v: any) => String(v ?? "").trim();

const nonEmpty = (r: Row) => r.some((c) => c !== null && c !== undefined && String(c).trim() !== "");

// 1) กรองเฉพาะแถวที่ “น่าจะเป็นข้อมูลตาราง”
const body: Row[] = rows.filter(nonEmpty);

// 2) map เป็น records เบื้องต้น
type Raw = {
  code?: string;
  label?: string;
  tailNums: number[]; // ตัวเลขท้ายแถว
};
const raw: Raw[] = body.map((r) => {
  const code = trim(r[COL_CODE]);
  const label =
    trim(r[COL_LABEL_PRIMARY]) || trim(r[COL_LABEL_ALT]) || "";

  // ดึงเลขท้ายสุด 3 ตัวเป็น budget/income/total (ถ้าไม่ครบจะเป็น 0)
  const tail = r
    .slice(-NUM_LAST_K)
    .map((x) => toNum(x));

  return {
    code: isCode(code) ? code : undefined,
    label,
    tailNums: tail,
  };
});

// 3) ตัดหัวฟอร์ม: เริ่มนับตั้งแต่พบรหัสจริง (เช่น 51000) แถวแรก
const firstDataIdx = raw.findIndex((r) => !!r.code);
const list = firstDataIdx >= 0 ? raw.slice(firstDataIdx) : raw;

// 4) สร้าง budgetStructure (code-tree) และ f3Data (section + items)
// rule สร้าง tree: หมวดบน = code 5 หลัก (51000 / 52000 / 53000)
// children ชั้น 2 = code 5 หลักที่ share prefix 51xxx/52xxx/53xxx, หรือ 5+ หลักต่อยอด (51100, 51010)
// children ชั้น 3+ = โค้ดที่ยาวขึ้น (เช่น 5101010017) -> attach ใต้ node ที่ prefix ยาวสุด
const treeRoot: Node[] = [];
const findNode = (nodes: Node[], code: string): Node | undefined => {
  for (const n of nodes) {
    if (code === n.code) return n;
    const f = n.children ? findNode(n.children, code) : undefined;
    if (f) return f;
  }
  return undefined;
};
const ensureNode = (nodes: Node[], code: string, label: string) => {
  const existing = findNode(nodes, code);
  if (existing) return existing;
  // หา parent จาก prefix ที่ยาวที่สุดที่มีอยู่ใน tree
  let parent: Node | undefined;
  for (let len = code.length - 1; len >= 2; len--) {
    const pcode = code.slice(0, len);
    const n = findNode(nodes, pcode);
    if (n) {
      parent = n;
      break;
    }
  }
  const node: Node = { code, label, children: [] };
  if (parent) {
    parent.children = parent.children || [];
    parent.children.push(node);
  } else {
    nodes.push(node);
  }
  return node;
};

// 4.1 เติม tree จาก list
for (const r of list) {
  if (!r.code) continue;
  const c = r.code.replace(/\D/g, "");
  if (c.length < 2) continue;
  const label = r.label || c; // ถ้า label ว่าง ใช้ code ชั่วคราว
  ensureNode(treeRoot, c, label);
}

// 4.2 จัดเรียง children แต่ละชั้นตามเลขรหัส
const sortNodes = (nodes: Node[]) => {
  nodes.sort((a, b) => a.code.localeCompare(b.code));
  nodes.forEach((n) => n.children && sortNodes(n.children));
};
sortNodes(treeRoot);

// 5) แปลงเป็น sections สำหรับหน้าเว็บ
// section = โค้ด 5 หลักระดับบนสุด (51000 / 52000 / 53000)
const topSections = treeRoot.filter((n) => n.code.length === 5);

const sections: Section[] = topSections.map((sec) => ({
  sectionCode: sec.code,
  sectionLabel: sec.label,
  items: [],
}));

// helper: ดึงตัวเลขของ code จาก raw (ใช้ตัวท้าย r.tailNums เป็น budget/income/total)
const numberByCode = (code: string) => {
  const r = list.find((x) => x.code && x.code.replace(/\D/g, "") === code);
  if (!r) return { budget: 0, income: 0, total: 0 };
  // tailNums = [budget, income, total] (เดาจากท้ายแถว); เซฟสุดคือเอาตำแหน่งตามงบของคุณ
  const [b = 0, i = 0, t = 0] = r.tailNums;
  // ถ้า total ว่าง ให้คำนวณ b + i
  return { budget: b, income: i, total: t || b + i };
};

// เติม items + subItems ตามความลึก
for (const sec of sections) {
  const node = findNode(treeRoot, sec.sectionCode)!;
  if (!node) continue;

  const level1 = node.children || [];
  for (const l1 of level1) {
    const nums = numberByCode(l1.code);

    // โหนดลูกหลานของ l1 เป็น subItems (ไม่มีรหัสแยกที่หน้าเว็บ)
    const subs: Section["items"][number]["subItems"] = [];
    (l1.children || []).forEach((g) => {
      subs.push({
        label: g.label,
        ...numberByCode(g.code),
        codes: { structure: g.code },
      });
    });

    sec.items.push({
      code: l1.code,
      label: l1.label,
      ...nums,
      subItems: subs.length ? subs : undefined,
    });
  }
}

// 6) เขียนไฟล์
const outDir = path.resolve(process.cwd(), "src", "data");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const budgetStructurePath = path.join(outDir, "budgetStructure.json");
const f3DataPath = path.join(outDir, "f3Data.json");

fs.writeFileSync(budgetStructurePath, JSON.stringify(treeRoot, null, 2), "utf8");
fs.writeFileSync(f3DataPath, JSON.stringify(sections, null, 2), "utf8");

console.log("✅ Wrote:", budgetStructurePath);
console.log("✅ Wrote:", f3DataPath);
