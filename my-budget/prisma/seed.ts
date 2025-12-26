import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// =====================================================================
// 📦 DATA SECTION: ข้อมูลรายการรายจ่าย (Level 8)
// =====================================================================
type ExpenseItemSeed = {
  catCode: string;
  code: string;
  name: string;
  formType: string;
};

const expenseItemsData: ExpenseItemSeed[] = [
  // --- 51000 งบบุคลากร ---
  { catCode: '51000', code: '5101010017', name: 'ค่าจ้างลูกจ้างสัญญาจ้างพนักงาน (งบประมาณเงินรายได้)', formType: 'salary' },
  { catCode: '51000', code: '5101010038', name: 'ค่าจ้างพนักงานสถาบันประเภทพิเศษ', formType: 'salary' },
  { catCode: '51000', code: '5101010000', name: 'เงินเดือนและค่าจ้าง (ยอดรวม)', formType: 'simple' },

  // --- 52000 งบดำเนินงาน ---
  { catCode: '52000', code: '5101010010', name: 'ค่าล่วงเวลา', formType: 'simple' },
  { catCode: '52000', code: '5104030201', name: 'ค่าเบี้ยประชุม', formType: 'simple' },
  { catCode: '52000', code: '5104010203', name: 'ค่าจ้างเหมาบริการ', formType: 'simple' },
  
  // ... เพิ่มรายการอื่นๆ ได้ที่นี่ ...
];


// =====================================================================
// 1. CONFIGURATION: กติกาของกองทุน (Fund Rules)
// =====================================================================

// กติกา 1: กองทุนนี้ อนุญาตให้ใช้ "หมวด" (Category) ไหนบ้าง?
const FUND_RULES: Record<string, string[]> = {
  '0100': ['51000', '52000', '54000', '55000'], // ทั่วไป
  '0200': ['51000', '52000', '53000', '54000', '55000'], // เพื่อการศึกษา
  '0300': ['52000', '54000'],                   // วิจัย
  '0400': ['51000', '52000', '55000'],          // บริการวิชาการ
  '0500': ['52000', '54000', '55000'],          // กิจการนักศึกษา
  '0600': ['52000', '53000'],                   // สินทรัพย์ถาวร
  '0701': ['54000', '55000'],                   // ศิลปวัฒนธรรม
  '0702': ['52000'],                            // สำรอง
  '0703': ['52000', '54000'],                   // พัฒนาบุคลากร
  '0705': ['54000'],                            // ยุทธศาสตร์
}

// 🔥 กติกา 2 (ใหม่!): กองทุนนี้ อนุญาตให้ใช้ "รายการ" (Item Code) ไหนบ้าง?
// - ใส่ 'ALL' แปลว่า อนุญาตทุกรายการในหมวดนั้น
// - ใส่รหัสรายการ แปลว่า อนุญาตเฉพาะรหัสนั้นๆ
const FUND_ITEM_WHITELIST: Record<string, string[]> = {
  // กองทุนทั่วไป: ให้เห็นหมดทุกรายการ
  '0100': ['ALL'], 

  // กองทุนสินทรัพย์: ให้เห็นแค่ ยอดรวมงบลงทุน (53000) และ ยอดรวมดำเนินงาน (52000)
  // (ค่าล่วงเวลา หรือ ค่าเบี้ยประชุม จะไม่โผล่มาที่นี่เพราะไม่ได้ใส่ไว้)
  '0600': ['53000', '52000'], 

  // กองทุนสำรอง: ให้เห็นแค่ยอดรวม (52000)
  '0702': ['52000'],
  
  // กองทุนยุทธศาสตร์: ให้เห็นแค่ยอดรวมอุดหนุน (54000) และรายการย่อยบางตัว
  '0705': ['54000', '5401020000'], // สมมติ
}

const DEFAULT_ALLOWED_CATEGORIES = ['52000']

