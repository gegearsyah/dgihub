# Alur Industri (Employer Path) Implementation

## Overview

This document implements the functional workflows for the Employer (Industri) track based on the platform flow chart nodes [25-26, 32-33, 40-42, 48-50, 52-58].

## Component Architecture

### 1. Industri Dashboard [18]

```typescript
// components/industri/Dashboard.tsx
interface IndustriDashboardProps {
  employerId: string;
}

interface IndustriDashboardState {
  activeJobs: JobListing[];
  applications: JobApplication[];
  talentPool: Talent[];
  stats: {
    totalJobs: number;
    activeJobs: number;
    totalApplications: number;
    pendingApplications: number;
    interviewsScheduled: number;
    hires: number;
    taxSavings: number;
  };
  taxIncentives: TaxIncentiveSummary;
}

export const IndustriDashboard: React.FC<IndustriDashboardProps> = ({ employerId }) => {
  const [state, setState] = useState<IndustriDashboardState>();

  useEffect(() => {
    loadDashboardData(employerId);
  }, [employerId]);

  return (
    <div className="industri-dashboard">
      <DashboardHeader employerId={employerId} />
      <StatsCards stats={state?.stats} />
      <TaxIncentiveCard taxIncentives={state?.taxIncentives} />
      <QuickActions />
      <ActiveJobsSection jobs={state?.activeJobs} />
      <RecentApplicationsSection applications={state?.applications} />
      <TalentPoolPreview talentPool={state?.talentPool} />
    </div>
  );
};
```

### 2. Kelola Rekrutmen (Recruitment Management) [25, 32, 41, 49]

```typescript
// components/industri/RecruitmentManagement.tsx
interface RecruitmentManagementProps {
  employerId: string;
}

interface JobApplication {
  id: string;
  jobId: string;
  userId: string;
  candidateName: string;
  candidateEmail: string;
  appliedAt: Date;
  status: 'pending' | 'reviewing' | 'shortlisted' | 'rejected' | 'interview_scheduled' | 'hired';
  certificates: Certificate[];
  resume: string;
  coverLetter: string;
  interview?: Interview;
  hiringDecision?: HiringDecision;
}

export const RecruitmentManagement: React.FC<RecruitmentManagementProps> = ({ employerId }) => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);

  const handleReviewApplication = async (applicationId: string) => {
    // Step 1: Get application details [25, 32]
    const application = await api.getJobApplication(applicationId);

    // Step 2: Verify candidate certificates [52]
    const verifiedCertificates = await Promise.all(
      application.certificates.map(cert =>
        api.verifyCertificate(cert.id)
      )
    );

    // Step 3: Check skill match
    const job = await api.getJob(application.jobId);
    const skillMatch = calculateSkillMatch(application, job.requirements);

    // Step 4: Show review interface
    setSelectedApplication({
      ...application,
      verifiedCertificates,
      skillMatch
    });
  };

  const handleShortlist = async (applicationId: string) => {
    // Update application status [41]
    await api.updateApplicationStatus(applicationId, 'shortlisted');

    // Send notification to candidate
    const application = await api.getJobApplication(applicationId);
    await notificationService.send({
      userId: application.userId,
      type: 'application_shortlisted',
      title: 'Application Shortlisted',
      message: `Your application has been shortlisted`
    });

    setApplications(applications.map(app =>
      app.id === applicationId ? { ...app, status: 'shortlisted' } : app
    ));
  };

  const handleScheduleInterview = async (applicationId: string, interviewData: InterviewData) => {
    // Step 1: Create interview [49]
    const interview = await api.scheduleInterview({
      applicationId,
      ...interviewData,
      status: 'scheduled'
    });

    // Step 2: Update application status
    await api.updateApplicationStatus(applicationId, 'interview_scheduled');

    // Step 3: Send notifications
    const application = await api.getJobApplication(applicationId);
    await Promise.all([
      notificationService.send({
        userId: application.userId,
        type: 'interview_scheduled',
        title: 'Interview Scheduled',
        message: `Interview scheduled for ${interviewData.date}`
      }),
      notificationService.send({
        userId: employerId,
        type: 'interview_scheduled',
        title: 'Interview Scheduled',
        message: `Interview with ${application.candidateName} scheduled`
      })
    ]);

    setApplications(applications.map(app =>
      app.id === applicationId 
        ? { ...app, status: 'interview_scheduled', interview } 
        : app
    ));
  };

  const handleHiringDecision = async (
    applicationId: string,
    decision: 'accept' | 'reject'
  ) => {
    // Step 1: Create hiring decision [53]
    const hiringDecision = await api.createHiringDecision({
      applicationId,
      decision,
      decidedAt: new Date(),
      decidedBy: employerId
    });

    // Step 2: Process decision [54, 55, 57, 58]
    if (decision === 'accept') {
      await processHiringAcceptance(applicationId, hiringDecision);
    } else {
      await processHiringRejection(applicationId, hiringDecision);
    }

    // Step 3: Update application status
    await api.updateApplicationStatus(
      applicationId,
      decision === 'accept' ? 'hired' : 'rejected'
    );

    setApplications(applications.map(app =>
      app.id === applicationId 
        ? { ...app, status: decision === 'accept' ? 'hired' : 'rejected', hiringDecision } 
        : app
    ));
  };

  return (
    <div className="recruitment-management">
      <ApplicationList 
        applications={applications}
        onSelect={setSelectedApplication}
        onReview={handleReviewApplication}
        onShortlist={handleShortlist}
        onScheduleInterview={handleScheduleInterview}
        onHiringDecision={handleHiringDecision}
      />
      {selectedApplication && (
        <ApplicationDetail 
          application={selectedApplication}
          onAction={handleAction}
        />
      )}
    </div>
  );
};
```

**Hiring Decision Processing [53, 54, 55, 57, 58]:**
```typescript
// workflows/hiringDecision.ts
export const processHiringAcceptance = async (
  applicationId: string,
  decision: HiringDecision
): Promise<void> => {
  // Step 1: Get application details
  const application = await api.getJobApplication(applicationId);

  // Step 2: Initiate hiring process [54]
  const hiringProcess = await api.createHiringProcess({
    applicationId,
    jobId: application.jobId,
    candidateId: application.userId,
    employerId: application.employerId,
    startedAt: new Date(),
    status: 'in_progress'
  });

  // Step 3: Send offer letter
  await api.sendOfferLetter({
    candidateId: application.userId,
    jobId: application.jobId,
    offerDetails: decision.offerDetails
  });

  // Step 4: Update job status (reduce available positions)
  const job = await api.getJob(application.jobId);
  await api.updateJob(application.jobId, {
    positionsFilled: (job.positionsFilled || 0) + 1,
    positionsAvailable: job.positionsAvailable - 1
  });

  // Step 5: Send notifications
  await notificationService.send({
    userId: application.userId,
    type: 'hiring_acceptance',
    title: 'Congratulations!',
    message: `You have been selected for the position`
  });
};

export const processHiringRejection = async (
  applicationId: string,
  decision: HiringDecision
): Promise<void> => {
  // Step 1: Get application details
  const application = await api.getJobApplication(applicationId);

  // Step 2: Check if should save to talent pool [57, 58]
  if (decision.saveToTalentPool) {
    await saveToTalentPool(application.userId, application.employerId, decision.reason);
  }

  // Step 3: Send rejection notification
  await notificationService.send({
    userId: application.userId,
    type: 'hiring_rejection',
    title: 'Application Update',
    message: decision.feedback || 'Thank you for your interest'
  });
};

export const saveToTalentPool = async (
  candidateId: string,
  employerId: string,
  reason: string
): Promise<void> => {
  // Step 1: Check if already in talent pool
  const existing = await api.getTalentPoolEntry(candidateId, employerId);
  if (existing) {
    await api.updateTalentPoolEntry(existing.id, {
      reason,
      updatedAt: new Date()
    });
    return;
  }

  // Step 2: Add to talent pool [58]
  await api.addToTalentPool({
    candidateId,
    employerId,
    reason,
    addedAt: new Date(),
    status: 'active'
  });

  // Step 3: Send notification to candidate (optional)
  await notificationService.send({
    userId: candidateId,
    type: 'talent_pool_added',
    title: 'Added to Talent Pool',
    message: 'You have been added to our talent pool for future opportunities'
  });
};
```

### 3. Posting Lowongan (Job Posting) [26, 33, 42, 50]

```typescript
// components/industri/JobPosting.tsx
interface JobPostingFormData {
  title: string;
  description: string;
  location: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  requirements: {
    skills: string[];
    skkniCodes: string[];
    aqrfLevel: number;
    minExperience: number;
    certificates: string[];
    education: string[];
  };
  positionsAvailable: number;
  employmentType: 'full_time' | 'part_time' | 'contract' | 'internship';
  benefits: string[];
  applicationDeadline: Date;
}

export const JobPosting: React.FC = ({ employerId }) => {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [editingJob, setEditingJob] = useState<JobListing | null>(null);

  const handleCreateJob = async (formData: JobPostingFormData) => {
    // Step 1: Create job posting [26]
    const job = await api.createJob({
      ...formData,
      employerId,
      status: 'draft',
      postedAt: null
    });

    // Step 2: Set requirements [42]
    await api.setJobRequirements(job.id, formData.requirements);

    // Step 3: Publish job [50]
    if (formData.publish) {
      await api.publishJob(job.id);
      
      // Step 4: Make visible to Talenta [59, 65]
      await api.publishJobToTalenta(job.id);
    }

    setJobs([...jobs, job]);
    showNotification('Job posting created successfully', 'success');
  };

  const handlePublishJob = async (jobId: string) => {
    // Step 1: Validate job data
    const job = await api.getJob(jobId);
    if (!job.requirements || !job.description) {
      showNotification('Please complete all required fields', 'error');
      return;
    }

    // Step 2: Publish job [50]
    await api.publishJob(jobId);

    // Step 3: Make visible to Talenta [59]
    await api.publishJobToTalenta(jobId);

    // Step 4: Send notification to matching candidates (optional)
    const matchingCandidates = await api.findMatchingCandidates(jobId);
    await Promise.all(
      matchingCandidates.map(candidate =>
        notificationService.send({
          userId: candidate.userId,
          type: 'job_match',
          title: 'New Job Opportunity',
          message: `A new job matches your profile: ${job.title}`
        })
      )
    );

    setJobs(jobs.map(j => j.id === jobId ? { ...j, status: 'published' } : j));
    showNotification('Job published successfully', 'success');
  };

  return (
    <div className="job-posting">
      <JobList jobs={jobs} onEdit={setEditingJob} />
      <JobForm 
        job={editingJob}
        onSubmit={handleCreateJob}
        onPublish={handlePublishJob}
      />
    </div>
  );
};
```

**Job Requirements Setting [42]:**
```typescript
// workflows/jobRequirements.ts
export const setJobRequirements = async (
  jobId: string,
  requirements: JobRequirements
): Promise<void> => {
  // Step 1: Validate requirements
  if (requirements.skills.length === 0) {
    throw new Error('At least one skill is required');
  }

  // Step 2: Validate SKKNI codes
  if (requirements.skkniCodes.length > 0) {
    const validSkkniCodes = await Promise.all(
      requirements.skkniCodes.map(code => api.validateSkkniCode(code))
    );
    if (validSkkniCodes.some(v => !v.valid)) {
      throw new Error('Invalid SKKNI codes');
    }
  }

  // Step 3: Validate AQRF level
  if (requirements.aqrfLevel && (requirements.aqrfLevel < 1 || requirements.aqrfLevel > 8)) {
    throw new Error('AQRF level must be between 1 and 8');
  }

  // Step 4: Save requirements
  await api.saveJobRequirements(jobId, requirements);

  // Step 5: Create search index for talent matching
  await searchService.indexJob(jobId, requirements);
};
```

### 4. Cari Talenta (Talent Search) [40, 48, 58]

```typescript
// components/industri/TalentSearch.tsx
interface TalentSearchProps {
  employerId: string;
}

interface Talent {
  id: string;
  userId: string;
  name: string;
  location: string;
  skills: Skill[];
  certificates: Certificate[];
  aqrfLevel: number;
  experience: number;
  matchScore: number;
}

export const TalentSearch: React.FC<TalentSearchProps> = ({ employerId }) => {
  const [talents, setTalents] = useState<Talent[]>([]);
  const [talentPool, setTalentPool] = useState<Talent[]>([]);
  const [filter, setFilter] = useState({
    skills: [],
    skkniCodes: [],
    aqrfLevel: null,
    location: '',
    minExperience: 0,
    hasCertificates: false
  });

  const handleSearch = async () => {
    // Step 1: Search talents [40]
    const results = await api.searchTalents({
      ...filter,
      employerId
    });

    // Step 2: Calculate match scores
    const talentsWithScores = await Promise.all(
      results.map(async (talent) => {
        const matchScore = await calculateTalentMatchScore(talent, filter);
        return { ...talent, matchScore };
      })
    );

    // Step 3: Sort by match score
    talentsWithScores.sort((a, b) => b.matchScore - a.matchScore);

    setTalents(talentsWithScores);
  };

  const handleSaveToTalentPool = async (talentId: string) => {
    // Step 1: Check if already in pool
    const existing = await api.getTalentPoolEntry(talentId, employerId);
    if (existing) {
      showNotification('Talent already in pool', 'info');
      return;
    }

    // Step 2: Add to talent pool [58]
    await api.addToTalentPool({
      candidateId: talentId,
      employerId,
      reason: 'Saved from search',
      addedAt: new Date(),
      status: 'active'
    });

    // Step 3: Update local state
    setTalentPool([...talentPool, talents.find(t => t.id === talentId)!]);
    showNotification('Talent added to pool', 'success');
  };

  const handleViewTalentProfile = async (talentId: string) => {
    // Step 1: Get full talent profile
    const profile = await api.getTalentProfile(talentId);

    // Step 2: Verify certificates [52]
    const verifiedCertificates = await Promise.all(
      profile.certificates.map(cert =>
        api.verifyCertificate(cert.id)
      )
    );

    // Step 3: Show profile view
    return {
      ...profile,
      verifiedCertificates
    };
  };

  return (
    <div className="talent-search">
      <SearchFilters filter={filter} onFilterChange={setFilter} onSearch={handleSearch} />
      <TalentList 
        talents={talents}
        onSaveToPool={handleSaveToTalentPool}
        onViewProfile={handleViewTalentProfile}
      />
      <TalentPoolSection 
        talentPool={talentPool}
        onRemove={handleRemoveFromPool}
        onContact={handleContactTalent}
      />
    </div>
  );
};
```

**Talent Match Score Calculation [40, 48]:**
```typescript
// workflows/talentMatching.ts
export const calculateTalentMatchScore = async (
  talent: Talent,
  jobRequirements: JobRequirements
): Promise<number> => {
  let score = 0;
  const weights = {
    skills: 0.3,
    certificates: 0.25,
    aqrfLevel: 0.2,
    experience: 0.15,
    location: 0.1
  };

  // Skills match (30%)
  const talentSkills = talent.skills.map(s => s.name.toLowerCase());
  const requiredSkills = jobRequirements.skills.map(s => s.toLowerCase());
  const matchedSkills = requiredSkills.filter(s => talentSkills.includes(s));
  const skillsScore = (matchedSkills.length / requiredSkills.length) * 100;
  score += skillsScore * weights.skills;

  // Certificates match (25%)
  if (jobRequirements.certificates && jobRequirements.certificates.length > 0) {
    const talentCertIds = talent.certificates.map(c => c.id);
    const matchedCerts = jobRequirements.certificates.filter(c => talentCertIds.includes(c));
    const certsScore = (matchedCerts.length / jobRequirements.certificates.length) * 100;
    score += certsScore * weights.certificates;
  } else {
    score += 100 * weights.certificates; // No requirement = full score
  }

  // AQRF level match (20%)
  if (jobRequirements.aqrfLevel) {
    if (talent.aqrfLevel >= jobRequirements.aqrfLevel) {
      score += 100 * weights.aqrfLevel;
    } else {
      const levelScore = (talent.aqrfLevel / jobRequirements.aqrfLevel) * 100;
      score += levelScore * weights.aqrfLevel;
    }
  } else {
    score += 100 * weights.aqrfLevel;
  }

  // Experience match (15%)
  if (jobRequirements.minExperience) {
    if (talent.experience >= jobRequirements.minExperience) {
      score += 100 * weights.experience;
    } else {
      const expScore = (talent.experience / jobRequirements.minExperience) * 100;
      score += expScore * weights.experience;
    }
  } else {
    score += 100 * weights.experience;
  }

  // Location match (10%)
  if (jobRequirements.location && talent.location) {
    if (talent.location.toLowerCase() === jobRequirements.location.toLowerCase()) {
      score += 100 * weights.location;
    } else {
      // Partial match (same city/province)
      score += 50 * weights.location;
    }
  } else {
    score += 100 * weights.location;
  }

  return Math.round(score);
};
```

## State Management

```typescript
// store/industriStore.ts
interface IndustriState {
  profile: IndustriProfile | null;
  jobs: JobListing[];
  applications: JobApplication[];
  talentPool: Talent[];
  interviews: Interview[];
  taxIncentives: TaxIncentive[];
}

export const useIndustriStore = create<IndustriState>((set, get) => ({
  profile: null,
  jobs: [],
  applications: [],
  talentPool: [],
  interviews: [],
  taxIncentives: [],

  // Actions
  setProfile: (profile) => set({ profile }),
  addJob: (job) => set(state => ({ jobs: [...state.jobs, job] })),
  updateJob: (jobId, updates) => set(state => ({
    jobs: state.jobs.map(j => j.id === jobId ? { ...j, ...updates } : j)
  })),
  addApplication: (application) => set(state => ({
    applications: [...state.applications, application]
  })),
  updateApplicationStatus: (applicationId, status) => set(state => ({
    applications: state.applications.map(app =>
      app.id === applicationId ? { ...app, status } : app
    )
  })),
  addToTalentPool: (talent) => set(state => ({
    talentPool: [...state.talentPool, talent]
  }))
}));
```

## API Endpoints

```typescript
// api/industriApi.ts
export const industriApi = {
  // Dashboard [18]
  getDashboard: (employerId: string) => GET(`/api/v1/industri/${employerId}/dashboard`),

  // Recruitment Management [25, 32, 41, 49]
  getJobApplications: (jobId: string) => GET(`/api/v1/industri/jobs/${jobId}/applications`),
  getJobApplication: (applicationId: string) => 
    GET(`/api/v1/industri/applications/${applicationId}`),
  updateApplicationStatus: (applicationId: string, status: string) => 
    PATCH(`/api/v1/industri/applications/${applicationId}`, { status }),
  scheduleInterview: (interviewData: InterviewData) => 
    POST('/api/v1/industri/interviews', interviewData),
  createHiringDecision: (decisionData: HiringDecisionData) => 
    POST('/api/v1/industri/hiring-decisions', decisionData),

  // Job Posting [26, 33, 42, 50]
  createJob: (jobData: JobData) => POST('/api/v1/industri/jobs', jobData),
  updateJob: (jobId: string, updates: Partial<JobListing>) => 
    PATCH(`/api/v1/industri/jobs/${jobId}`, updates),
  publishJob: (jobId: string) => POST(`/api/v1/industri/jobs/${jobId}/publish`),
  setJobRequirements: (jobId: string, requirements: JobRequirements) => 
    POST(`/api/v1/industri/jobs/${jobId}/requirements`, requirements),
  publishJobToTalenta: (jobId: string) => 
    POST(`/api/v1/industri/jobs/${jobId}/publish-to-talenta`),

  // Talent Search [40, 48, 58]
  searchTalents: (filter: TalentSearchFilter) => 
    GET('/api/v1/industri/talents/search', { params: filter }),
  getTalentProfile: (talentId: string) => 
    GET(`/api/v1/industri/talents/${talentId}/profile`),
  verifyCertificate: (certificateId: string) => 
    GET(`/api/v1/industri/certificates/${certificateId}/verify`),
  addToTalentPool: (talentPoolData: TalentPoolData) => 
    POST('/api/v1/industri/talent-pool', talentPoolData),
  getTalentPool: (employerId: string) => 
    GET(`/api/v1/industri/${employerId}/talent-pool`),

  // Tax Incentives
  getTaxIncentives: (employerId: string) => 
    GET(`/api/v1/industri/${employerId}/tax-incentives`),
  generateTaxReport: (employerId: string, year: number) => 
    GET(`/api/v1/industri/${employerId}/tax-reports/${year}`)
};
```

---

**Last Updated**: 2024-01-15  
**Version**: 1.0.0


