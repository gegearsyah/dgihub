# Alur Talenta (Learner Path) Implementation

## Overview

This document implements the functional workflows for the Talent/Learner track based on the platform flow chart nodes [30-31, 46-47, 63-64, 60-62].

## Component Architecture

### 1. Talenta Dashboard [24]

```typescript
// components/talenta/Dashboard.tsx
interface TalentaDashboardProps {
  userId: string;
}

interface DashboardState {
  activeCourses: Course[];
  enrolledWorkshops: Workshop[];
  jobApplications: JobApplication[];
  certificates: Certificate[];
  profile: TalentaProfile;
  stats: {
    coursesCompleted: number;
    certificatesEarned: number;
    applicationsSubmitted: number;
    interviewsScheduled: number;
  };
}

export const TalentaDashboard: React.FC<TalentaDashboardProps> = ({ userId }) => {
  const [state, setState] = useState<DashboardState>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData(userId);
  }, [userId]);

  const loadDashboardData = async (userId: string) => {
    const [courses, workshops, applications, certificates, profile] = await Promise.all([
      api.getActiveCourses(userId),
      api.getEnrolledWorkshops(userId),
      api.getJobApplications(userId),
      api.getCertificates(userId),
      api.getTalentaProfile(userId)
    ]);

    setState({
      activeCourses: courses,
      enrolledWorkshops: workshops,
      jobApplications: applications,
      certificates: certificates,
      profile: profile,
      stats: {
        coursesCompleted: courses.filter(c => c.status === 'completed').length,
        certificatesEarned: certificates.length,
        applicationsSubmitted: applications.length,
        interviewsScheduled: applications.filter(a => a.interviewScheduled).length
      }
    });
    setLoading(false);
  };

  return (
    <div className="talenta-dashboard">
      <DashboardHeader profile={state?.profile} />
      <StatsCards stats={state?.stats} />
      <QuickActions />
      <ActiveCoursesSection courses={state?.activeCourses} />
      <EnrolledWorkshopsSection workshops={state?.enrolledWorkshops} />
      <JobApplicationsSection applications={state?.jobApplications} />
      <CertificatesSection certificates={state?.certificates} />
    </div>
  );
};
```

### 2. Digital Learning Hub [30, 37, 46, 61]

```typescript
// components/talenta/DigitalLearningHub.tsx
interface DigitalLearningHubProps {
  userId: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  provider: string;
  duration: number;
  price: number;
  skkniCode: string;
  aqrfLevel: number;
  materials: CourseMaterial[];
  status: 'available' | 'enrolled' | 'completed';
  certificateEligible: boolean;
}

export const DigitalLearningHub: React.FC<DigitalLearningHubProps> = ({ userId }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filter, setFilter] = useState({
    search: '',
    skkni: '',
    aqrfLevel: '',
    provider: '',
    priceRange: [0, 10000000]
  });

  const loadCourses = async () => {
    const data = await api.getCourses(filter);
    setCourses(data);
  };

  const handleEnroll = async (courseId: string) => {
    await api.enrollInCourse(userId, courseId);
    await loadCourses();
    // Show success notification
    showNotification('Successfully enrolled in course', 'success');
  };

  const handleCompleteCourse = async (courseId: string) => {
    const result = await api.completeCourse(userId, courseId);
    if (result.certificateEligible) {
      // Trigger certificate issuance [61]
      await api.requestCertificate(userId, courseId);
      showNotification('Certificate will be issued upon verification', 'info');
    }
  };

  return (
    <div className="digital-learning-hub">
      <SearchAndFilters filter={filter} onFilterChange={setFilter} />
      <CourseGrid 
        courses={courses}
        onEnroll={handleEnroll}
        onComplete={handleCompleteCourse}
      />
    </div>
  );
};
```

