import {
  PrismaClient,
  OrganizationType,
  OfficeType,
  UserRoleType,
  ProjectStatus,
  WorkflowExecutionType,
  WorkflowTaskStatus,
} from '@prisma/client';
import bcrypt from 'bcryptjs';
import { startEmbeddedPg } from '../src/db/embeddedPg';

const prisma = new PrismaClient();

async function main() {
  await startEmbeddedPg();
  console.log('🌱 Seeding Government Construction Platform database...');

  // 1. Organization
  const org = await prisma.organization.upsert({
    where: { code: 'GOV_GJ' },
    update: {},
    create: {
      code: 'GOV_GJ',
      name: 'Government of Gujarat',
      type: OrganizationType.STATE_GOVERNMENT,
      state: 'Gujarat',
    },
  });

  // 2. Departments
  const deptRnb = await prisma.department.upsert({
    where: { code: 'RNB' },
    update: {},
    create: {
      code: 'RNB',
      name: 'Roads & Buildings Department',
      organizationId: org.id,
    },
  });

  const deptWrd = await prisma.department.upsert({
    where: { code: 'WRD' },
    update: {},
    create: {
      code: 'WRD',
      name: 'Water Resources Department',
      organizationId: org.id,
    },
  });

  const deptHfw = await prisma.department.upsert({
    where: { code: 'HFW' },
    update: {},
    create: {
      code: 'HFW',
      name: 'Health & Family Welfare Department',
      organizationId: org.id,
    },
  });

  // 3. Offices
  const headOffice = await prisma.office.upsert({
    where: { code: 'HO_GND' },
    update: {},
    create: {
      code: 'HO_GND',
      name: 'State Secretariat Head Office',
      officeType: OfficeType.HEAD_OFFICE,
      departmentId: deptRnb.id,
      state: 'Gujarat',
      district: 'Gandhinagar',
      address: 'Block 14, Sardar Bhavan, Sachivalaya, Gandhinagar',
    },
  });

  const circleOffice = await prisma.office.upsert({
    where: { code: 'CO_AHM' },
    update: {},
    create: {
      code: 'CO_AHM',
      name: 'Ahmedabad R&B Circle Office',
      officeType: OfficeType.CIRCLE_OFFICE,
      departmentId: deptRnb.id,
      parentOfficeId: headOffice.id,
      state: 'Gujarat',
      district: 'Ahmedabad',
      address: 'Circle Bhavan, Vastrapur, Ahmedabad',
    },
  });

  const div1Office = await prisma.office.upsert({
    where: { code: 'DIV_AHM_01' },
    update: {},
    create: {
      code: 'DIV_AHM_01',
      name: 'Ahmedabad Executive Division 1',
      officeType: OfficeType.DIVISION_OFFICE,
      departmentId: deptRnb.id,
      parentOfficeId: circleOffice.id,
      state: 'Gujarat',
      district: 'Ahmedabad',
      address: 'Division Bhavan, Ellisbridge, Ahmedabad',
    },
  });

  const div2Office = await prisma.office.upsert({
    where: { code: 'DIV_AHM_02' },
    update: {},
    create: {
      code: 'DIV_AHM_02',
      name: 'Ahmedabad Executive Division 2',
      officeType: OfficeType.DIVISION_OFFICE,
      departmentId: deptRnb.id,
      parentOfficeId: circleOffice.id,
      state: 'Gujarat',
      district: 'Ahmedabad',
      address: 'Division Bhavan, SG Highway, Ahmedabad',
    },
  });

  const subDivOffice = await prisma.office.upsert({
    where: { code: 'SDIV_BAV' },
    update: {},
    create: {
      code: 'SDIV_BAV',
      name: 'Bavla Sub-Division Office',
      officeType: OfficeType.SUB_DIVISION_OFFICE,
      departmentId: deptRnb.id,
      parentOfficeId: div1Office.id,
      state: 'Gujarat',
      district: 'Ahmedabad',
      address: 'Sub-Divisional Compound, Bavla',
    },
  });

  // 4. Designations
  const desigSecretary = await prisma.designation.upsert({
    where: { code: 'PS' },
    update: {},
    create: { code: 'PS', title: 'Principal Secretary', hierarchyLevel: 9, approvalLimitInr: 1000000000.00 },
  });

  const desigCE = await prisma.designation.upsert({
    where: { code: 'CE' },
    update: {},
    create: { code: 'CE', title: 'Chief Engineer', hierarchyLevel: 8, approvalLimitInr: 500000000.00 },
  });

  const desigSE = await prisma.designation.upsert({
    where: { code: 'SE' },
    update: {},
    create: { code: 'SE', title: 'Superintending Engineer', hierarchyLevel: 7, approvalLimitInr: 150000000.00 },
  });

  const desigEE = await prisma.designation.upsert({
    where: { code: 'EE' },
    update: {},
    create: { code: 'EE', title: 'Executive Engineer', hierarchyLevel: 6, approvalLimitInr: 20000000.00 },
  });

  const desigAE = await prisma.designation.upsert({
    where: { code: 'AE' },
    update: {},
    create: { code: 'AE', title: 'Assistant Engineer', hierarchyLevel: 5, approvalLimitInr: 2500000.00 },
  });

  const desigJE = await prisma.designation.upsert({
    where: { code: 'JE' },
    update: {},
    create: { code: 'JE', title: 'Junior Engineer', hierarchyLevel: 4, approvalLimitInr: 0.00 },
  });

  const desigFC = await prisma.designation.upsert({
    where: { code: 'FC' },
    update: {},
    create: { code: 'FC', title: 'Finance Controller', hierarchyLevel: 7, approvalLimitInr: 1000000000.00 },
  });

  const desigContractor = await prisma.designation.upsert({
    where: { code: 'CONTRACTOR_LEAD' },
    update: {},
    create: { code: 'CONTRACTOR_LEAD', title: 'Authorized Contractor Signatory', hierarchyLevel: 2, approvalLimitInr: 0.00 },
  });

  // 5. Roles
  const rolesList: UserRoleType[] = [
    UserRoleType.SUPER_ADMIN,
    UserRoleType.DEPT_SECRETARY,
    UserRoleType.CHIEF_ENGINEER,
    UserRoleType.SUPERINTENDING_ENGINEER,
    UserRoleType.EXECUTIVE_ENGINEER,
    UserRoleType.ASSISTANT_ENGINEER,
    UserRoleType.JUNIOR_ENGINEER,
    UserRoleType.FINANCE_CONTROLLER,
    UserRoleType.QUALITY_AUDITOR,
    UserRoleType.CONTRACTOR,
    UserRoleType.PUBLIC_AUDITOR,
  ];

  const roleRecordMap = new Map<UserRoleType, string>();
  for (const roleType of rolesList) {
    const role = await prisma.role.upsert({
      where: { roleType },
      update: {},
      create: { roleType, name: roleType.replace('_', ' '), description: `Government role specification for ${roleType}` },
    });
    roleRecordMap.set(roleType, role.id);
  }

  // 6. Users
  const passwordHash = await bcrypt.hash('GovPassword@2026', 12);

  const seedUsersData = [
    { employeeId: 'GJ-RNB-SEC-001', fullName: 'Shri A. K. Sharma, IAS', email: 'sec.rnb@gujarat.gov.in', phone: '+919876543201', officeId: headOffice.id, designationId: desigSecretary.id, roleType: UserRoleType.DEPT_SECRETARY, district: 'Gandhinagar' },
    { employeeId: 'GJ-RNB-CE-101', fullName: 'Er. V. M. Solanki', email: 'ce.zone1@gujarat.gov.in', phone: '+919876543202', officeId: headOffice.id, designationId: desigCE.id, roleType: UserRoleType.CHIEF_ENGINEER, district: 'Gandhinagar' },
    { employeeId: 'GJ-RNB-SE-201', fullName: 'Er. D. N. Mehta', email: 'se.ahm@gujarat.gov.in', phone: '+919876543203', officeId: circleOffice.id, designationId: desigSE.id, roleType: UserRoleType.SUPERINTENDING_ENGINEER, district: 'Ahmedabad' },
    { employeeId: 'GJ-RNB-EE-301', fullName: 'Er. R. K. Patel', email: 'ee.div1@gujarat.gov.in', phone: '+919876543204', officeId: div1Office.id, designationId: desigEE.id, roleType: UserRoleType.EXECUTIVE_ENGINEER, district: 'Ahmedabad' },
    { employeeId: 'GJ-RNB-AE-401', fullName: 'Er. S. B. Joshi', email: 'ae.bavla@gujarat.gov.in', phone: '+919876543205', officeId: subDivOffice.id, designationId: desigAE.id, roleType: UserRoleType.ASSISTANT_ENGINEER, district: 'Ahmedabad' },
    { employeeId: 'GJ-RNB-JE-501', fullName: 'Er. M. P. Vaghela', email: 'je.bavla@gujarat.gov.in', phone: '+919876543206', officeId: subDivOffice.id, designationId: desigJE.id, roleType: UserRoleType.JUNIOR_ENGINEER, district: 'Ahmedabad' },
    { employeeId: 'GJ-FIN-FC-601', fullName: 'Shri P. R. Trivedi', email: 'fc.rnb@gujarat.gov.in', phone: '+919876543207', officeId: headOffice.id, designationId: desigFC.id, roleType: UserRoleType.FINANCE_CONTROLLER, district: 'Gandhinagar' },
    { employeeId: 'GJ-CON-LNT-701', fullName: 'Mr. Rajesh Nambiar', email: 'r.nambiar@lntinfra.com', phone: '+919876543208', officeId: div1Office.id, designationId: desigContractor.id, roleType: UserRoleType.CONTRACTOR, district: 'Ahmedabad' },
  ];

  const userRecordMap = new Map<string, string>();
  for (const u of seedUsersData) {
    const user = await prisma.user.upsert({
      where: { employeeId: u.employeeId },
      update: {},
      create: {
        employeeId: u.employeeId,
        fullName: u.fullName,
        email: u.email,
        phoneNumber: u.phone,
        passwordHash,
        officeId: u.officeId,
        designationId: u.designationId,
        isActive: true,
      },
    });
    userRecordMap.set(u.employeeId, user.id);

    const roleId = roleRecordMap.get(u.roleType);
    if (roleId) {
      await prisma.userRole.upsert({
        where: { userId_roleId: { userId: user.id, roleId } },
        update: {},
        create: { userId: user.id, roleId },
      });
    }

    await prisma.jurisdiction.create({
      data: {
        userId: user.id,
        state: 'Gujarat',
        district: u.district,
        division: u.officeId === div1Office.id ? 'Division 1' : undefined,
      },
    });
  }

  // 7. Workflow Templates Master
  const wfTemplate = await prisma.workflowTemplate.upsert({
    where: { code: 'WF_HOSPITAL_COMPLEX' },
    update: {},
    create: {
      code: 'WF_HOSPITAL_COMPLEX',
      name: 'Multi-Specialty Hospital Building Master Workflow',
      description: 'Standard 7-stage DAG workflow with parallel statutory clearance gates for healthcare civil projects.',
      version: 1,
      isActive: true,
    },
  });

  // Stage Definitions
  const stageDefs = [
    {
      templateId: wfTemplate.id,
      stageKey: 'PROPOSAL_SCRUTINY',
      stageName: 'Initial Scrutiny & Vetting',
      orderIndex: 1,
      executionType: WorkflowExecutionType.SEQUENTIAL,
      prerequisiteStageKeys: [],
      requiredDesignationLevel: 6, // EE
      slaHours: 48,
      escalationHours: 72,
    },
    {
      templateId: wfTemplate.id,
      stageKey: 'PRELIMINARY_FEASIBILITY',
      stageName: 'Preliminary Feasibility Review',
      orderIndex: 2,
      executionType: WorkflowExecutionType.SEQUENTIAL,
      prerequisiteStageKeys: ['PROPOSAL_SCRUTINY'],
      requiredDesignationLevel: 7, // SE
      slaHours: 72,
      escalationHours: 120,
    },
    {
      templateId: wfTemplate.id,
      stageKey: 'ADMINISTRATIVE_SANCTION',
      stageName: 'Administrative Sanction (AS Approval)',
      orderIndex: 3,
      executionType: WorkflowExecutionType.SEQUENTIAL,
      prerequisiteStageKeys: ['PRELIMINARY_FEASIBILITY'],
      requiredDesignationLevel: 9, // Dept Secretary for > ₹35 Cr
      financialThresholdMinInr: 100000000.00,
      slaHours: 120,
      escalationHours: 168,
    },
    {
      templateId: wfTemplate.id,
      stageKey: 'PARALLEL_STATUTORY_CLEARANCES',
      stageName: 'Parallel Statutory Clearances (Fire, Env, Land NOC)',
      orderIndex: 4,
      executionType: WorkflowExecutionType.PARALLEL_GATE,
      prerequisiteStageKeys: ['ADMINISTRATIVE_SANCTION'],
      requiredDesignationLevel: 7, // SE / Land Authority
      slaHours: 96,
      escalationHours: 144,
    },
    {
      templateId: wfTemplate.id,
      stageKey: 'TECHNICAL_SANCTION',
      stageName: 'DPR & Technical Sanction (TS)',
      orderIndex: 5,
      executionType: WorkflowExecutionType.SEQUENTIAL,
      prerequisiteStageKeys: ['PARALLEL_STATUTORY_CLEARANCES'],
      requiredDesignationLevel: 8, // Chief Engineer
      financialThresholdMinInr: 200000000.00,
      slaHours: 96,
      escalationHours: 144,
    },
    {
      templateId: wfTemplate.id,
      stageKey: 'FINANCIAL_CONCURRENCE',
      stageName: 'Financial Sanction & Treasury Allocation',
      orderIndex: 6,
      executionType: WorkflowExecutionType.SEQUENTIAL,
      prerequisiteStageKeys: ['TECHNICAL_SANCTION'],
      requiredDesignationLevel: 7, // Finance Controller
      slaHours: 72,
      escalationHours: 120,
    },
    {
      templateId: wfTemplate.id,
      stageKey: 'TENDER_AND_CONTRACT_AWARD',
      stageName: 'e-Tender Evaluation & Contract Award',
      orderIndex: 7,
      executionType: WorkflowExecutionType.SEQUENTIAL,
      prerequisiteStageKeys: ['FINANCIAL_CONCURRENCE'],
      requiredDesignationLevel: 6, // Executive Engineer
      slaHours: 120,
      escalationHours: 168,
    },
  ];

  const stageDefMap = new Map<string, string>();
  for (const sd of stageDefs) {
    const createdSd = await prisma.workflowStageDefinition.upsert({
      where: { templateId_stageKey: { templateId: sd.templateId, stageKey: sd.stageKey } },
      update: {},
      create: sd,
    });
    stageDefMap.set(sd.stageKey, createdSd.id);
  }

  // 8. Project Types Master
  const projectTypesList = [
    { code: 'ROAD', name: 'Roads & Highways', description: 'Civil road works, expressways, 4-laning' },
    { code: 'BRIDGE', name: 'Bridges & Flyovers', description: 'River bridges, ROBs, flyovers' },
    { code: 'HOSPITAL', name: 'Healthcare Buildings', description: 'Civil hospital complexes, CHCs', defaultWorkflowTemplateId: wfTemplate.id },
    { code: 'SCHOOL', name: 'Educational Buildings', description: 'Government school campuses' },
    { code: 'WATER_SUPPLY', name: 'Water & Irrigation Infrastructure', description: 'Pipelines, WTP, dams' },
    { code: 'GOV_OFFICE', name: 'Government Office Complexes', description: 'Collectorate buildings, Sachivalaya' },
  ];

  const projectTypeMap = new Map<string, string>();
  for (const pt of projectTypesList) {
    const record = await prisma.projectType.upsert({
      where: { code: pt.code },
      update: { defaultWorkflowTemplateId: pt.defaultWorkflowTemplateId },
      create: pt,
    });
    projectTypeMap.set(pt.code, record.id);
  }

  // 9. Seed Realistic Projects
  const eeId = userRecordMap.get('GJ-RNB-EE-301')!;
  const seId = userRecordMap.get('GJ-RNB-SE-201')!;
  const ceId = userRecordMap.get('GJ-RNB-CE-101')!;
  const secId = userRecordMap.get('GJ-RNB-SEC-001')!;

  const seedProjectsData = [
    {
      projectCode: 'GJ-RNB-AHM-2026-000145',
      name: 'Four-Laning of Ahmedabad-Dholera Expressway Package II',
      shortDescription: 'Upgradation from 2-lane to 4-lane expressway standard (Km 22.0 to 48.5)',
      detailedDescription: 'EPC contract for 4-laning of state expressway linking Ahmedabad to Dholera SIR.',
      projectTypeCode: 'ROAD',
      status: ProjectStatus.PROPOSED,
      currentStage: 'PROPOSAL_SCRUTINY',
      state: 'Gujarat',
      district: 'Ahmedabad',
      taluka: 'Dholera',
      cityVillage: 'Bavla-Dholera Highway',
      latitude: 22.2534,
      longitude: 72.1983,
      estimatedCostInr: 450000000.00,
      sanctionedCostInr: 450000000.00,
      contractValueInr: 425000000.00,
      totalExpenditureInr: 0.00,
      fundingSource: 'STATE_BUDGET',
      plannedStartDate: new Date('2026-10-01'),
      plannedEndDate: new Date('2028-09-30'),
      physicalProgressPct: 0.00,
      financialProgressPct: 0.00,
      plannedProgressPct: 5.00,
      scheduleVariancePct: -5.00,
      assignedUserId: eeId,
    },
    {
      projectCode: 'GJ-HFW-AHM-2026-000088',
      name: 'Construction of 100-Bed Sub-District Hospital at Bavla',
      shortDescription: 'Modern multi-specialty hospital building with ICU, OT, and OPD blocks',
      detailedDescription: 'Construction of G+3 storey hospital campus including medical gas pipelines and emergency trauma center.',
      projectTypeCode: 'HOSPITAL',
      status: ProjectStatus.UNDER_SCRUTINY,
      currentStage: 'PRELIMINARY_FEASIBILITY',
      state: 'Gujarat',
      district: 'Ahmedabad',
      taluka: 'Bavla',
      cityVillage: 'Bavla Town',
      latitude: 22.8361,
      longitude: 72.3644,
      estimatedCostInr: 350000000.00,
      sanctionedCostInr: 350000000.00,
      contractValueInr: null,
      totalExpenditureInr: 0.00,
      fundingSource: 'NATIONAL_HEALTH_MISSION',
      plannedStartDate: new Date('2026-11-01'),
      plannedEndDate: new Date('2028-04-30'),
      physicalProgressPct: 0.00,
      financialProgressPct: 0.00,
      plannedProgressPct: 0.00,
      scheduleVariancePct: 0.00,
      assignedUserId: seId,
    },
    {
      projectCode: 'GJ-RNB-GND-2026-000210',
      name: 'Sabarmati River High-Level Flyover at Gandhinagar Outer Ring',
      shortDescription: 'Six-lane pre-stressed concrete flyover bridge crossing Sabarmati River',
      detailedDescription: 'Construction of 1.2 km 6-lane river bridge with LED smart lighting.',
      projectTypeCode: 'BRIDGE',
      status: ProjectStatus.TECHNICAL_SANCTIONED,
      currentStage: 'TECHNICAL_SANCTION',
      state: 'Gujarat',
      district: 'Gandhinagar',
      taluka: 'Gandhinagar',
      cityVillage: 'Pethapur Crossing',
      latitude: 23.2156,
      longitude: 72.6369,
      estimatedCostInr: 850000000.00,
      sanctionedCostInr: 850000000.00,
      contractValueInr: 810000000.00,
      totalExpenditureInr: 120000000.00,
      fundingSource: 'STATE_CAPITAL_DEV_FUND',
      plannedStartDate: new Date('2026-01-15'),
      plannedEndDate: new Date('2027-12-31'),
      physicalProgressPct: 22.50,
      financialProgressPct: 14.12,
      plannedProgressPct: 25.00,
      scheduleVariancePct: -2.50,
      assignedUserId: ceId,
    },
  ];

  for (const p of seedProjectsData) {
    const typeId = projectTypeMap.get(p.projectTypeCode)!;
    const project = await prisma.project.upsert({
      where: { projectCode: p.projectCode },
      update: {
        status: p.status,
        currentStage: p.currentStage,
        estimatedCostInr: p.estimatedCostInr,
      },
      create: {
        projectCode: p.projectCode,
        name: p.name,
        shortDescription: p.shortDescription,
        detailedDescription: p.detailedDescription,
        projectTypeId: typeId,
        administrativeDepartmentId: deptRnb.id,
        implementingDepartmentId: deptRnb.id,
        executingOfficeId: div1Office.id,
        projectOwnerId: secId,
        projectManagerId: eeId,
        createdById: eeId,
        status: p.status,
        currentStage: p.currentStage,
        state: p.state,
        district: p.district,
        taluka: p.taluka,
        cityVillage: p.cityVillage,
        latitude: p.latitude,
        longitude: p.longitude,
        estimatedCostInr: p.estimatedCostInr,
        sanctionedCostInr: p.sanctionedCostInr,
        contractValueInr: p.contractValueInr,
        totalExpenditureInr: p.totalExpenditureInr,
        fundingSource: p.fundingSource,
        plannedStartDate: p.plannedStartDate,
        plannedEndDate: p.plannedEndDate,
        physicalProgressPct: p.physicalProgressPct,
        financialProgressPct: p.financialProgressPct,
        plannedProgressPct: p.plannedProgressPct,
        scheduleVariancePct: p.scheduleVariancePct,
      },
    });

    // Workflow Instance
    const wfInstance = await prisma.workflowInstance.upsert({
      where: { projectId: project.id },
      update: { currentStageKey: p.currentStage },
      create: {
        projectId: project.id,
        templateId: wfTemplate.id,
        currentStageKey: p.currentStage,
        isCompleted: false,
      },
    });

    // Workflow Task for assigned officer queue
    const stageDefId = stageDefMap.get(p.currentStage);
    if (stageDefId) {
      const existingTask = await prisma.workflowTask.findFirst({
        where: {
          instanceId: wfInstance.id,
          stageKey: p.currentStage,
        },
      });

      if (!existingTask) {
        await prisma.workflowTask.create({
          data: {
            instanceId: wfInstance.id,
            stageDefinitionId: stageDefId,
            stageKey: p.currentStage,
            assignedUserId: p.assignedUserId,
            assignedOfficeId: div1Office.id,
            status: WorkflowTaskStatus.PENDING,
            dueDate: new Date(Date.now() + 72 * 3600 * 1000), // 72 hours SLA
          },
        });
      } else {
        await prisma.workflowTask.update({
          where: { id: existingTask.id },
          data: { status: WorkflowTaskStatus.PENDING },
        });
      }
    }
  }

  // ==========================================
  // PHASE 4 SEEDING: CONTRACTORS, TENDERS, BIDS & CONTRACTS
  // ==========================================
  console.log('🏗️ Seeding Contractors, Tenders, Bids, and Contracts...');

  const contractor1 = await prisma.contractor.upsert({
    where: { registrationNo: 'REG-2026-LT-01' },
    update: {},
    create: {
      registrationNo: 'REG-2026-LT-01',
      companyName: 'L&T Construction Infrastructure Division',
      panNumber: 'AAACL1234F',
      gstin: '24AAACL1234F1Z5',
      classGrade: 'Class AA (State & National Highway)',
      contactPerson: 'Er. Rajesh Kumar Varma',
      email: 'projects.west@lntecc.com',
      phone: '+919825011223',
    },
  });

  const contractor2 = await prisma.contractor.upsert({
    where: { registrationNo: 'REG-2026-DBL-02' },
    update: {},
    create: {
      registrationNo: 'REG-2026-DBL-02',
      companyName: 'Dilip Buildcon Ltd',
      panNumber: 'AAACD5678G',
      gstin: '24AAACD5678G1Z2',
      classGrade: 'Class AA',
      contactPerson: 'Shri Vikram Rathore',
      email: 'tenders@dilipbuildcon.com',
      phone: '+919825022334',
    },
  });

  const contractor3 = await prisma.contractor.upsert({
    where: { registrationNo: 'REG-2026-SEL-03' },
    update: {},
    create: {
      registrationNo: 'REG-2026-SEL-03',
      companyName: 'Sadbhav Engineering Infrastructure',
      panNumber: 'AAACS9012H',
      gstin: '24AAACS9012H1Z9',
      classGrade: 'Class A',
      contactPerson: 'Shri Sanjay Patel',
      email: 'bids@sadbhav.co.in',
      phone: '+919825033445',
    },
  });

  // Seed Tender Notice for Project 1 (Ahmedabad Elevated Corridor)
  const project1 = await prisma.project.findFirst({ where: { projectCode: 'GJ-RNB-AHM-2026-000001' } });
  if (project1) {
    const tender1 = await prisma.tender.upsert({
      where: { tenderNoticeNo: 'TN-2026-RNB-AHM-001' },
      update: {},
      create: {
        projectId: project1.id,
        tenderNoticeNo: 'TN-2026-RNB-AHM-001',
        portalReferenceId: 'E-PROC-GUJ-2026-98124',
        estimatedTenderAmount: 120000000.00,
        nitPublishDate: new Date('2026-01-15'),
        bidSubmissionEndDate: new Date('2026-02-15'),
        bidOpeningDate: new Date('2026-02-18'),
        status: 'AWARDED',
      },
    });

    // Seed Bids (L1, L2, L3)
    await prisma.tenderBid.upsert({
      where: { tenderId_contractorId: { tenderId: tender1.id, contractorId: contractor1.id } },
      update: {},
      create: {
        tenderId: tender1.id,
        contractorId: contractor1.id,
        bidAmountInr: 118500000.00, // L1 lowest bid (1.25% below estimate)
        isQualified: true,
        rank: 1,
        remarks: 'L1 Lowest Qualified Financial Bidder',
      },
    });

    await prisma.tenderBid.upsert({
      where: { tenderId_contractorId: { tenderId: tender1.id, contractorId: contractor2.id } },
      update: {},
      create: {
        tenderId: tender1.id,
        contractorId: contractor2.id,
        bidAmountInr: 122000000.00, // L2 bid
        isQualified: true,
        rank: 2,
        remarks: 'L2 Qualified Bidder (+1.67% above estimate)',
      },
    });

    await prisma.tenderBid.upsert({
      where: { tenderId_contractorId: { tenderId: tender1.id, contractorId: contractor3.id } },
      update: {},
      create: {
        tenderId: tender1.id,
        contractorId: contractor3.id,
        bidAmountInr: 125500000.00, // L3 bid
        isQualified: true,
        rank: 3,
        remarks: 'L3 Qualified Bidder (+4.58% above estimate)',
      },
    });

    // Seed Executed Contract
    const contract1 = await prisma.contract.upsert({
      where: { contractAgreementNo: 'GJ-RNB-CON-2026-0001' },
      update: {},
      create: {
        projectId: project1.id,
        tenderId: tender1.id,
        contractorId: contractor1.id,
        contractAgreementNo: 'GJ-RNB-CON-2026-0001',
        workOrderNo: 'GJ-RNB-WO-2026-0001',
        workOrderDate: new Date('2026-03-01'),
        originalValueInr: 118500000.00,
        scheduledStartDate: new Date('2026-03-15'),
        scheduledEndDate: new Date('2027-09-15'),
        pbgAmountInr: 5925000.00, // 5% PBG
        pbgValidityDate: new Date('2028-03-15'),
      },
    });

    // Seed Milestones for Project 1
    const milestones = [
      { title: 'Site Survey & Sub-structure Foundation', weightagePct: 25.00, completionPct: 100.00, status: MilestoneStatus.COMPLETED, plannedStartDate: new Date('2026-03-15'), plannedEndDate: new Date('2026-06-30') },
      { title: 'Pier & Superstructure Girders Erection', weightagePct: 35.00, completionPct: 60.00, status: MilestoneStatus.IN_PROGRESS, plannedStartDate: new Date('2026-07-01'), plannedEndDate: new Date('2026-12-31') },
      { title: 'Road Decking & Dense Bituminous Overlay', weightagePct: 25.00, completionPct: 0.00, status: MilestoneStatus.NOT_STARTED, plannedStartDate: new Date('2027-01-01'), plannedEndDate: new Date('2027-05-31') },
      { title: 'Safety Lighting & Public Handover', weightagePct: 15.00, completionPct: 0.00, status: MilestoneStatus.NOT_STARTED, plannedStartDate: new Date('2027-06-01'), plannedEndDate: new Date('2027-09-15') },
    ];

    for (const m of milestones) {
      const existingM = await prisma.milestone.findFirst({
        where: { projectId: project1.id, title: m.title },
      });
      if (!existingM) {
        await prisma.milestone.create({
          data: {
            projectId: project1.id,
            ...m,
          },
        });
      }
    }
  }

  console.log('✅ Database seeded successfully with Workflow Templates, Stage DAGs, Contractors, Tenders, Bids & Contracts!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