async function main() {
  console.log('🚀 Start Seeding Full IT Budget System...')
  const CURRENT_YEAR = 2569

  // =====================================================================
  // 0. CLEANUP
  // =====================================================================
  console.log('🧹 Cleaning old data...')
  await prisma.budgetRecord.deleteMany()
  await prisma.activityFundAllocation.deleteMany()
  await prisma.projectActivity.deleteMany()
  await prisma.strategicPlan.deleteMany()
  await prisma.expenseItemMaster.deleteMany()
  await prisma.budgetCategory.deleteMany()
  await prisma.fundMaster.deleteMany()

  // Reset ID Sequence (ถ้าทำได้)
  try {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "project_activities" RESTART IDENTITY CASCADE;`)
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "strategic_plans" RESTART IDENTITY CASCADE;`)
  } catch (e) {
    console.log('⚠️ Skipping TRUNCATE')
  }

  // =====================================================================
  // 1. MASTER DATA: Funds
  // =====================================================================
  console.log('running... Seeding Funds')
  const funds = [
    { code: '0100', name: 'กองทุนทั่วไป' },
    { code: '0200', name: 'กองทุนเพื่อการศึกษา' },
    { code: '0300', name: 'กองทุนวิจัย' },
    { code: '0400', name: 'กองทุนบริการวิชาการ' },
    { code: '0500', name: 'กองทุนกิจการนักศึกษา' },
    { code: '0600', name: 'กองทุนสินทรัพย์ถาวร' },
    { code: '0701', name: 'กองทุนทำนุบำรุงศิลปวัฒนธรรม' },
    { code: '0702', name: 'กองทุนสำรอง' },
    { code: '0703', name: 'กองทุนพัฒนาบุคลากร' },
    { code: '0705', name: 'กองทุนยุทธศาสตร์' },
  ]
  for (const f of funds) {
    await prisma.fundMaster.create({ data: f })
  }

  // =====================================================================
  // 2. MASTER DATA: Categories & Items (Level 7 & 8)
  // =====================================================================
  console.log('running... Seeding Budget Structure')
  const categoriesData = [
    { code: '51000', name: 'งบบุคลากร' },
    { code: '52000', name: 'งบดำเนินงาน' },
    { code: '53000', name: 'งบลงทุน' },
    { code: '54000', name: 'งบเงินอุดหนุน' },
    { code: '55000', name: 'งบรายจ่ายอื่น' },
  ]

  for (const cat of categoriesData) {
    const newCat = await prisma.budgetCategory.create({
      data: { code: cat.code, name: cat.name }
    })
    // สร้าง Item "ยอดรวม" ประจำหมวด (รหัสเดียวกับหมวด)
    await prisma.expenseItemMaster.create({
      data: {
        code: cat.code, // ใช้รหัสหมวดเป็นรหัส Item
        name: `รวม${cat.name}`,
        category_id: newCat.id,
        form_type: 'simple'
      }
    })
  }

  // =====================================================================
  // 3. SEEDING EXPENSE ITEMS (จากตัวแปร expenseItemsData)
  // =====================================================================
  console.log('running... Seeding Expense Items from Internal Data')
  
  const categories = await prisma.budgetCategory.findMany()
  const catMap = new Map(categories.map(c => [c.code, c.id]))

  for (const item of expenseItemsData) {
    const categoryId = catMap.get(item.catCode)

    if (categoryId) {
      const existing = await prisma.expenseItemMaster.findFirst({
         where: { code: item.code }
      })
      
      if (existing) {
         await prisma.expenseItemMaster.update({
            where: { id: existing.id },
            data: { 
                name: item.name, 
                form_type: item.formType,
                category_id: categoryId
            }
         })
      } else {
         await prisma.expenseItemMaster.create({
            data: {
                code: item.code,
                name: item.name,
                category_id: categoryId,
                form_type: item.formType
            }
         })
      }
    } else {
        console.warn(`⚠️ Warning: Category ${item.catCode} not found for item ${item.name}`)
    }
  }

  // =====================================================================
  // 4. ORGANIZATION
  // =====================================================================
  console.log('running... Seeding Organization Hierarchy')
  
  const side09 = await prisma.strategicPlan.create({ data: { code: '09', name: 'ด้านการพัฒนาประชากร', level: 1 } })
  const side06 = await prisma.strategicPlan.create({ data: { code: '06', name: 'ด้านวิทยาศาสตร์และเทคโนโลยี', level: 1 } })
  
  const planEd = await prisma.strategicPlan.create({ data: { code: '09007', name: 'แผนงานจัดการศึกษาอุดมศึกษา', level: 2, parent_id: side09.id } })
  const planService = await prisma.strategicPlan.create({ data: { code: '09010', name: 'แผนงานบริการวิชาการแก่สังคม', level: 2, parent_id: side09.id } })
  const planCulture = await prisma.strategicPlan.create({ data: { code: '09011', name: 'แผนงานศาสนา ศิลปะ และวัฒนธรรม', level: 2, parent_id: side09.id } })
  const planResearch = await prisma.strategicPlan.create({ data: { code: '06004', name: 'แผนงานวิจัย', level: 2, parent_id: side06.id } })

  const workSupport = await prisma.projectActivity.create({ data: { code: '0101', name: 'งานสนับสนุนการจัดการศึกษา', level: 3, plan_id: planEd.id } })
  const workSci = await prisma.projectActivity.create({ data: { code: '0102', name: 'งานจัดการศึกษาด้านวิทยาศาสตร์และเทคโนโลยี', level: 3, plan_id: planEd.id } })
  const workService = await prisma.projectActivity.create({ data: { code: '0201', name: 'งานบริการวิชาการแก่ชุมชน', level: 3, plan_id: planService.id } })
  const workCulture = await prisma.projectActivity.create({ data: { code: '0301', name: 'งานทำนุบำรุงศิลปวัฒนธรรม', level: 3, plan_id: planCulture.id } })
  const workResearch = await prisma.projectActivity.create({ data: { code: '0401', name: 'งานวิจัย พัฒนาและถ่ายทอดเทคโนโลยี', level: 3, plan_id: planResearch.id } })

  const activitiesData = [
    { code: '10', name: 'กิจกรรมบริหารทั่วไป', parentId: workSupport.id, planId: planEd.id },
    { code: '11', name: 'กิจกรรมทะเบียนนักศึกษาและประมวลผล', parentId: workSupport.id, planId: planEd.id },
    { code: '13', name: 'กิจกรรมบริการคอมพิวเตอร์ทางวิชาการ', parentId: workSupport.id, planId: planEd.id },
    { code: '14', name: 'กิจกรรมบริหารวิชาการ', parentId: workSupport.id, planId: planEd.id },
    { code: '15', name: 'กิจกรรมพัฒนาคุณภาพนักศึกษา', parentId: workSupport.id, planId: planEd.id },
    { code: '16', name: 'กิจกรรมพัฒนาบุคลากรทางวิชาการ', parentId: workSupport.id, planId: planEd.id },
    { code: '17', name: 'กิจกรรมผลิตและพัฒนาสื่อการศึกษา', parentId: workSupport.id, planId: planEd.id },
    { code: '18', name: 'กิจกรรมพัฒนาหลักสูตรและการเรียนการสอน', parentId: workSupport.id, planId: planEd.id },
    { code: '19', name: 'กิจกรรมส่งเสริมการผลิตตำรา', parentId: workSupport.id, planId: planEd.id },
    { code: '25', name: 'กิจกรรมสาขาเทคโนโลยีสารสนเทศ', parentId: workSci.id, planId: planEd.id },
  ]

  const activityMap = new Map<string, number>()
  activityMap.set('0201', workService.id)
  activityMap.set('0301', workCulture.id)
  activityMap.set('0401', workResearch.id)

  for (const act of activitiesData) {
    const created = await prisma.projectActivity.create({
      data: { code: act.code, name: act.name, level: 4, parent_id: act.parentId, plan_id: act.planId }
    })
    activityMap.set(act.code, created.id)
  }

  const parent25ID = activityMap.get('25')
  if (parent25ID) {
    const sub211 = await prisma.projectActivity.create({ data: { code: '211', name: 'ระดับปริญญาตรี', level: 5, parent_id: parent25ID, plan_id: planEd.id } })
    const sub212 = await prisma.projectActivity.create({ data: { code: '212', name: 'ระดับปริญญาโท-เอก', level: 5, parent_id: parent25ID, plan_id: planEd.id } })
    activityMap.set('211', sub211.id)
    activityMap.set('212', sub212.id)
  }

  // =====================================================================
  // 5. ALLOCATIONS & BUDGET RECORDS (🔥 จุดสำคัญที่แก้ไข logic)
  // =====================================================================
  console.log('running... Generating Allocations & Budget Records')
  
  const allFunds = await prisma.fundMaster.findMany()
  const fundMap = new Map(allFunds.map(f => [f.code, f.id]))
  const allItems = await prisma.expenseItemMaster.findMany({ include: { category: true } })

  const allocationMap: Record<string, string[]> = {
    '10': ['0100', '0705', '0600', '0702'],
    '11': ['0100', '0705'],
    '13': ['0100', '0705'],
    '14': ['0200', '0705'],
    '15': ['0500', '0705'],
    '16': ['0703', '0705'],
    '17': ['0200', '0705'],
    '18': ['0200', '0705'],
    '19': ['0200'],
    '211': ['0200', '0705', '0600'],
    '212': ['0200'],
    '0201': ['0400', '0705'],
    '0301': ['0701'],
    '0401': ['0300', '0705'],
  }

  for (const [actCode, fundCodes] of Object.entries(allocationMap)) {
    const actId = activityMap.get(actCode)
    if (!actId) continue

    for (const fundCode of fundCodes) {
      const fundId = fundMap.get(fundCode)
      if (!fundId) continue

      const allocation = await prisma.activityFundAllocation.create({
        data: { activity_id: actId, fund_id: fundId }
      })

      // Logic เดิม: กรองระดับหมวด (Category)
      const allowedCategories = FUND_RULES[fundCode] || DEFAULT_ALLOWED_CATEGORIES
      
      // ✅ Logic ใหม่ (Whitelist): กรองระดับรายการ (Item)
      // ถ้าไม่ได้กำหนดไว้ใน whitelist ให้ถือว่าอนุญาตหมด ('ALL')
      const allowedSpecificItems = FUND_ITEM_WHITELIST[fundCode] || ['ALL']

      const validItems = allItems.filter(item => {
        // 1. เช็คว่าอยู่ในหมวดที่อนุญาตไหม (Logic เดิม)
        const isCatAllowed = allowedCategories.includes(item.category.code)
        
        // 2. เช็คว่าอยู่ในรายการที่อนุญาตไหม (Logic ใหม่)
        const isItemAllowed = 
            allowedSpecificItems.includes('ALL') || 
            allowedSpecificItems.includes(item.code || '')

        return isCatAllowed && isItemAllowed
      })

      const recordsData = validItems.map(item => ({
        allocation_id: allocation.id,
        item_id: item.id,
        academic_year: CURRENT_YEAR,
        amount_gov: 0,
        amount_income: 0,
        updated_at: new Date()
      }))

      if (recordsData.length > 0) {
        await prisma.budgetRecord.createMany({ data: recordsData })
      }
    }
  }

  console.log('✅ Seeding Completed Successfully')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })