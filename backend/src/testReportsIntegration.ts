import { prisma } from './config/prisma';
import { reportsService } from './modules/reports/reports.service';

async function runReportsIntegrationTest() {
  console.log('🧪 Starting Phase 10 Executive Analytics, Public Transparency & Dossier Test...');

  // 1. Fetch Executive Analytics
  console.log('\n📊 Step 1: Computing State Executive Command Analytics Dashboard...');
  const analytics = await reportsService.getExecutiveAnalytics();

  console.log(`✅ Analytics Computed:`);
  console.log(`   Total Projects Statewide: ${analytics.totalProjects}`);
  console.log(`   Total Sanctioned Budget: ₹ ${(analytics.totalSanctionedCostInr / 10000000).toFixed(2)} Crore`);
  console.log(`   Total Expenditure: ₹ ${(analytics.totalExpenditureInr / 10000000).toFixed(2)} Crore`);
  console.log(`   Avg Physical Progress: ${analytics.avgPhysicalProgressPct}%`);
  console.log(`   Avg Financial Progress: ${analytics.avgFinancialProgressPct}%`);
  console.log(`   District Breakdown Count: ${analytics.districtMetrics.length}`);
  console.log(`   Department Breakdown Count: ${analytics.departmentMetrics.length}`);

  if (analytics.totalProjects <= 0) {
    throw new Error('Analytics failed to calculate registered projects!');
  }

  // 2. Fetch Public Transparency Projects (Unauthenticated)
  console.log('\n🌐 Step 2: Querying Public Citizen Transparency Work Registry...');
  const publicProjects = await reportsService.getPublicProjects();

  console.log(`✅ Public Registry Fetched: ${publicProjects.length} work orders visible to citizens.`);
  if (publicProjects.length > 0) {
    const first = publicProjects[0]!;
    console.log(`   Sample Public Project: ${first.projectCode} - "${first.name}"`);
    console.log(`   District: ${first.district} | Progress: ${first.physicalProgressPct}%`);
  }

  // 3. Submit Public Citizen Feedback / Grievance
  console.log('\n📝 Step 3: Submitting Public Citizen Defect / Grievance Report...');
  const targetProject = await prisma.project.findFirst();
  if (!targetProject) throw new Error('No project found in database!');

  const feedback = await reportsService.submitCitizenFeedback({
    projectId: targetProject.id,
    citizenName: 'Amit Shah (Citizen Advocate)',
    contactPhone: '+91 98795 43210',
    feedbackType: 'DEFECT_REPORT',
    subject: 'Minor Surface Cracks Observed on Highway Approach',
    details: 'Observed hairline surface cracks near km 4+200 during morning commute.',
  });

  console.log(`✅ Citizen Feedback Submitted ID: ${feedback.id}`);
  console.log(`   Citizen: ${feedback.citizenName} | Subject: "${feedback.subject}"`);
  console.log(`   Status: ${feedback.status}`);

  // 4. Fetch Citizen Feedback Entries
  console.log('\n📋 Step 4: Querying Citizen Feedback Ledger for Nodal Officers...');
  const feedbackList = await reportsService.getCitizenFeedback(targetProject.id);
  console.log(`✅ Retrieved ${feedbackList.length} feedback report(s) for Project ${targetProject.projectCode}`);

  // 5. Generate Full Project Executive Dossier
  console.log('\n📑 Step 5: Compiling Full Executive Project Dossier Summary Object...');
  const dossier = await reportsService.generateProjectDossier(targetProject.id);

  console.log(`✅ Executive Dossier Generated for ${dossier.projectSummary.code}:`);
  console.log(`   Project Name: "${dossier.projectSummary.name}"`);
  console.log(`   Department: ${dossier.projectSummary.department}`);
  console.log(`   Contracts Executed: ${dossier.contractsCount}`);
  console.log(`   Inspections Recorded: ${dossier.inspectionsCount}`);
  console.log(`   Completion Certificates: ${dossier.completionCertificatesCount}`);

  console.log('\n🎉 Phase 10 Executive Analytics, Public Transparency & Dossier Test Passed Successfully!\n');
}

runReportsIntegrationTest()
  .catch((err) => {
    console.error('❌ Phase 10 Integration Test Failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
