import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// =====================================================================
// 1. CONFIGURATION: กติกาของกองทุน (Fund Rules)
// ระบุว่ากองทุนรหัสนี้ "อนุญาต" ให้ใช้หมวดงบ (Category Code) ไหนบ้าง
// =====================================================================
const FUND_RULES: Record<string, string[]> = {
  '0100': ['51000', '52000', '54000', '55000'], // ทั่วไป: เกือบครบ
  '0200': ['51000', '52000', '53000', '54000', '55000'], // เพื่อการศึกษา
  '0300': ['52000', '54000'],                   // วิจัย
  '0400': ['51000', '52000', '55000'],          // บริการวิชาการ
  '0500': ['52000', '54000', '55000'],          // กิจการนักศึกษา
  '0600': ['52000', '53000'],                   // สินทรัพย์: ดำเนินงาน + ลงทุน
  '0701': ['54000', '55000'],                   // ศิลปวัฒนธรรม
  '0702': ['52000'],                            // สำรอง
  '0703': ['52000', '54000'],                   // พัฒนาบุคลากร
  '0705': ['54000'],                            // ยุทธศาสตร์: เฉพาะเงินอุดหนุน
}

// Default ถ้าไม่เจอใน list ให้ใช้อะไรบ้าง
const DEFAULT_ALLOWED_CATEGORIES = ['52000']

