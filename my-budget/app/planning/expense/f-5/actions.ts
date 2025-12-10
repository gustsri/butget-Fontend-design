// "use server";

// import { prisma } from "@/lib/prisma"; // ปรับ path ให้ตรงกับโปรเจ็คคุณ
// import { revalidatePath } from "next/cache";

// // Type definition เพื่อให้ Frontend เรียกใช้ได้ง่ายๆ
// export type ExpenseRow = {
//   structure_id: number;
//   code: string | null;
//   name: string;
//   level: number;
//   is_header: boolean;
//   parent_id: number | null;
//   item_id?: number;
//   gov_amount: number;
//   income_amount: number;
// };

// export async function getExpenseData(year: number) {
//   // 1. หา Budget ของปีนั้น ถ้าไม่มีให้สร้างใหม่ (Status: DRAFT)
//   let budget = await prisma.expenseBudget.findFirst({
//     where: { academic_year: year },
//   });

//   if (!budget) {
//     budget = await prisma.expenseBudget.create({
//       data: { academic_year: year, status: "DRAFT" },
//     });
//   }

//   // 2. ดึง Structure เฉพาะหมวด "EXPENSE_F5"
//   const structures = await prisma.structureCode.findMany({
//     where: {
//       category: 'EXPENSE_F5' // <--- Key สำคัญ: กรองเฉพาะหมวดนี้
//     },
//     orderBy: { 
//       id: 'asc' // เรียงตาม ID หรือ Code ตามต้องการ
//     }, 
//   });

//   // 3. ดึง Items ที่เคยบันทึกไว้ของปีนี้
//   const items = await prisma.expenseItem.findMany({
//     where: { budget_id: budget.id },
//   });

//   // 4. Merge Data: เอา Structure ตั้ง แล้วเอาเงินมาแปะ (ถ้าไม่มีใส่ 0)
//   const rows: ExpenseRow[] = structures.map((st) => {
//     const matchItem = items.find((i) => i.structure_id === st.id);
//     return {
//       structure_id: st.id,
//       code: st.code,
//       name: st.name,
//       level: st.level,
//       is_header: st.is_header,
//       parent_id: st.parent_id,
//       item_id: matchItem?.id,
//       gov_amount: matchItem ? Number(matchItem.gov_amount) : 0,
//       income_amount: matchItem ? Number(matchItem.income_amount) : 0,
//     };
//   });

//   return {
//     budget_id: budget.id,
//     status: budget.status,
//     rows: rows,
//   };
// }

// export async function saveExpenseItems(budgetId: number, items: { structure_id: number; gov: number; income: number }[]) {
//   try {
//     // ใช้ Transaction เพื่อความชัวร์ (ถ้าพัง ให้พังทั้งหมด ไม่บันทึกครึ่งๆ กลางๆ)
//     await prisma.$transaction(
//       items.map((item) => 
//         prisma.expenseItem.upsert({
//           where: {
//             // *** ต้องระวัง: ใน schema.prisma ต้องมี @@unique([budget_id, structure_id]) ***
//             budget_id_structure_id: { 
//                budget_id: budgetId, 
//                structure_id: item.structure_id 
//             }
//           },
//           update: {
//             gov_amount: item.gov,
//             income_amount: item.income,
//           },
//           create: {
//             budget_id: budgetId,
//             structure_id: item.structure_id,
//             gov_amount: item.gov,
//             income_amount: item.income,
//           }
//         })
//       )
//     );
    
//     revalidatePath("/expense"); 
//     return { success: true };
//   } catch (error) {
//     console.error("Save Error:", error);
//     return { success: false, error: "Failed to save data" };
//   }
// }