**Course Enrollment Flow [37, 46]:**
```typescript
// workflows/courseEnrollment.ts
export const enrollInCourse = async (
  userId: string,
  courseId: string
): Promise<EnrollmentResult> => {
  // Step 1: Check prerequisites
  const prerequisites = await api.getCoursePrerequisites(courseId);
  const userCertificates = await api.getUserCertificates(userId);
  const hasPrerequisites = checkPrerequisites(prerequisites, userCertificates);

  if (!hasPrerequisites) {
    throw new Error('Prerequisites not met');
  }

  // Step 2: Check payment (if required)
  const course = await api.getCourse(courseId);
  if (course.price > 0) {
    const paymentResult = await processPayment(userId, courseId, course.price);
    if (!paymentResult.success) {
      throw new Error('Payment failed');
    }
  }

  // Step 3: Create enrollment
  const enrollment = await api.createEnrollment({
    userId,
    courseId,
    enrolledAt: new Date(),
    status: 'active'
  });

  // Step 4: Grant access to materials
  await api.grantCourseAccess(userId, courseId);

  // Step 5: Send notification
  await notificationService.send({
    userId,
    type: 'course_enrolled',
    title: 'Course Enrollment Confirmed',
    message: `You have been enrolled in ${course.title}`
  });

  return enrollment;
};
```

**Certificate Flow [61, 60, 62]:**
```typescript
// workflows/certificateFlow.ts
export const handleCertificateIssuance = async (
  userId: string,
  courseId: string
): Promise<Certificate> => {
  // Step 1: Verify course completion
  const enrollment = await api.getEnrollment(userId, courseId);
  if (enrollment.status !== 'completed') {
    throw new Error('Course not completed');
  }

  // Step 2: Verify assessment scores
  const assessments = await api.getCourseAssessments(userId, courseId);
  const passingScore = await api.getCoursePassingScore(courseId);
  const hasPassed = assessments.every(a => a.score >= passingScore);

  if (!hasPassed) {
    throw new Error('Assessment scores not sufficient');
  }

  // Step 3: Issue certificate [45 -> 61]
  const certificate = await api.issueCertificate({
    userId,
    courseId,
    issuerId: enrollment.providerId,
    issuedAt: new Date(),
    credentialType: 'COURSE_COMPLETION',
    skkniCode: enrollment.course.skkniCode,
    aqrfLevel: enrollment.course.aqrfLevel
  });

  // Step 4: Update talent profile [39, 62]
  await api.updateTalentaProfile(userId, {
    certificates: [...(await api.getUserCertificates(userId)), certificate.id]
  });

  // Step 5: Make visible to Industry [52]
  await api.publishCertificateToIndustry(certificate.id);

  // Step 6: Send notification
  await notificationService.send({
    userId,
    type: 'certificate_issued',
    title: 'Certificate Earned!',
    message: `You have earned a certificate for ${enrollment.course.title}`,
    action: {
      label: 'View Certificate',
      url: `/certificates/${certificate.id}`
    }
  });

  return certificate;
};
```

### 3. Cari Praktek/Mitra (Workshop Search) [31, 38, 47]

```typescript
// components/talenta/WorkshopSearch.tsx
interface Workshop {
  id: string;
  title: string;
  provider: string;
  location: string;
  startDate: Date;
  endDate: Date;
  capacity: number;
  enrolled: number;
  price: number;
  tefaLocation: {
    id: string;
    name: string;
    address: string;
    coordinates: { lat: number; lng: number };
  };
  status: 'open' | 'full' | 'closed';
}

export const WorkshopSearch: React.FC = () => {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [filter, setFilter] = useState({
    location: '',
    dateRange: { start: null, end: null },
    provider: '',
    priceRange: [0, 10000000]
  });

  const handleRegister = async (workshopId: string) => {
    // Step 1: Check availability
    const workshop = await api.getWorkshop(workshopId);
    if (workshop.enrolled >= workshop.capacity) {
      showNotification('Workshop is full', 'error');
      return;
    }

    // Step 2: Register for workshop [47]
    const registration = await api.registerForWorkshop(userId, workshopId);

    // Step 3: Set up attendance tracking [38]
    await api.setupAttendanceTracking(registration.id, workshop.tefaLocation);

    // Step 4: Send confirmation
    showNotification('Successfully registered for workshop', 'success');
  };

  return (
    <div className="workshop-search">
      <WorkshopFilters filter={filter} onFilterChange={setFilter} />
      <WorkshopList 
        workshops={workshops}
        onRegister={handleRegister}
      />
    </div>
  );
};
```

**Workshop Attendance Tracking [38]:**
```typescript
// workflows/workshopAttendance.ts
export const trackWorkshopAttendance = async (
  registrationId: string,
  location: { lat: number; lng: number }
): Promise<AttendanceRecord> => {
  // Step 1: Get user's current location
  const userLocation = await getCurrentLocation();

  // Step 2: Verify within geofence
  const workshop = await api.getWorkshopByRegistration(registrationId);
  const withinGeofence = checkGeofence(userLocation, workshop.tefaLocation);

  if (!withinGeofence) {
    throw new Error('Not within workshop location');
  }

  // Step 3: Record attendance [38]
  const attendance = await api.recordAttendance({
    registrationId,
    userId: workshop.userId,
    timestamp: new Date(),
    location: userLocation,
    method: 'GPS',
    verified: true
  });

  // Step 4: Generate xAPI statement
  await lrsService.createStatement({
    actor: { id: workshop.userId },
    verb: { id: 'http://adlnet.gov/expapi/verbs/attended' },
    object: { id: `workshop:${workshop.id}` },
    result: { success: true },
    context: {
      extensions: {
        'https://dgihub.go.id/extensions/gps': userLocation
      }
    }
  });

  return attendance;
};
```

### 4. Career Engine (Job Search & Applications) [63, 64, 65, 67]

```typescript
// components/talenta/CareerEngine.tsx
interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: { min: number; max: number };
  requirements: {
    skills: string[];
    skkniCodes: string[];
    aqrfLevel: number;
    certificates: string[];
  };
  description: string;
  postedAt: Date;
  status: 'open' | 'closed';
}

export const CareerEngine: React.FC = () => {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [filter, setFilter] = useState({
    search: '',
    location: '',
    skills: [],
    salaryRange: [0, 50000000],
    aqrfLevel: ''
  });

  const handleApply = async (jobId: string) => {
    // Step 1: Check eligibility [64]
    const job = await api.getJob(jobId);
    const userProfile = await api.getTalentaProfile(userId);
    const eligibility = checkJobEligibility(job, userProfile);

    if (!eligibility.eligible) {
      showNotification(eligibility.reason, 'warning');
      return;
    }

    // Step 2: Create application [65]
    const application = await api.createJobApplication({
      userId,
      jobId,
      appliedAt: new Date(),
      status: 'pending',
      coverLetter: '',
      resume: userProfile.resumeUrl
    });

    // Step 3: Attach relevant certificates [61 -> 65]
    const relevantCertificates = await api.getRelevantCertificates(
      userId,
      job.requirements
    );
    await api.attachCertificatesToApplication(application.id, relevantCertificates);

    // Step 4: Send notification to employer
    await notificationService.send({
      userId: job.companyId,
      type: 'new_application',
      title: 'New Job Application',
      message: `${userProfile.name} applied for ${job.title}`
    });

    setApplications([...applications, application]);
    showNotification('Application submitted successfully', 'success');
  };

  const handleInterviewSchedule = async (applicationId: string, interviewData: InterviewData) => {
    // Step 5: Schedule interview [67]
    const interview = await api.scheduleInterview({
      applicationId,
      scheduledAt: interviewData.date,
      location: interviewData.location,
      type: interviewData.type,
      status: 'scheduled'
    });

    // Send notifications
    await Promise.all([
      notificationService.send({
        userId,
        type: 'interview_scheduled',
        title: 'Interview Scheduled',
        message: `Interview scheduled for ${interviewData.date}`
      }),
      notificationService.send({
        userId: interview.employerId,
        type: 'interview_scheduled',
        title: 'Interview Scheduled',
        message: `Interview with candidate scheduled`
      })
    ]);
  };

  return (
    <div className="career-engine">
      <JobSearch filter={filter} onFilterChange={setFilter} />
      <JobListings 
        jobs={jobs}
        onApply={handleApply}
      />
      <MyApplications 
        applications={applications}
        onScheduleInterview={handleInterviewSchedule}
      />
    </div>
  );
};
```

**Job Application Eligibility Check [64]:**
```typescript
// workflows/jobApplicationEligibility.ts
export const checkJobEligibility = async (
  job: JobListing,
  userProfile: TalentaProfile
): Promise<EligibilityResult> => {
  const checks = {
    skills: false,
    certificates: false,
    aqrfLevel: false,
    experience: false
  };

  // Check skills
  const userSkills = userProfile.skills || [];
  checks.skills = job.requirements.skills.every(skill => 
    userSkills.some(us => us.name.toLowerCase() === skill.toLowerCase())
  );

  // Check certificates [61]
  const userCertificates = await api.getUserCertificates(userProfile.userId);
  checks.certificates = job.requirements.certificates.every(certId =>
    userCertificates.some(uc => uc.id === certId || uc.skkniCode === certId)
  );

  // Check AQRF level
  const highestAQRF = Math.max(...userCertificates.map(c => c.aqrfLevel || 0));
  checks.aqrfLevel = highestAQRF >= job.requirements.aqrfLevel;

  // Check experience (if required)
  if (job.requirements.minExperience) {
    checks.experience = userProfile.experienceYears >= job.requirements.minExperience;
  } else {
    checks.experience = true;
  }

  const allChecksPassed = Object.values(checks).every(v => v === true);

  return {
    eligible: allChecksPassed,
    checks,
    reason: allChecksPassed 
      ? 'Eligible' 
      : `Missing: ${Object.entries(checks).filter(([_, v]) => !v).map(([k]) => k).join(', ')}`
  };
};
```