async function main() {
  console.log('🚀 Start Seeding Full IT Budget System...')
  const CURRENT_YEAR = 2569
  
  // =====================================================================
  // 0. CLEANUP: ล้างข้อมูลเก่าก่อนเสมอ (ป้องกัน 06004 ซ้ำ)
  // =====================================================================
  console.log('🧹 Cleaning old data...')
  // เรียงลำดับการลบจากลูกไปหาพ่อ (เพื่อเลี่ยง Foreign Key constraint)
  await prisma.budgetRecord.deleteMany()
  await prisma.activityFundAllocation.deleteMany()
  await prisma.projectActivity.deleteMany()
  await prisma.strategicPlan.deleteMany()
  await prisma.expenseItemMaster.deleteMany()
  await prisma.budgetCategory.deleteMany()
  await prisma.fundMaster.deleteMany()

  // Reset ID Sequence (เฉพาะ Postgres) เพื่อให้ ID เริ่มนับ 1 ใหม่สวยๆ
  try {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "project_activities" RESTART IDENTITY CASCADE;`)
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "strategic_plans" RESTART IDENTITY CASCADE;`)
  } catch (e) {
    console.log('⚠️ Skipping TRUNCATE (might not be Postgres or permission issue)')
  }


  // =====================================================================
  // 1. MASTER DATA: กองทุน (Fund Master)
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
  // 2. MASTER DATA: หมวดงบ (Categories) & รายการ (Items)
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

    // ✅ สร้าง Item ตัวเดียว ชื่อเดียวกับหมวด เพื่อใช้กรอกเงินระดับหมวด
    await prisma.expenseItemMaster.create({
      data: {
        code: cat.code, // ใช้รหัสเดียวกับหมวดเลยก็ได้ หรือเติมต่อท้าย
        name: `รวม${cat.name}`, // ชื่อรายการให้สื่อว่าเป็นยอดรวม
        category_id: newCat.id
      }
    })
  }

  // =====================================================================
  // 3. ORGANIZATION: โครงสร้างองค์กร (Strategic -> Activities)
  // =====================================================================
  console.log('running... Seeding Organization Hierarchy')

  // --- Level 1: ด้าน ---
  const side09 = await prisma.strategicPlan.create({
    data: { code: '09', name: 'ด้านการพัฒนาประชากร', level: 1 }
  })
  const side06 = await prisma.strategicPlan.create({
    data: { code: '06', name: 'ด้านวิทยาศาสตร์และเทคโนโลยี', level: 1 }
  })

  // --- Level 2: แผนงาน ---
  const planEd = await prisma.strategicPlan.create({
    data: { code: '09007', name: 'แผนงานจัดการศึกษาอุดมศึกษา', level: 2, parent_id: side09.id }
  })
  const planService = await prisma.strategicPlan.create({
    data: { code: '09010', name: 'แผนงานบริการวิชาการแก่สังคม', level: 2, parent_id: side09.id }
  })
  const planCulture = await prisma.strategicPlan.create({
    data: { code: '09011', name: 'แผนงานศาสนา ศิลปะ และวัฒนธรรม', level: 2, parent_id: side09.id }
  })
  const planResearch = await prisma.strategicPlan.create({
    data: { code: '06004', name: 'แผนงานวิจัย', level: 2, parent_id: side06.id }
  })

  // --- Level 3: งาน (Works) ---
  const workSupport = await prisma.projectActivity.create({
    data: { code: '0101', name: 'งานสนับสนุนการจัดการศึกษา', level: 3, plan_id: planEd.id }
  })
  const workSci = await prisma.projectActivity.create({
    data: { code: '0102', name: 'งานจัดการศึกษาด้านวิทยาศาสตร์และเทคโนโลยี', level: 3, plan_id: planEd.id }
  })
  // งานที่เป็นภารกิจพิเศษ (Group 3)
  const workService = await prisma.projectActivity.create({
    data: { code: '0201', name: 'งานบริการวิชาการแก่ชุมชน', level: 3, plan_id: planService.id }
  })
  const workCulture = await prisma.projectActivity.create({
    data: { code: '0301', name: 'งานทำนุบำรุงศิลปวัฒนธรรม', level: 3, plan_id: planCulture.id }
  })
  const workResearch = await prisma.projectActivity.create({
    data: { code: '0401', name: 'งานวิจัย พัฒนาและถ่ายทอดเทคโนโลยี', level: 3, plan_id: planResearch.id }
  })

  // --- Level 4: กิจกรรมรอง (Activities) ---
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
    // กิจกรรมรองภายใต้งานวิทย์ (0102)
    { code: '25', name: 'กิจกรรมสาขาเทคโนโลยีสารสนเทศ', parentId: workSci.id, planId: planEd.id },
  ]

  const activityMap = new Map<string, number>()

  // ใส่ Group 3 (Level 3) ลงใน Map ด้วย เพราะต้องใช้ Allocations
  activityMap.set('0201', workService.id)
  activityMap.set('0301', workCulture.id)
  activityMap.set('0401', workResearch.id)

  for (const act of activitiesData) {
    const created = await prisma.projectActivity.create({
      data: { code: act.code, name: act.name, level: 4, parent_id: act.parentId, plan_id: act.planId }
    })
    activityMap.set(act.code, created.id)
  }

  // --- Level 5: กิจกรรมย่อย (Sub Activities) ---
  // ลูกของ 25 สาขา IT
  const parent25ID = activityMap.get('25')
  if (parent25ID) {
    const sub211 = await prisma.projectActivity.create({
      data: { code: '211', name: 'ระดับปริญญาตรี', level: 5, parent_id: parent25ID, plan_id: planEd.id }
    })
    const sub212 = await prisma.projectActivity.create({
      data: { code: '212', name: 'ระดับปริญญาโท-เอก', level: 5, parent_id: parent25ID, plan_id: planEd.id }
    })

    // Add Sub Activities to Map
    activityMap.set('211', sub211.id)
    activityMap.set('212', sub212.id)
  }


  // =====================================================================
  // 4. ALLOCATIONS & BUDGET RECORDS: เชื่อมโยงและสร้างช่องกรอก
  // =====================================================================
  console.log('running... Generating Allocations & Budget Records')

  // Prepare Master Data in memory
  const allFunds = await prisma.fundMaster.findMany()
  const fundMap = new Map(allFunds.map(f => [f.code, f.id]))

  const allItems = await prisma.expenseItemMaster.findMany({ include: { category: true } })

  // Mapping: Activity Code -> List of Fund Codes
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

    if (!actId) {
      console.warn(`⚠️ Warning: Activity Code ${actCode} not found in DB map`)
      continue
    }

    for (const fundCode of fundCodes) {
      const fundId = fundMap.get(fundCode)
      if (!fundId) continue

      // 1. สร้าง Allocation (บอกว่ากิจกรรมนี้ ใช้กระเป๋านี้ได้)
      const allocation = await prisma.activityFundAllocation.create({
        data: {
          activity_id: actId,
          fund_id: fundId
        }
      })

      // 2. ดูกติกาว่ากองทุนนี้ เห็นงบหมวดไหนบ้าง
      const allowedCategories = FUND_RULES[fundCode] || DEFAULT_ALLOWED_CATEGORIES

      // 3. กรอง Item เฉพาะที่ได้รับอนุญาต
      const validItems = allItems.filter(item => allowedCategories.includes(item.category.code))

      // 4. สร้าง Record (ช่องกรอกเงิน) รอไว้เลย
      const recordsData = validItems.map(item => ({
        allocation_id: allocation.id,
        item_id: item.id,
        academic_year: CURRENT_YEAR,
        amount_gov: 0,
        amount_income: 0,
        updated_at: new Date() // Prisma createMany needs explicit dates sometimes depending on version
      }))

      if (recordsData.length > 0) {
        await prisma.budgetRecord.createMany({
          data: recordsData
        })
      }
    }
  }

  console.log('✅ Seeding Completed (Category View Mode)')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })