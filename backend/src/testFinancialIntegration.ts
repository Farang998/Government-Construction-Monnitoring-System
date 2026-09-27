import { prisma } from './config/prisma';
import { financialService } from './modules/financial/financial.service';

async function runFinancialIntegrationTest() {
  console.log('🧪 Starting Phase 8 Financials, Fund Allocation, Bills & Treasury Payment Disbursements Test...');

  // 1. Fetch target project and user
  const project = await prisma.project.findFirst();
  if (!project) throw new Error('No project found in database!');

  const user = await prisma.user.findFirst();
  if (!user) throw new Error('No user found in database!');

  console.log(`📌 Target Project: ${project.projectCode} - ${project.name}`);
  console.log(`   Initial Sanctioned Cost: ₹ ${project.sanctionedCostInr ? Number(project.sanctionedCostInr).toLocaleString('en-IN') : '0'}`);
  console.log(`   Initial Expenditure: ₹ ${Number(project.totalExpenditureInr).toLocaleString('en-IN')}`);
  console.log(`   Initial Financial Progress: ${Number(project.financialProgressPct)}%`);

  // 2. Create Budget Sanction Allocation
  console.log('\n🏛️ Step 1: Registering Administrative Budget Sanction Order (₹ 10 Crore under 5054-03-337)...');
  const sanction = await financialService.createBudgetSanction(user, {
    projectId: project.id,
    sanctionType: 'ADMINISTRATIVE_APPROVAL',
    orderNumber: `SANCTION-2026-${Date.now().toString().slice(-4)}`,
    orderDate: new Date().toISOString().split('T')[0]!,
    sanctionAmount: 100000000, // ₹ 10 Cr
    headOfAccount: '5054-03-337-01-Capital Outlay on Roads & Bridges',
    financialYear: '2026-2027',
    remarks: 'Approved by State Finance Department',
  });

  console.log(`✅ Sanction Created ID: ${sanction.id}, Order: ${sanction.orderNumber}, Amount: ₹ ${Number(sanction.sanctionAmount).toLocaleString('en-IN')}`);

  const projectAfterSanction = await prisma.project.findUnique({ where: { id: project.id } });
  console.log(`📊 Updated Sanctioned Cost: ₹ ${Number(projectAfterSanction?.sanctionedCostInr).toLocaleString('en-IN')}`);

  // 3. Generate Contractor Running Account (RA) Bill
  console.log('\n📄 Step 2: Generating Contractor Running Account (RA) Bill with Statutory Tax Deductions...');
  const grossClaim = 5000000; // ₹ 50 Lakhs
  const bill = await financialService.createRaBill(user, {
    projectId: project.id,
    grossClaimAmountInr: grossClaim,
    measurementBookRef: `MB-2026-${project.projectCode.slice(-4)}-01`,
    payeeName: 'Larsen & Toubro Infrastructure Ltd',
    headOfAccount: '5054-03-337-01-Capital Works',
    billDate: new Date().toISOString().split('T')[0]!,
  });

  console.log(`✅ RA Bill Generated Voucher #${bill.voucherNo}`);
  console.log(`   Gross Claim Amount: ₹ ${Number(bill.grossClaimAmountInr).toLocaleString('en-IN')}`);
  console.log(`   IT TDS (2%): ₹ ${Number(bill.itTdsInr).toLocaleString('en-IN')}`);
  console.log(`   GST TDS (2%): ₹ ${Number(bill.gstTdsInr).toLocaleString('en-IN')}`);
  console.log(`   Retention (5%): ₹ ${Number(bill.retentionInr).toLocaleString('en-IN')}`);
  console.log(`   Labour Cess (1%): ₹ ${Number(bill.labourCessInr).toLocaleString('en-IN')}`);
  console.log(`   Total Deductions (10%): ₹ ${Number(bill.totalDeductionsInr).toLocaleString('en-IN')}`);
  console.log(`   Net Payable Amount: ₹ ${Number(bill.netPayableAmountInr).toLocaleString('en-IN')}`);

  if (Number(bill.totalDeductionsInr) !== grossClaim * 0.10) {
    throw new Error(`Statutory deduction calculation mismatch! Expected ₹${grossClaim * 0.10}, got ₹${bill.totalDeductionsInr}`);
  }

  // 4. Treasury E-Payment Advice Disbursement
  console.log('\n💳 Step 3: Executing State Cyber Treasury E-Payment Advice Disbursement...');
  const treasuryVoucherNo = `TV-TREASURY-${Date.now().toString().slice(-6)}`;
  const disburseResult = await financialService.disbursePayment(user, {
    expenditureId: bill.id,
    treasuryVoucherNo,
    bankAdviceRef: 'PFMS_DIRECT_DISBURSEMENT',
  });

  console.log(`✅ Treasury Disbursement Result: ${disburseResult.message}`);
  console.log(`   Treasury Voucher Ref: ${treasuryVoucherNo}`);

  // 5. Verify Project Financial Aggregate Recalculation
  const finalProject = await prisma.project.findUnique({ where: { id: project.id } });
  console.log('\n📈 Final Project Financial Metrics Verification:');
  console.log(`   Total Sanctioned Cost: ₹ ${Number(finalProject?.sanctionedCostInr).toLocaleString('en-IN')}`);
  console.log(`   Total Expenditure: ₹ ${Number(finalProject?.totalExpenditureInr).toLocaleString('en-IN')}`);
  console.log(`   Calculated Financial Progress: ${Number(finalProject?.financialProgressPct)}%`);

  if (!finalProject || Number(finalProject.totalExpenditureInr) <= 0) {
    throw new Error('Project total expenditure was not updated!');
  }

  console.log('\n🎉 Phase 8 Financials & Treasury Disbursement Integration Test Passed Successfully!\n');
}

runFinancialIntegrationTest()
  .catch((err) => {
    console.error('❌ Phase 8 Integration Test Failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
