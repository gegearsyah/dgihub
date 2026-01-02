# Integration Logic: Cross-Track Workflows

## Overview

This document implements the integration logic connecting the three user tracks, including hiring decisions, certificate flow, and job posting visibility.

## 1. Certificate Flow Integration [60, 61, 62, 52, 39]

### Certificate Issuance to Profile Update Flow

```typescript
// workflows/certificateToProfileFlow.ts
export const handleCertificateToProfileFlow = async (
  certificateId: string,
  userId: string
): Promise<void> => {
  // Step 1: Certificate issued by Mitra [45]
  const certificate = await api.getCertificate(certificateId);

  // Step 2: Automatically update Talenta Profile [39, 62]
  await api.updateTalentaProfile(userId, {
    certificates: [...(await api.getUserCertificates(userId)), certificate.id],
    skills: await updateSkillsFromCertificate(userId, certificate),
    aqrfLevel: await updateAQRFLevel(userId, certificate)
  });

  // Step 3: Make visible to Industry [52]
  await api.publishCertificateToIndustry(certificate.id, {
    visible: true,
    verified: true,
    searchable: true
  });

  // Step 4: Update job application eligibility
  await updateJobApplicationEligibility(userId, certificate);

  // Step 5: Send notification
  await notificationService.send({
    userId,
    type: 'certificate_added_to_profile',
    title: 'Certificate Added to Profile',
    message: `Your certificate has been added to your profile and is now visible to employers`
  });
};
```

### Certificate Visibility to Industry [52]

```typescript
// workflows/certificateVisibility.ts
export const publishCertificateToIndustry = async (
  certificateId: string,
  visibilityOptions: VisibilityOptions
): Promise<void> => {
  // Step 1: Get certificate
  const certificate = await api.getCertificate(certificateId);

  // Step 2: Create industry-visible record
  await api.createIndustryCertificateView({
    certificateId,
    userId: certificate.userId,
    visible: visibilityOptions.visible,
    verified: visibilityOptions.verified,
    searchable: visibilityOptions.searchable,
    publishedAt: new Date()
  });

  // Step 3: Index for talent search [40, 48]
  await searchService.indexCertificate(certificateId, {
    userId: certificate.userId,
    skkniCode: certificate.skkniCode,
    aqrfLevel: certificate.aqrfLevel,
    skills: certificate.skills
  });

  // Step 4: Notify matching employers (optional)
  if (visibilityOptions.notifyEmployers) {
    const matchingEmployers = await api.findMatchingEmployers(certificate);
    await Promise.all(
      matchingEmployers.map(employer =>
        notificationService.send({
          userId: employer.id,
          type: 'new_talent_certificate',
          title: 'New Talent Certificate',
          message: `A candidate has earned a certificate matching your job requirements`
        })
      )
    );
  }
};
```

## 2. Hiring Decision Integration [53, 54, 55, 57, 58]

### Hiring Decision Flow

```typescript
// workflows/hiringDecisionFlow.ts
export const processHiringDecision = async (
  applicationId: string,
  decision: HiringDecision
): Promise<HiringDecisionResult> => {
  // Step 1: Get application details
  const application = await api.getJobApplication(applicationId);
  const job = await api.getJob(application.jobId);

  // Step 2: Create decision record [53]
  const decisionRecord = await api.createHiringDecision({
    applicationId,
    decision: decision.type, // 'accept' | 'reject'
    decidedBy: decision.employerId,
    decidedAt: new Date(),
    reason: decision.reason,
    feedback: decision.feedback,
    offerDetails: decision.offerDetails,
    saveToTalentPool: decision.saveToTalentPool
  });

  // Step 3: Route based on decision type
  if (decision.type === 'accept') {
    return await processAcceptance(application, job, decisionRecord);
  } else {
    return await processRejection(application, job, decisionRecord);
  }
};
```

### Acceptance Flow [54, 55]

