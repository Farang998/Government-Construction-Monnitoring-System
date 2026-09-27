import { prisma } from './config/prisma';
import { completionService } from './modules/completion/completion.service';
import { SeverityLevel } from '@gov-platform/shared';

async function runCompletionIntegrationTest() {
  console.log('🧪 Starting Phase 9 Project Completion, DLP Warranty & Asset Handover Test...');

  // 1. Fetch target project and user
  const project = await prisma.project.findFirst();
  if (!project) throw new Error('No project found in database!');

  const user = await prisma.user.findFirst();
  if (!user) throw new Error('No user found in database!');

  console.log(`📌 Target Project: ${project.projectCode} - ${project.name}`);
  console.log(`   Initial Status: ${project.status}`);

  // 2. Issue Provisional Completion Certificate (PCC)
  console.log('\n📜 Step 1: Issuing Provisional Completion Certificate (PCC) & Registering 24-Month DLP Warranty...');
  const certNumber = `PCC-2026-${project.projectCode.slice(-4)}-${Date.now().toString().slice(-4)}`;
  const cert = await completionService.issueCompletionCertificate(user, {
    projectId: project.id,
    certificateType: 'PROVISIONAL',
    certificateNumber: certNumber,
    dlpDurationMonths: 24,
    remarks: 'Road & Bridge work completed as per IRC standard specifications.',
  });

  console.log(`✅ Certificate Issued: ${cert.certificateNumber} (${cert.certificateType})`);
  console.log(`   DLP Start: ${new Date(cert.dlpStartDate).toLocaleDateString()}`);
  console.log(`   DLP End: ${new Date(cert.dlpEndDate).toLocaleDateString()} (${cert.dlpDurationMonths} Months)`);

  const updatedProj1 = await prisma.project.findUnique({ where: { id: project.id } });
  console.log(`📊 Updated Project Status: ${updatedProj1?.status} | Physical Progress: ${updatedProj1?.physicalProgressPct}%`);

  if (updatedProj1?.status !== 'COMPLETION_CERTIFIED' || Number(updatedProj1.physicalProgressPct) !== 100) {
    throw new Error('Project status was not updated to COMPLETION_CERTIFIED or physical progress was not set to 100%!');
  }

  // 3. Log Defect Liability Period (DLP) Warranty Defect
  console.log('\n🚨 Step 2: Logging DLP Warranty Defect Ticket during 24-month warranty...');
  const defect = await completionService.logDlpDefect(user, {
    projectId: project.id,
    defectTitle: 'Expansion Joint Bitumen Seepage on Deck Slab',
    description: 'Minor bitumen elastomeric seal distress noticed near Abutment A2.',
    locationRef: 'Ch. 2+450 Abutment A2',
    severity: SeverityLevel.MEDIUM,
  });

  console.log(`✅ DLP Defect Ticket Logged ID: ${defect.id}`);
  console.log(`   Title: "${defect.defectTitle}" | Severity: ${defect.severity} | Rectified: ${defect.isRectified}`);

  // 4. Rectify DLP Defect Ticket
  console.log('\n🔧 Step 3: Contractor Rectification & Inspecting Officer Verification...');
  const rectResult = await completionService.rectifyDlpDefect(user, {
    defectId: defect.id,
    rectificationNotes: 'Polymer modified bitumen sealant replaced; re-tested under heavy load.',
  });

  console.log(`✅ Rectification Verified: ${rectResult.message}`);

  // 5. Dual EE/SE Retention Security Deposit & PBG Release Sign-off
  console.log('\n🛡️ Step 4: Dual Executive Engineer (EE) & Superintending Engineer (SE) Security Deposit Release...');
  const releaseResult = await completionService.releaseGuarantee(user, {
    projectId: project.id,
    guaranteeType: 'BOTH',
    executiveEngineerSignOff: true,
    superintendingEngineerSignOff: true,
    remarks: 'DLP warranty expired with zero unrectified defects. 5% Retention and PBG cleared for refund.',
  });

  console.log(`✅ Guarantee Release Result: ${releaseResult.message}`);

  // 6. Complete State Asset Handover & Final Project Closure
  console.log('\n🏛️ Step 5: Registering Infrastructure Asset in State Asset Register & Final Project Closure...');
  const assetCode = `AST-2026-${project.projectCode.slice(-4)}-01`;
  const handover = await completionService.completeAssetHandover(user, {
    projectId: project.id,
    assetCode,
    assetName: project.name,
    receivingDepartment: 'Roads & Buildings Department (State Highways O&M)',
    assetValuationInr: Number(project.sanctionedCostInr || project.estimatedCostInr),
    maintenanceDivision: 'Ahmedabad Highways O&M Division 01',
    remarks: 'State Highway Asset registered for annual O&M maintenance budget allocation.',
  });

  console.log(`✅ State Asset Registered: ${handover.assetCode}`);
  console.log(`   Asset Name: "${handover.assetName}"`);
  console.log(`   Receiving Dept: ${handover.receivingDepartment}`);
  console.log(`   Valuation: ₹ ${(handover.assetValuationInr / 10000000).toFixed(2)} Crore`);
  console.log(`   Handover Status: ${handover.handoverStatus}`);

  const finalProj = await prisma.project.findUnique({ where: { id: project.id } });
  console.log(`\n🏆 Final Project Lifecycle Status: ${finalProj?.status} ("${finalProj?.currentStage}")`);

  if (finalProj?.status !== 'CLOSED') {
    throw new Error('Project status was not updated to CLOSED!');
  }

  console.log('\n🎉 Phase 9 Completion, DLP Warranty & Asset Handover Test Passed Successfully!\n');
}

runCompletionIntegrationTest()
  .catch((err) => {
    console.error('❌ Phase 9 Integration Test Failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
