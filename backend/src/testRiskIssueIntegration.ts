import { prisma } from './config/prisma';
import { riskIssueService } from './modules/riskIssue/riskIssue.service';
import { DelayCategory, SeverityLevel } from '@gov-platform/shared';

async function runRiskIssueIntegrationTest() {
  console.log('🧪 Starting Phase 7 Delays, Risks, Issues & Inter-Departmental Escalations Test...');

  // Fetch target project
  const project = await prisma.project.findFirst();
  if (!project) throw new Error('No project found in database!');

  const officer = await prisma.user.findFirst();
  if (!officer) throw new Error('No user found in database!');

  console.log(`📌 Target Project: ${project.projectCode} - ${project.name}`);
  console.log(`   Initial Schedule Variance: ${project.scheduleVariancePct}%`);

  // 1. Log Project Delay Record
  console.log('⏳ Logging 45-day Land Acquisition project delay...');
  const delay = await riskIssueService.logDelay(officer, {
    projectId: project.id,
    category: DelayCategory.LAND_ACQUISITION,
    delayDays: 45,
    financialImpactInr: 7500000.0, // ₹75 Lakhs
    reasonDescription: 'Land acquisition survey bottleneck in Block 14-A',
    mitigationPlan: 'Expedite Revenue Officer land compensation payout',
  });

  console.log(`✅ Delay Logged ID: ${delay.id}, Category: ${delay.category}, Impact: +${delay.delayDays} days`);

  const updatedProject = await prisma.project.findUnique({ where: { id: project.id } });
  console.log(`📊 Updated Schedule Variance: ${updatedProject?.scheduleVariancePct}%`);

  // 2. Register Project Risk Entry
  console.log('⚡ Registering Risk Matrix entry...');
  const risk = await riskIssueService.logRisk(officer, {
    projectId: project.id,
    riskTitle: 'Sub-surface Rock Strata Foundation Risk',
    riskDescription: 'Unforeseen hard rock formation at Ch. 4+200 requiring specialized piling machinery',
    severity: SeverityLevel.HIGH,
    probabilityPct: 75,
    mitigationStrategy: 'Deploy heavy hydraulic rotary drilling rig',
  });

  console.log(`✅ Risk Registered ID: ${risk.id}, Severity: ${risk.severity}, Probability: ${risk.probabilityPct}%`);

  // 3. Raise Critical Field Blocker Issue & Verify Automated SLA Escalation
  console.log('🚨 Raising CRITICAL Field Blocker Issue (Requires Inter-Departmental Escalation)...');
  const issue = await riskIssueService.raiseIssue(officer, {
    projectId: project.id,
    issueTitle: 'Unscheduled High Voltage Overhead Power Line Relocation Blocker',
    issueDescription: '66kV GETCO transmission line passes directly through superstructure alignment.',
    severity: SeverityLevel.CRITICAL,
    targetDepartmentCode: 'GETCO',
  });

  console.log(`📋 Issue Raised ID: ${issue.id}, Title: "${issue.issueTitle}"`);
  console.log(`⚡ SLA Escalation Status: isEscalated = ${issue.isEscalated} | Escalated To: ${issue.escalatedToRole}`);

  if (!issue.isEscalated || issue.escalatedToRole !== 'CHIEF_ENGINEER') {
    throw new Error('Automated escalation gate failed for CRITICAL issue!');
  }

  // 4. Resolve Field Blocker Issue
  console.log('🔧 Executing Administrative Issue Resolution & Verification...');
  const resolveRes = await riskIssueService.resolveIssue(officer, {
    issueId: issue.id,
    resolutionNotes: 'GETCO Chief Engineer approved emergency line shutdown and re-routing order.',
  });

  console.log(`✅ Resolution Message: ${resolveRes.message}`);

  const dbIssue = await prisma.issueRecord.findUnique({ where: { id: issue.id } });
  console.log(`✅ Verified DB Resolution Status: isResolved = ${dbIssue?.isResolved}`);

  console.log('🎉 Phase 7 Integration Test PASSED Cleanly!');
}

runRiskIssueIntegrationTest()
  .catch((err) => {
    console.error('❌ Integration Test Failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