```typescript
// workflows/hiringAcceptance.ts
export const processAcceptance = async (
  application: JobApplication,
  job: JobListing,
  decision: HiringDecision
): Promise<HiringDecisionResult> => {
  // Step 1: Create hiring process [54]
  const hiringProcess = await api.createHiringProcess({
    applicationId: application.id,
    jobId: job.id,
    candidateId: application.userId,
    employerId: application.employerId,
    startedAt: new Date(),
    status: 'in_progress',
    offerDetails: decision.offerDetails
  });

  // Step 2: Send offer letter [55]
  const offerLetter = await api.createOfferLetter({
    hiringProcessId: hiringProcess.id,
    candidateId: application.userId,
    jobId: job.id,
    offerDetails: decision.offerDetails,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  });

  // Step 3: Update job positions
  await api.updateJob(job.id, {
    positionsFilled: (job.positionsFilled || 0) + 1,
    positionsAvailable: job.positionsAvailable - 1
  });

  // Step 4: Update application status
  await api.updateApplicationStatus(application.id, 'hired');

  // Step 5: Close other applications for same job (optional)
  if (job.positionsAvailable === 1) {
    await api.closeJobApplications(job.id, application.id);
  }

  // Step 6: Send notifications
  await Promise.all([
    notificationService.send({
      userId: application.userId,
      type: 'hiring_acceptance',
      title: 'Congratulations!',
      message: `You have been selected for ${job.title}`,
      action: {
        label: 'View Offer',
        url: `/offers/${offerLetter.id}`
      }
    }),
    notificationService.send({
      userId: application.employerId,
      type: 'hiring_acceptance',
      title: 'Hiring Decision Made',
      message: `Offer sent to ${application.candidateName}`
    })
  ]);

  // Step 7: Update tax incentive tracking
  await api.recordHiringForTaxIncentive(application.employerId, {
    candidateId: application.userId,
    jobId: job.id,
    hiredAt: new Date()
  });

  return {
    success: true,
    hiringProcessId: hiringProcess.id,
    offerLetterId: offerLetter.id,
    message: 'Hiring process initiated'
  };
};
```

### Rejection Flow with Talent Pool [57, 58]

```typescript
// workflows/hiringRejection.ts
export const processRejection = async (
  application: JobApplication,
  job: JobListing,
  decision: HiringDecision
): Promise<HiringDecisionResult> => {
  // Step 1: Update application status
  await api.updateApplicationStatus(application.id, 'rejected');

  // Step 2: Check if should save to talent pool [57]
  if (decision.saveToTalentPool) {
    await saveToTalentPool(application, decision);
  }

  // Step 3: Send rejection notification
  await notificationService.send({
    userId: application.userId,
    type: 'hiring_rejection',
    title: 'Application Update',
    message: decision.feedback || 'Thank you for your interest',
    data: {
      jobTitle: job.title,
      company: job.company,
      feedback: decision.feedback,
      inTalentPool: decision.saveToTalentPool
    }
  });

  return {
    success: true,
    message: 'Rejection processed',
    savedToTalentPool: decision.saveToTalentPool
  };
};

export const saveToTalentPool = async (
  application: JobApplication,
  decision: HiringDecision
): Promise<void> => {
  // Step 1: Check if already in pool
  const existing = await api.getTalentPoolEntry(application.userId, application.employerId);
  if (existing) {
    // Update existing entry
    await api.updateTalentPoolEntry(existing.id, {
      reason: decision.reason || 'Rejected but qualified for future opportunities',
      updatedAt: new Date(),
      tags: [...(existing.tags || []), application.jobId]
    });
    return;
  }

  // Step 2: Add to talent pool [58]
  await api.addToTalentPool({
    candidateId: application.userId,
    employerId: application.employerId,
    reason: decision.reason || 'Qualified candidate for future opportunities',
    addedAt: new Date(),
    status: 'active',
    tags: [application.jobId],
    notes: decision.feedback
  });

  // Step 3: Notify candidate (optional)
  await notificationService.send({
    userId: application.userId,
    type: 'talent_pool_added',
    title: 'Added to Talent Pool',
    message: 'You have been added to our talent pool for future opportunities'
  });
};
```

## 3. Job Posting to Talent View Integration [59, 65]

### Job Publishing Flow

```typescript
// workflows/jobPublishingFlow.ts
export const publishJobToTalenta = async (jobId: string): Promise<void> => {
  // Step 1: Get job details
  const job = await api.getJob(jobId);

  // Step 2: Validate job data
  if (!job.requirements || !job.description) {
    throw new Error('Job requirements and description must be completed');
  }

  // Step 3: Publish job [50]
  await api.publishJob(jobId);

  // Step 4: Make visible to Talenta [59]
  await api.createTalentaJobView({
    jobId,
    visible: true,
    searchable: true,
    publishedAt: new Date()
  });

  // Step 5: Index for search [65]
  await searchService.indexJob(jobId, {
    title: job.title,
    description: job.description,
    requirements: job.requirements,
    location: job.location,
    salary: job.salary,
    employmentType: job.employmentType
  });

  // Step 6: Find and notify matching candidates
  const matchingCandidates = await api.findMatchingCandidates(jobId);
  await Promise.all(
    matchingCandidates.slice(0, 50).map(candidate => // Limit to 50 notifications
      notificationService.send({
        userId: candidate.userId,
        type: 'job_match',
        title: 'New Job Opportunity',
        message: `A new job matches your profile: ${job.title}`,
        action: {
          label: 'View Job',
          url: `/jobs/${jobId}`
        }
      })
    )
  );

  // Step 7: Update job status
  await api.updateJob(jobId, { status: 'published' });
};
```

### Job Application Flow [65, 64]

```typescript
// workflows/jobApplicationFlow.ts
export const createJobApplication = async (
  userId: string,
  jobId: string,
  applicationData: JobApplicationData
): Promise<JobApplication> => {
  // Step 1: Get job and user profile
  const [job, userProfile] = await Promise.all([
    api.getJob(jobId),
    api.getTalentaProfile(userId)
  ]);

  // Step 2: Check eligibility [64]
  const eligibility = await checkJobEligibility(job, userProfile);
  if (!eligibility.eligible) {
    throw new Error(`Not eligible: ${eligibility.reason}`);
  }

  // Step 3: Check if already applied
  const existingApplication = await api.getApplicationByUserAndJob(userId, jobId);
  if (existingApplication) {
    throw new Error('Already applied for this job');
  }

  // Step 4: Get relevant certificates [61]
  const relevantCertificates = await api.getRelevantCertificates(
    userId,
    job.requirements
  );

  // Step 5: Create application [65]
  const application = await api.createJobApplication({
    userId,
    jobId,
    employerId: job.employerId,
    appliedAt: new Date(),
    status: 'pending',
    coverLetter: applicationData.coverLetter,
    resume: applicationData.resume || userProfile.resumeUrl,
    certificates: relevantCertificates.map(c => c.id)
  });

  // Step 6: Attach certificates
  await api.attachCertificatesToApplication(application.id, relevantCertificates);

  // Step 7: Send notification to employer
  await notificationService.send({
    userId: job.employerId,
    type: 'new_application',
    title: 'New Job Application',
    message: `${userProfile.name} applied for ${job.title}`,
    action: {
      label: 'Review Application',
      url: `/recruitment/applications/${application.id}`
    }
  });

  // Step 8: Update application count
  await api.updateJob(jobId, {
    applicationCount: (job.applicationCount || 0) + 1
  });

  return application;
};
```

## 4. State Management Integration

### Cross-Track State Management

```typescript
// store/integrationStore.ts
interface IntegrationState {
  // Certificate flow
  certificateToProfileUpdates: Map<string, CertificateUpdate>;
  
  // Hiring decisions
  pendingHiringDecisions: HiringDecision[];
  activeHiringProcesses: HiringProcess[];
  
  // Job visibility
  publishedJobs: Map<string, JobVisibility>;
  talentJobViews: Map<string, JobView>;
  
  // Talent pool
  talentPoolEntries: Map<string, TalentPoolEntry>;
}

export const useIntegrationStore = create<IntegrationState>((set, get) => ({
  certificateToProfileUpdates: new Map(),
  pendingHiringDecisions: [],
  activeHiringProcesses: [],
  publishedJobs: new Map(),
  talentJobViews: new Map(),
  talentPoolEntries: new Map(),

  // Certificate flow actions
  addCertificateUpdate: (userId, certificate) => set(state => {
    const updates = new Map(state.certificateToProfileUpdates);
    updates.set(userId, certificate);
    return { certificateToProfileUpdates: updates };
  }),

  // Hiring decision actions
  addHiringDecision: (decision) => set(state => ({
    pendingHiringDecisions: [...state.pendingHiringDecisions, decision]
  })),
  addHiringProcess: (process) => set(state => ({
    activeHiringProcesses: [...state.activeHiringProcesses, process]
  })),

  // Job visibility actions
  publishJob: (jobId, visibility) => set(state => {
    const jobs = new Map(state.publishedJobs);
    jobs.set(jobId, visibility);
    return { publishedJobs: jobs };
  }),

  // Talent pool actions
  addToTalentPool: (entry) => set(state => {
    const entries = new Map(state.talentPoolEntries);
    entries.set(`${entry.candidateId}-${entry.employerId}`, entry);
    return { talentPoolEntries: entries };
  })
}));
```

## 5. Event-Driven Integration

### Event Handlers

```typescript
// events/integrationEvents.ts
export const setupIntegrationEventHandlers = () => {
  // Certificate issued event
  eventBus.on('certificate.issued', async (event: CertificateIssuedEvent) => {
    await handleCertificateToProfileFlow(event.certificateId, event.userId);
    await publishCertificateToIndustry(event.certificateId, {
      visible: true,
      verified: true,
      searchable: true,
      notifyEmployers: true
    });
  });

  // Hiring decision event
  eventBus.on('hiring.decision.made', async (event: HiringDecisionEvent) => {
    await processHiringDecision(event.applicationId, event.decision);
  });

  // Job published event
  eventBus.on('job.published', async (event: JobPublishedEvent) => {
    await publishJobToTalenta(event.jobId);
  });

  // Job application created event
  eventBus.on('application.created', async (event: ApplicationCreatedEvent) => {
    await notifyEmployerOfApplication(event.applicationId);
  });
};
```

---

**Last Updated**: 2024-01-15  
**Version**: 1.0.0


