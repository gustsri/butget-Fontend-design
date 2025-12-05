// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Start seeding Revenue Data (Fiscal Year 2568)...')

  const year = 2568; // ปีงบประมาณที่เราจะทำ

  // 1. ลบของเก่าทิ้งก่อน (ถ้ามี)
  const existingBudget = await prisma.revenueBudget.findUnique({ where: { budget_year: year } });
  if (existingBudget) {
    await prisma.revenueBudget.delete({ where: { budget_year: year } });
  }

  // 2. สร้าง Header งบปี 2568
  const budget = await prisma.revenueBudget.create({
    data: {
      budget_year: year,
      total_amount: 0,
      net_amount: 0,
      status: 'draft',
      is_active: true,
    }
  });

  // 3. ข้อมูล Template (Logic ตามที่คุณแจ้ง)
  const sectionsData = [
    {
      name: "1. เงินค่าบำรุงการศึกษา และค่าธรรมเนียมต่าง ๆ และเงินอุดหนุนสมทบ",
      items: [
        { name: "1.1 ค่าบำรุงการศึกษาฯ (รวมเหมาจ่ายระดับบัณฑิตศึกษา)", amount: 0 },
        // --- ก้อนที่ 1: ตกค้างจากปีก่อน ---
        { name: "ภาคเรียนที่ 1/2567 (ต.ค.-พ.ย.67) - จำนวน 2 เดือน", amount: 0 },
        // --- ก้อนที่ 2: เต็มเม็ดเต็มหน่วย ---
        { name: "ภาคเรียนที่ 2/2567 (ธ.ค.67-เม.ย.68) - เต็มภาคการศึกษา", amount: 0 },
        // --- ก้อนที่ 3: ล่วงหน้า ---
        { name: "ภาคเรียนที่ 1/2568 (ก.ค.-ก.ย.68) - จำนวน 3 เดือน", amount: 0 },
        
        { name: "หักให้งบกลาง 35%", amount: 0, is_deduction: true }, 
        { name: "1.2 ค่าธรรมเนียมการรับนักศึกษา", amount: 0 },
      ]
    },
    {
      name: "2. เงินรายได้จากงานบริการ",
      items: [
        { name: "รายรับค่าลงทะเบียนจากประชุมวิชาการ", amount: 0 }
      ]
    },
    {
      name: "3. เงินผลประโยชน์ (เช่น ค่าบำรุงโรงอาหาร)",
      items: [
        { name: "รายได้จากการบริการโรงอาหาร", amount: 0 }
      ]
    },
    {
      name: "4. เงินรายได้จากการรับบริจาค หรือ เงินอุดหนุน",
      items: [
        { name: "รายได้จากการรับเงินสนับสนุนเพื่อการศึกษา", amount: 0 }
      ]
    }
  ];

  // 4. วนลูป Insert
  for (let i = 0; i < sectionsData.length; i++) {
    const sectionData = sectionsData[i];
    const section = await prisma.revenueSection.create({
      data: {
        revenue_budget_id: budget.revenue_budget_id,
        section_name: sectionData.name,
        sort_order: i + 1,
      }
    });

    for (let j = 0; j < sectionData.items.length; j++) {
      const itemData = sectionData.items[j];
      await prisma.revenueItem.create({
        data: {
          section_id: section.section_id,
          item_name: itemData.name,
          amount: itemData.amount,
          sort_order: j + 1,
          is_deduction: itemData.is_deduction || false,
        }
      });
    }
  }

  console.log('✅ Seeding 2568 Completed!');
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })