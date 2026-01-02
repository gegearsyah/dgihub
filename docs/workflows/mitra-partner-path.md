# Alur Mitra (Training Partner Path) Implementation

## Overview

This document implements the functional workflows for the Training Partner (Mitra/LPK) track based on the platform flow chart nodes [27-29, 34-36, 43-45].

## Component Architecture

### 1. Mitra Dashboard [20]

```typescript
// components/mitra/Dashboard.tsx
interface MitraDashboardProps {
  partnerId: string;
}

interface MitraDashboardState {
  courses: Course[];
  workshops: Workshop[];
  participants: Participant[];
  certificates: Certificate[];
  stats: {
    totalCourses: number;
    activeCourses: number;
    totalParticipants: number;
    certificatesIssued: number;
    revenue: number;
  };
  accreditation: AccreditationStatus;
}

export const MitraDashboard: React.FC<MitraDashboardProps> = ({ partnerId }) => {
  const [state, setState] = useState<MitraDashboardState>();

  useEffect(() => {
    loadDashboardData(partnerId);
  }, [partnerId]);

  return (
    <div className="mitra-dashboard">
      <DashboardHeader partnerId={partnerId} />
      <StatsCards stats={state?.stats} />
      <AccreditationStatusCard accreditation={state?.accreditation} />
      <QuickActions />
      <ActiveCoursesSection courses={state?.courses} />
      <UpcomingWorkshopsSection workshops={state?.workshops} />
      <RecentParticipantsSection participants={state?.participants} />
    </div>
  );
};
```

### 2. Kelola Kursus (Course Management) [27, 34, 43, 51]

```typescript
// components/mitra/CourseManagement.tsx
interface CourseManagementProps {
  partnerId: string;
}

interface CourseFormData {
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  duration: number; // in hours
  price: number;
  skkniCode: string;
  aqrfLevel: number;
  prerequisites: string[];
  learningOutcomes: string[];
  modules: Module[];
}

export const CourseManagement: React.FC<CourseManagementProps> = ({ partnerId }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const handleCreateCourse = async (formData: CourseFormData) => {
    // Step 1: Create course [27]
    const course = await api.createCourse({
      ...formData,
      partnerId,
      status: 'draft'
    });

    // Step 2: Upload materials [34]
    if (formData.materials) {
      await uploadCourseMaterials(course.id, formData.materials);
    }

    // Step 3: Set pricing [51]
    await api.setCoursePricing(course.id, {
      price: formData.price,
      currency: 'IDR',
      paymentMethods: ['GOPAY', 'LINKAJA', 'OVO']
    });

    // Step 4: Register with SIPLatih [43]
    await api.registerCourseWithSIPLatih(course.id);

    setCourses([...courses, course]);
    showNotification('Course created successfully', 'success');
  };

  const handleUploadMaterials = async (courseId: string, materials: File[]) => {
    // Step 1: Validate materials
    const validatedMaterials = await validateMaterials(materials);

    // Step 2: Upload to S3 [34]
    const uploadPromises = validatedMaterials.map(async (material) => {
      const uploadResult = await s3Service.upload(material.file, {
        bucket: 'dgihub-course-materials',
        key: `courses/${courseId}/${material.file.name}`
      });

      return {
        ...material,
        url: uploadResult.url,
        uploadedAt: new Date()
      };
    });

    const uploadedMaterials = await Promise.all(uploadPromises);

    // Step 3: Save material metadata
    await api.saveCourseMaterials(courseId, uploadedMaterials);

    // Step 4: Update course status
    await api.updateCourse(courseId, { materialsUploaded: true });
  };

  return (
    <div className="course-management">
      <CourseList courses={courses} onEdit={setEditingCourse} />
      <CourseForm 
        course={editingCourse}
        onSubmit={handleCreateCourse}
        onUploadMaterials={handleUploadMaterials}
      />
    </div>
  );
};
```

**Course Material Upload Flow [34]:**
```typescript
// workflows/courseMaterialUpload.ts
export const uploadCourseMaterials = async (
  courseId: string,
  materials: File[]
): Promise<CourseMaterial[]> => {
  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
  const ALLOWED_TYPES = ['pdf', 'video/mp4', 'video/webm', 'image/jpeg', 'image/png'];

  // Step 1: Validate files
  const validatedFiles = materials.filter(file => {
    if (file.size > MAX_FILE_SIZE) {
      showNotification(`File ${file.name} exceeds 100MB limit`, 'error');
      return false;
    }
    if (!ALLOWED_TYPES.some(type => file.type.includes(type))) {
      showNotification(`File type ${file.type} not allowed`, 'error');
      return false;
    }
    return true;
  });

  // Step 2: Process files
  const processedMaterials = await Promise.all(
    validatedFiles.map(async (file) => {
      // Generate thumbnail for videos
      let thumbnailUrl = null;
      if (file.type.startsWith('video/')) {
        thumbnailUrl = await generateVideoThumbnail(file);
      }

      // Upload to S3
      const uploadResult = await s3Service.upload(file, {
        bucket: 'dgihub-course-materials',
        key: `courses/${courseId}/${Date.now()}-${file.name}`,
        metadata: {
          courseId,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size.toString()
        }
      });

      return {
        id: generateId(),
        courseId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        url: uploadResult.url,
        thumbnailUrl,
        uploadedAt: new Date(),
        status: 'active'
      };
    })
  );

  // Step 3: Save to database
  await api.saveCourseMaterials(courseId, processedMaterials);

  return processedMaterials;
};
```

**Course Scheduling [43]:**
```typescript
// workflows/courseScheduling.ts
export const scheduleCourse = async (
  courseId: string,
  schedule: CourseSchedule
): Promise<CourseSchedule> => {
  // Step 1: Validate schedule
  if (schedule.startDate < new Date()) {
    throw new Error('Start date must be in the future');
  }
  if (schedule.endDate <= schedule.startDate) {
    throw new Error('End date must be after start date');
  }

  // Step 2: Create schedule
  const courseSchedule = await api.createCourseSchedule({
    courseId,
    ...schedule,
    status: 'scheduled'
  });

  // Step 3: Notify enrolled students
  const enrollments = await api.getCourseEnrollments(courseId);
  await Promise.all(
    enrollments.map(enrollment =>
      notificationService.send({
        userId: enrollment.userId,
        type: 'course_scheduled',
        title: 'Course Schedule Updated',
        message: `The course schedule has been updated`,
        data: { courseId, schedule }
      })
    )
  );

  return courseSchedule;
};
```

### 3. Kelola Workshop (Workshop Management) [28, 35, 44]

```typescript
// components/mitra/WorkshopManagement.tsx
interface WorkshopFormData {
  title: string;
  description: string;
  tefaLocationId: string;
  startDate: Date;
  endDate: Date;
  capacity: number;
  price: number;
  instructorId: string;
  materials: string[];
}

export const WorkshopManagement: React.FC = ({ partnerId }) => {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [tefaLocations, setTefaLocations] = useState<TefaLocation[]>([]);

  const handleCreateWorkshop = async (formData: WorkshopFormData) => {
    // Step 1: Create workshop [28]
    const workshop = await api.createWorkshop({
      ...formData,
      partnerId,
      status: 'draft'
    });

    // Step 2: Set up TeFa location [35]
    const tefaLocation = await api.getTefaLocation(formData.tefaLocationId);
    await api.linkWorkshopToTefa(workshop.id, tefaLocation.id);

    // Step 3: Create schedule [44]
    await api.createWorkshopSchedule({
      workshopId: workshop.id,
      startDate: formData.startDate,
      endDate: formData.endDate,
      sessions: generateWorkshopSessions(formData.startDate, formData.endDate)
    });

    // Step 4: Set up geofence for attendance
    await api.createGeofence({
      tefaLocationId: tefaLocation.id,
      center: tefaLocation.coordinates,
      radius: 100, // 100 meters
      type: 'CIRCLE'
    });

    setWorkshops([...workshops, workshop]);
    showNotification('Workshop created successfully', 'success');
  };

  const handleManageRegistrations = async (workshopId: string) => {
    // Get all registrations
    const registrations = await api.getWorkshopRegistrations(workshopId);

    // Show registration management UI
    return (
      <RegistrationManagement 
        workshopId={workshopId}
        registrations={registrations}
        onApprove={handleApproveRegistration}
        onReject={handleRejectRegistration}
      />
    );
  };

  return (
    <div className="workshop-management">
      <WorkshopList workshops={workshops} />
      <WorkshopForm 
        tefaLocations={tefaLocations}
        onSubmit={handleCreateWorkshop}
      />
      <TefaLocationManager partnerId={partnerId} />
    </div>
  );
};
```

**Workshop Schedule Creation [44]:**
```typescript
// workflows/workshopScheduling.ts
export const createWorkshopSchedule = async (
  workshopId: string,
  scheduleData: WorkshopScheduleData
): Promise<WorkshopSchedule> => {
  // Step 1: Generate session schedule
  const sessions = generateSessions(
    scheduleData.startDate,
    scheduleData.endDate,
    scheduleData.sessionDuration,
    scheduleData.sessionsPerDay
  );

  // Step 2: Create schedule
  const schedule = await api.createWorkshopSchedule({
    workshopId,
    sessions,
    status: 'active'
  });

  // Step 3: Set up attendance tracking for each session
  await Promise.all(
    sessions.map(session =>
      api.setupSessionAttendanceTracking({
        sessionId: session.id,
        workshopId,
        requiresGPS: true,
        geofenceId: scheduleData.geofenceId
      })
    )
  );

  return schedule;
};
```

### 4. Kelola Peserta (Participant Management) [29, 36, 45]

```typescript
// components/mitra/ParticipantManagement.tsx
interface Participant {
  id: string;
  userId: string;
  name: string;
  email: string;
  enrolledAt: Date;
  progress: number;
  assessments: Assessment[];
  status: 'enrolled' | 'in_progress' | 'completed' | 'dropped';
  certificateEligible: boolean;
}

export const ParticipantManagement: React.FC = ({ courseId, partnerId }) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);

  const handleMonitorProgress = async (participantId: string) => {
    // Step 1: Get participant progress [29, 36]
    const progress = await api.getParticipantProgress(participantId, courseId);

    // Step 2: Get learning analytics
    const analytics = await api.getLearningAnalytics(participantId, courseId);

    // Step 3: Get xAPI statements
    const statements = await lrsService.getStatements({
      actor: { id: participantId },
      object: { id: `course:${courseId}` }
    });

    return {
      progress,
      analytics,
      statements
    };
  };

  const handleIssueCertificate = async (participantId: string) => {
    // Step 1: Verify completion [45]
    const participant = await api.getParticipant(participantId, courseId);
    if (participant.status !== 'completed') {
      showNotification('Participant has not completed the course', 'error');
      return;
    }

    // Step 2: Verify assessments
    const assessments = await api.getParticipantAssessments(participantId, courseId);
    const course = await api.getCourse(courseId);
    const hasPassed = assessments.every(a => a.score >= course.passingScore);

    if (!hasPassed) {
      showNotification('Participant has not passed all assessments', 'error');
      return;
    }

    // Step 3: Issue certificate [45]
    const certificate = await api.issueCertificate({
      userId: participantId,
      courseId,
      issuerId: partnerId,
      issuedAt: new Date(),
      credentialType: 'COURSE_COMPLETION',
      skkniCode: course.skkniCode,
      aqrfLevel: course.aqrfLevel
    });

    // Step 4: Update participant status
    await api.updateParticipant(participantId, courseId, {
      certificateIssued: true,
      certificateId: certificate.id
    });

    // Step 5: Send notification to participant
    await notificationService.send({
      userId: participantId,
      type: 'certificate_issued',
      title: 'Certificate Issued',
      message: `You have received a certificate for ${course.title}`
    });

    showNotification('Certificate issued successfully', 'success');
    return certificate;
  };

  return (
    <div className="participant-management">
      <ParticipantList 
        participants={participants}
        onSelect={setSelectedParticipant}
      />
      {selectedParticipant && (
        <ParticipantDetail 
          participant={selectedParticipant}
          onMonitorProgress={handleMonitorProgress}
          onIssueCertificate={handleIssueCertificate}
        />
      )}
    </div>
  );
};
```

**Progress Monitoring [29, 36]:**
```typescript
// workflows/participantProgressMonitoring.ts
export const monitorParticipantProgress = async (
  participantId: string,
  courseId: string
): Promise<ProgressReport> => {
  // Step 1: Get enrollment data
  const enrollment = await api.getEnrollment(participantId, courseId);

  // Step 2: Get module completion
  const modules = await api.getCourseModules(courseId);
  const completedModules = await Promise.all(
    modules.map(async (module) => {
      const completion = await api.getModuleCompletion(participantId, module.id);
      return {
        ...module,
        completed: completion.completed,
        progress: completion.progress,
        lastAccessed: completion.lastAccessed
      };
    })
  );

  // Step 3: Get assessment scores
  const assessments = await api.getParticipantAssessments(participantId, courseId);

  // Step 4: Get xAPI learning records
  const learningRecords = await lrsService.getStatements({
    actor: { id: participantId },
    object: { id: `course:${courseId}` },
    verb: { id: 'http://adlnet.gov/expapi/verbs/completed' }
  });

  // Step 5: Calculate overall progress
  const overallProgress = calculateProgress(completedModules, assessments);

  // Step 6: Check certificate eligibility
  const certificateEligible = checkCertificateEligibility(
    completedModules,
    assessments,
    enrollment.course
  );

  return {
    enrollment,
    modules: completedModules,
    assessments,
    learningRecords,
    overallProgress,
    certificateEligible,
    lastUpdated: new Date()
  };
};
```

