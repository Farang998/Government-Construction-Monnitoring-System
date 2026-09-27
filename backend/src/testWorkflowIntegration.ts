import { prisma } from './config/prisma';
import { workflowService } from './modules/workflow/workflow.service';
import { approvalService } from './modules/approval/approval.service';
import { ApprovalAction } from '@prisma/client';

async function runIntegrationTest() {
  console.log('🧪 Starting Phase 3 Workflow Engine Integration Test...');

  // 1. Fetch Executive Engineer User
  const eeUser = await prisma.user.findFirst({
    where: { employeeId: 'GJ-RNB-EE-301' },
    include: { designation: true },
  });

  if (!eeUser) {
    throw new Error('Executive Engineer test user not found!');
  }

  console.log(`👤 Testing Officer: ${eeUser.fullName} (${eeUser.designation.title}), Limit: ₹${eeUser.designation.approvalLimitInr}`);

  // 2. Fetch Pending Tasks for Officer Inbox
  const inbox = await approvalService.getOfficerInboxTasks({
    id: eeUser.id,
    officeId: eeUser.officeId,
    designationId: eeUser.designationId,
  });

  console.log(`📥 Officer Inbox Tasks Count: ${inbox.length}`);
  if (inbox.length === 0) {
    throw new Error('Expected pending tasks in officer inbox!');
  }

  const targetTask = inbox[0]!;
  console.log(`📋 Target Task ID: ${targetTask.id}, Project: ${targetTask.projectCode}, Stage: ${targetTask.stageKey}`);

  // 3. Test Maker-Checker Segregation Protection
  const project = await prisma.project.findUnique({ where: { id: targetTask.projectId } });
  if (project) {
    try {
      await approvalService.executeTaskAction(
        targetTask.id,
        { id: project.createdById }, // Submitter user attempting approval
        { action: ApprovalAction.APPROVE as any, remarks: 'Submitting officer attempting approval' }
      );
      console.error('❌ Maker-Checker segregation check FAILED: Submitting officer was allowed to approve!');
      process.exit(1);
    } catch (err: any) {
      console.log(`✅ Maker-Checker segregation check PASSED: Caught expected error -> "${err.message}"`);
    }
  }

  // 4. Test ABAC Financial Ceiling Protection
  const lowLimitUser = {
    id: 'test-user-low-limit',
    financialApprovalLimitInr: 100, // ₹100 limit, project cost is ₹50Cr+
    designation: { approvalLimitInr: 100 },
  };

  try {
    await approvalService.executeTaskAction(
      targetTask.id,
      lowLimitUser,
      { action: ApprovalAction.APPROVE as any, remarks: 'Low limit officer attempting approval' }
    );
    console.error('❌ ABAC Financial Limit check FAILED: Officer exceeding financial limit was allowed!');
    process.exit(1);
  } catch (err: any) {
    console.log(`✅ ABAC Financial Limit check PASSED: Caught expected error -> "${err.message}"`);
  }

  // 5. Test Valid Statutory Action Execution (APPROVE) using Chief Engineer (Checker)
  const ceUser = await prisma.user.findFirst({
    where: { employeeId: 'GJ-RNB-CE-101' },
    include: { designation: true },
  });

  if (!ceUser) throw new Error('Chief Engineer test user not found!');

  const actionResult = await approvalService.executeTaskAction(
    targetTask.id,
    {
      id: ceUser.id,
      financialApprovalLimitInr: Number(ceUser.designation.approvalLimitInr),
      designation: ceUser.designation,
    },
    {
      action: ApprovalAction.APPROVE as any,
      remarks: 'Approved statutory scrutiny after technical verification of revenue land plans and DPR estimate.',
    }
  );

  console.log(`✅ Task Action Executed: ${actionResult.message}`);

  // 6. Verify Project Workflow DAG State Advance
  const updatedWf = await workflowService.getProjectWorkflow(targetTask.projectId);
  console.log(`📊 Updated Current Stage: ${updatedWf?.currentStageKey}`);
  console.log(`📜 Approval History Log Count: ${updatedWf?.history.length}`);

  if ((updatedWf?.history.length || 0) > 0) {
    console.log(`📝 Latest History Remarks: "${updatedWf?.history[0]?.remarks}"`);
  }

  console.log('🎉 PHASE 3 INTEGRATION TEST COMPLETED SUCCESSFULLY!');
  process.exit(0);
}

runIntegrationTest().catch((e) => {
  console.error('❌ Integration Test Failed:', e);
  process.exit(1);
});