## State Management

```typescript
// store/talentaStore.ts
interface TalentaState {
  profile: TalentaProfile | null;
  courses: {
    available: Course[];
    enrolled: Course[];
    completed: Course[];
  };
  workshops: {
    available: Workshop[];
    enrolled: Workshop[];
    completed: Workshop[];
  };
  certificates: Certificate[];
  jobApplications: JobApplication[];
  interviews: Interview[];
}

export const useTalentaStore = create<TalentaState>((set, get) => ({
  profile: null,
  courses: { available: [], enrolled: [], completed: [] },
  workshops: { available: [], enrolled: [], completed: [] },
  certificates: [],
  jobApplications: [],
  interviews: [],

  // Actions
  setProfile: (profile) => set({ profile }),
  addCertificate: (certificate) => set(state => ({
    certificates: [...state.certificates, certificate]
  })),
  addJobApplication: (application) => set(state => ({
    jobApplications: [...state.jobApplications, application]
  })),
  updateApplicationStatus: (applicationId, status) => set(state => ({
    jobApplications: state.jobApplications.map(app =>
      app.id === applicationId ? { ...app, status } : app
    )
  }))
}));
```

## API Endpoints

```typescript
// api/talentaApi.ts
export const talentaApi = {
  // Dashboard
  getDashboard: (userId: string) => GET(`/api/v1/talenta/${userId}/dashboard`),

  // Digital Learning Hub [30, 37, 46]
  getCourses: (filter: CourseFilter) => GET('/api/v1/talenta/courses', { params: filter }),
  enrollInCourse: (userId: string, courseId: string) => 
    POST(`/api/v1/talenta/${userId}/courses/${courseId}/enroll`),
  getCourseMaterials: (courseId: string) => 
    GET(`/api/v1/talenta/courses/${courseId}/materials`),
  completeCourse: (userId: string, courseId: string) => 
    POST(`/api/v1/talenta/${userId}/courses/${courseId}/complete`),

  // Certificates [61, 60, 62]
  getCertificates: (userId: string) => GET(`/api/v1/talenta/${userId}/certificates`),
  requestCertificate: (userId: string, courseId: string) => 
    POST(`/api/v1/talenta/${userId}/certificates/request`, { courseId }),
  getCertificate: (certificateId: string) => 
    GET(`/api/v1/talenta/certificates/${certificateId}`),

  // Workshop Search [31, 38, 47]
  getWorkshops: (filter: WorkshopFilter) => GET('/api/v1/talenta/workshops', { params: filter }),
  registerForWorkshop: (userId: string, workshopId: string) => 
    POST(`/api/v1/talenta/${userId}/workshops/${workshopId}/register`),
  recordAttendance: (registrationId: string, location: Location) => 
    POST(`/api/v1/talenta/workshops/${registrationId}/attendance`, { location }),

  // Career Engine [63, 64, 65, 67]
  getJobListings: (filter: JobFilter) => GET('/api/v1/talenta/jobs', { params: filter }),
  createJobApplication: (application: JobApplicationData) => 
    POST('/api/v1/talenta/applications', application),
  getJobApplications: (userId: string) => 
    GET(`/api/v1/talenta/${userId}/applications`),
  scheduleInterview: (interviewData: InterviewData) => 
    POST('/api/v1/talenta/interviews', interviewData),

  // Profile
  getTalentaProfile: (userId: string) => GET(`/api/v1/talenta/${userId}/profile`),
  updateTalentaProfile: (userId: string, updates: Partial<TalentaProfile>) => 
    PATCH(`/api/v1/talenta/${userId}/profile`, updates)
};
```

---

**Last Updated**: 2024-01-15  
**Version**: 1.0.0