## State Management

```typescript
// store/mitraStore.ts
interface MitraState {
  profile: MitraProfile | null;
  courses: Course[];
  workshops: Workshop[];
  participants: Participant[];
  certificates: Certificate[];
  tefaLocations: TefaLocation[];
  accreditation: AccreditationStatus;
}

export const useMitraStore = create<MitraState>((set, get) => ({
  profile: null,
  courses: [],
  workshops: [],
  participants: [],
  certificates: [],
  tefaLocations: [],
  accreditation: null,

  // Actions
  setProfile: (profile) => set({ profile }),
  addCourse: (course) => set(state => ({ courses: [...state.courses, course] })),
  updateCourse: (courseId, updates) => set(state => ({
    courses: state.courses.map(c => c.id === courseId ? { ...c, ...updates } : c)
  })),
  addWorkshop: (workshop) => set(state => ({ workshops: [...state.workshops, workshop] })),
  addParticipant: (participant) => set(state => ({
    participants: [...state.participants, participant]
  })),
  issueCertificate: (certificate) => set(state => ({
    certificates: [...state.certificates, certificate]
  }))
}));
```

## API Endpoints

```typescript
// api/mitraApi.ts
export const mitraApi = {
  // Dashboard [20]
  getDashboard: (partnerId: string) => GET(`/api/v1/mitra/${partnerId}/dashboard`),

  // Course Management [27, 34, 43, 51]
  createCourse: (courseData: CourseData) => POST('/api/v1/mitra/courses', courseData),
  updateCourse: (courseId: string, updates: Partial<Course>) => 
    PATCH(`/api/v1/mitra/courses/${courseId}`, updates),
  uploadCourseMaterials: (courseId: string, materials: File[]) => 
    POST(`/api/v1/mitra/courses/${courseId}/materials`, { files: materials }),
  setCoursePricing: (courseId: string, pricing: PricingData) => 
    POST(`/api/v1/mitra/courses/${courseId}/pricing`, pricing),
  registerCourseWithSIPLatih: (courseId: string) => 
    POST(`/api/v1/mitra/courses/${courseId}/register-siplatih`),
  scheduleCourse: (courseId: string, schedule: CourseSchedule) => 
    POST(`/api/v1/mitra/courses/${courseId}/schedule`, schedule),

  // Workshop Management [28, 35, 44]
  createWorkshop: (workshopData: WorkshopData) => POST('/api/v1/mitra/workshops', workshopData),
  linkWorkshopToTefa: (workshopId: string, tefaLocationId: string) => 
    POST(`/api/v1/mitra/workshops/${workshopId}/tefa`, { tefaLocationId }),
  createWorkshopSchedule: (scheduleData: WorkshopScheduleData) => 
    POST('/api/v1/mitra/workshops/schedules', scheduleData),
  getWorkshopRegistrations: (workshopId: string) => 
    GET(`/api/v1/mitra/workshops/${workshopId}/registrations`),

  // Participant Management [29, 36, 45]
  getParticipants: (courseId: string) => GET(`/api/v1/mitra/courses/${courseId}/participants`),
  getParticipantProgress: (participantId: string, courseId: string) => 
    GET(`/api/v1/mitra/participants/${participantId}/courses/${courseId}/progress`),
  getLearningAnalytics: (participantId: string, courseId: string) => 
    GET(`/api/v1/mitra/participants/${participantId}/courses/${courseId}/analytics`),
  issueCertificate: (certificateData: CertificateData) => 
    POST('/api/v1/mitra/certificates/issue', certificateData),

  // TeFa Management
  getTefaLocations: (partnerId: string) => GET(`/api/v1/mitra/${partnerId}/tefa-locations`),
  createTefaLocation: (locationData: TefaLocationData) => 
    POST('/api/v1/mitra/tefa-locations', locationData),
  createGeofence: (geofenceData: GeofenceData) => 
    POST('/api/v1/mitra/geofences', geofenceData)
};
```

---

**Last Updated**: 2024-01-15  
**Version**: 1.0.0


