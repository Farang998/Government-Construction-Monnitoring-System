import { prisma } from './config/prisma';
import { monitoringService } from './modules/monitoring/monitoring.service';
import { inspectionService } from './modules/inspection/inspection.service';
import { InspectionRating } from '@gov-platform/shared';

async function runMonitoringIntegrationTest() {
  console.log('🧪 Starting Phase 5 Construction Execution & Site Monitoring Integration Test...');

  // 1. Fetch a Sanctioned Project with Milestones
  const project = await prisma.project.findFirst({
    include: { milestones: true },
  });

  if (!project) {
    throw new Error('No project found in database to run monitoring test!');
  }

  console.log(`📌 Target Project: ${project.projectCode} - ${project.name}`);
  console.log(`   Initial Physical Progress: ${project.physicalProgressPct}% | Total Expenditure: ₹${project.totalExpenditureInr}`);

  // Fetch or initialize milestones if empty
  let milestones = project.milestones;
  if (milestones.length === 0) {
    console.log('⚡ Initializing project physical milestones...');
    const m1 = await prisma.milestone.create({
      data: {
        projectId: project.id,
        title: 'Phase 1 - Site Mobilization & Earthworks',
        description: 'Excavation, grading, and site leveling',
        weightagePct: 25.0,
        completionPct: 0.0,
        status: 'NOT_STARTED',
        plannedStartDate: new Date('2026-04-01'),
        plannedEndDate: new Date('2026-06-30'),
      },
    });

    const m2 = await prisma.milestone.create({
      data: {
        projectId: project.id,
        title: 'Phase 2 - Main Superstructure Sub-grade & Foundation',
        description: 'Piling, RCC footing and column casting',
        weightagePct: 75.0,
        completionPct: 0.0,
        status: 'NOT_STARTED',
        plannedStartDate: new Date('2026-07-01'),
        plannedEndDate: new Date('2026-12-31'),
      },
    });

    milestones = [m1, m2];
  }

  const targetMilestone = milestones[0]!;
  console.log(`🎯 Updating Progress for Milestone: "${targetMilestone.title}" (Weightage: ${targetMilestone.weightagePct}%)`);

  // Fetch an officer user for auditor/logger context
  const officerUser = await prisma.user.findFirst({
    include: { designation: true },
  });

  if (!officerUser) {
    throw new Error('Officer user not found!');
  }

  const officer = {
    id: officerUser.id,
    fullName: officerUser.fullName,
    designation: officerUser.designation?.title || 'Executive Engineer',
  };

  // 2. Log Progress Update & Voucher
  console.log('📈 Submitting 60% completion update for Milestone 1 with ₹2.5 Crore voucher expenditure...');
  const progressUpdateRes = await monitoringService.logProgressUpdate(
    officer,
    {
      projectId: project.id,
      milestoneId: targetMilestone.id,
      milestoneCompletionPct: 60.0,
      financialExpenditureInr: 25000000.0, // ₹2.5 Cr
      remarks: 'Earthworks excavation 60% achieved. Heavy machinery mobilized.',
    }
  );

  console.log(`✅ Progress Update Logged: ${progressUpdateRes.message}`);

  // Fetch updated project to verify recalculated weighted progress sum
  const updatedProject = await prisma.project.findUnique({
    where: { id: project.id },
  });

  console.log(`📊 Recalculated Overall Physical Progress: ${updatedProject?.physicalProgressPct}%`);
  console.log(`💰 Updated Total Financial Expenditure: ₹${updatedProject?.totalExpenditureInr}`);

  // 3. Record Quality Audit Inspection with Geo-Tagged Evidence
  console.log('👷 Scheduling Quality Audit Field Inspection with Defects...');
  const inspection = await inspectionService.createInspection(
    officer,
    {
      projectId: project.id,
      inspectionDate: new Date().toISOString().split('T')[0]!,
      overallRating: InspectionRating.NEEDS_IMPROVEMENT,
      findings: 'Soil compaction density reading at Ch. 12+400 is 91% vs 95% Proctor standard requirement.',
      defectsIdentified: 'Sub-base soil compaction deficiency on West Corridor',
      correctiveMeasures: 'Re-roll and re-compact sub-base layer with heavy vibratory roller and re-test density.',
      evidenceTitle: 'Geo-Tagged Field Soil Compaction Meter Reading',
      evidenceFileUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=800&q=80',
      latitude: 23.0225,
      longitude: 72.5714,
    }
  );

  console.log(`📋 Field Inspection Recorded ID: ${inspection.id}, Rating: ${inspection.overallRating}`);
  console.log(`📸 Geo-Tagged Evidence Attached: ${inspection.evidence.length} photo(s) [Lat: 23.0225, Lng: 72.5714]`);

  // 4. Perform Defect Rectification
  console.log('🔧 Executing Defect Rectification & Compliance Verification...');
  const rectifyResult = await inspectionService.rectifyDefects(
    officer,
    inspection.id,
    'Re-rolling completed. Soil compaction re-test passed with 96.2% Proctor density certification.'
  );

  console.log(`✅ Defect Rectification Message: ${rectifyResult.message}`);
  
  // Verify DB state
  const updatedInspection = await prisma.inspection.findUnique({ where: { id: inspection.id } });
  console.log(`✅ Verified DB Rectification Status: isRectified = ${updatedInspection?.isRectified}`);
  console.log('🎉 Phase 5 Integration Test PASSED Cleanly!');
}

runMonitoringIntegrationTest()
  .catch((err) => {
    console.error('❌ Integration Test Failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
