import { prisma } from './config/prisma';
import { tenderService } from './modules/tender/tender.service';
import { contractService } from './modules/contract/contract.service';

async function runContractIntegrationTest() {
  console.log('🧪 Starting Phase 4 Tenders, Contracts & Vendor Integration Test...');

  // 1. Fetch a Sanctioned Project
  const project = await prisma.project.findFirst();

  if (!project) {
    throw new Error('Test project GJ-RNB-SUR-2026-000002 not found!');
  }

  console.log(`📌 Target Project: ${project.projectCode} - ${project.name}, Est Cost: ₹${project.estimatedCostInr}`);

  // 2. Fetch Contractors
  const contractors = await contractService.getContractors();
  if (contractors.length < 3) {
    throw new Error('At least 3 registered contractors required for test!');
  }

  const c1 = contractors[0]!;
  const c2 = contractors[1]!;
  const c3 = contractors[2]!;

  console.log(`👷 Registered Contractors: ${c1.companyName}, ${c2.companyName}, ${c3.companyName}`);

  // 3. Create Tender Notice (NIT)
  const nitNoticeNo = `TN-TEST-${Date.now()}`;
  const tender = await tenderService.createTender({
    projectId: project.id,
    tenderNoticeNo: nitNoticeNo,
    portalReferenceId: 'E-PROC-TEST-2026-99',
    estimatedTenderAmount: 450000000.00, // ₹45 Crore estimate
    nitPublishDate: '2026-04-01',
    bidSubmissionEndDate: '2026-05-01',
    bidOpeningDate: '2026-05-05',
  });

  console.log(`📄 Published Tender Notice: ${tender.tenderNoticeNo}, Status: ${tender.status}`);

  // 4. Submit Competitive Bids (L1, L2, L3)
  console.log('💰 Submitting competitive contractor bids...');
  await tenderService.submitBid({
    tenderId: tender.id,
    contractorId: c1.id,
    bidAmountInr: 441000000.00, // L1 lowest bid (2% below estimate)
    remarks: 'Bidder 1 Tender Proposal',
  });

  await tenderService.submitBid({
    tenderId: tender.id,
    contractorId: c2.id,
    bidAmountInr: 455000000.00, // L2 bid (+1.1% above estimate)
    remarks: 'Bidder 2 Tender Proposal',
  });

  await tenderService.submitBid({
    tenderId: tender.id,
    contractorId: c3.id,
    bidAmountInr: 468000000.00, // L3 bid (+4% above estimate)
    remarks: 'Bidder 3 Tender Proposal',
  });

  // 5. Verify Comparative Matrix Evaluation & L1 Ranking
  const evaluatedTenders = await tenderService.getTenders(project.id);
  const targetTender = evaluatedTenders.find((t) => t.id === tender.id)!;

  console.log(`📊 Tender Bids Evaluated Count: ${targetTender.bids?.length}`);
  const l1Bid = targetTender.bids?.find((b) => b.rank === 1);
  if (!l1Bid || l1Bid.contractorId !== c1.id) {
    throw new Error('Bid evaluation failed: Expected Contractor 1 to be L1 lowest bidder!');
  }

  console.log(`🏆 L1 Lowest Bidder Verified: ${l1Bid.contractorName} - ₹${l1Bid.bidAmountInr.toLocaleString('en-IN')} (Variance: ${l1Bid.variancePct}%)`);

  // 6. Award Contract & Issue Work Order
  console.log('✍️ Awarding Contract & Issuing Statutory Work Order...');
  const contract = await contractService.awardContract({
    tenderId: tender.id,
    contractorId: l1Bid.contractorId,
    contractAgreementNo: `GJ-RNB-CON-2026-TEST-${Date.now().toString().slice(-4)}`,
    workOrderNo: `GJ-RNB-WO-2026-TEST-${Date.now().toString().slice(-4)}`,
    workOrderDate: '2026-05-10',
    contractValueInr: l1Bid.bidAmountInr,
    scheduledStartDate: '2026-06-01',
    scheduledEndDate: '2027-11-30',
    pbgAmountInr: Math.round(l1Bid.bidAmountInr * 0.05),
    pbgValidityDate: '2028-05-31',
  });

  console.log(`📜 Contract Awarded: Agreement #${contract.contractAgreementNo}, Work Order #${contract.workOrderNo}`);
  console.log(`🛡️ Performance Bank Guarantee Recorded: ₹${contract.pbgAmountInr.toLocaleString('en-IN')}`);

  // 7. Verify Updated Project Status & Initialized Milestones
  const updatedProject = await prisma.project.findUnique({ where: { id: project.id } });
  console.log(`🚀 Updated Project Status: ${updatedProject?.status}`);
  console.log(`📍 Updated Project Stage: ${updatedProject?.currentStage}`);

  const milestones = await prisma.milestone.findMany({ where: { projectId: project.id } });
  console.log(`🎯 Initialized Project Milestones Count: ${milestones.length}`);
  milestones.forEach((m, idx) => {
    console.log(`   [Milestone ${idx + 1}] ${m.title} (Weight: ${m.weightagePct}%, Status: ${m.status})`);
  });

  if (updatedProject?.status !== 'CONTRACT_AWARDED' || milestones.length === 0) {
    throw new Error('Contract award verification failed: Project status or milestones not updated!');
  }

  console.log('🎉 PHASE 4 INTEGRATION TEST COMPLETED SUCCESSFULLY!');
  process.exit(0);
}

runContractIntegrationTest().catch((e) => {
  console.error('❌ Integration Test Failed:', e);
  process.exit(1);
});
