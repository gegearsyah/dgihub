/**
 * Mock Data for UI Development
 * Replace with real API calls when backend is ready
 */

export const mockCourses = [
  {
    kursus_id: '1',
    title: 'Advanced Software Development',
    description: 'Learn modern software development practices including microservices, cloud architecture, and DevOps.',
    duration_hours: 120,
    price: 2500000,
    skkni_code: 'IT-2023-001',
    aqrf_level: 6,
    provider_name: 'LPK Teknologi Indonesia',
    is_enrolled: false,
    materials: [
      { id: '1', type: 'video', title: 'Introduction to Microservices', duration: '15:30', completed: false },
      { id: '2', type: 'video', title: 'Docker and Containerization', duration: '20:15', completed: false },
      { id: '3', type: 'document', title: 'Architecture Patterns PDF', duration: '30 min read', completed: false },
      { id: '4', type: 'quiz', title: 'Module 1 Assessment', duration: '20 questions', completed: false }
    ]
  },
  {
    kursus_id: '2',
    title: 'Cloud Architecture Fundamentals',
    description: 'Master cloud computing concepts and AWS services.',
    duration_hours: 80,
    price: 1800000,
    skkni_code: 'IT-2023-002',
    aqrf_level: 5,
    provider_name: 'LPK Cloud Solutions',
    is_enrolled: true,
    progress: 45,
    materials: [
      { id: '1', type: 'video', title: 'Cloud Computing Basics', duration: '12:00', completed: true },
      { id: '2', type: 'video', title: 'AWS Services Overview', duration: '18:30', completed: true },
      { id: '3', type: 'document', title: 'AWS Best Practices', duration: '25 min read', completed: true },
      { id: '4', type: 'quiz', title: 'Module 1 Assessment', duration: '20 questions', completed: true },
      { id: '5', type: 'video', title: 'EC2 and S3 Deep Dive', duration: '22:00', completed: false }
    ]
  }
];

export const mockWorkshops = [
  {
    workshop_id: '1',
    title: 'Hands-on React Workshop',
    description: 'Practical React development workshop',
    start_date: '2024-02-15',
    end_date: '2024-02-15',
    start_time: '09:00',
    end_time: '17:00',
    location_name: 'LPK Training Center',
    city: 'Jakarta',
    province: 'DKI Jakarta',
    latitude: -6.2088,
    longitude: 106.8456,
    capacity: 30,
    price: 500000,
    registered_count: 15,
    status: 'OPEN'
  }
];

export const mockCertificates = [
  {
    sertifikat_id: '1',
    certificate_number: 'CERT-2024-001234',
    title: 'Advanced Software Development',
    issued_date: '2024-01-15',
    expiration_date: '2029-01-15',
    skkni_code: 'IT-2023-001',
    aqrf_level: 6,
    issuer_name: 'LPK Teknologi Indonesia',
    status: 'ACTIVE',
    credential_id: 'https://dgihub.go.id/credentials/badges/12345'
  }
];

export const mockJobPostings = [
  {
    lowongan_id: '1',
    title: 'Senior Software Engineer',
    company: 'PT Teknologi Maju',
    location: 'Jakarta',
    salary_min: 15000000,
    salary_max: 25000000,
    requirements: {
      certificates: ['IT-2023-001'],
      skills: ['JavaScript', 'React', 'Node.js'],
      minExperience: 3
    },
    applicants_count: 12,
    status: 'PUBLISHED'
  }
];

export const mockTalents = [
  {
    talenta_id: '1',
    full_name: 'John Doe',
    email: 'john@example.com',
    city: 'Jakarta',
    province: 'DKI Jakarta',
    skills: { name: ['JavaScript', 'React', 'Node.js'] },
    certificate_count: 5,
    skkni_codes: ['IT-2023-001', 'IT-2023-002'],
    max_aqrf_level: 6,
    match_score: 3
  }
];

export const mockParticipants = [
  {
    enrollment_id: '1',
    full_name: 'Jane Smith',
    email: 'jane@example.com',
    enrolled_at: '2024-01-10',
    progress: 75,
    status: 'ACTIVE',
    last_accessed_at: '2024-01-20'
  },
  {
    enrollment_id: '2',
    full_name: 'Bob Johnson',
    email: 'bob@example.com',
    enrolled_at: '2024-01-12',
    progress: 45,
    status: 'ACTIVE',
    last_accessed_at: '2024-01-19'
  }
];

export const mockNotifications = [
  {
    id: '1',
    type: 'course_enrolled',
    title: 'Course Enrollment Confirmed',
    message: 'You have been enrolled in Advanced Software Development',
    read: false,
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    type: 'certificate_issued',
    title: 'Certificate Issued',
    message: 'Your certificate for Cloud Architecture has been issued',
    read: false,
    created_at: '2024-01-14T14:30:00Z'
  },
  {
    id: '3',
    type: 'job_application',
    title: 'New Application Received',
    message: 'John Doe applied for Senior Software Engineer position',
    read: true,
    created_at: '2024-01-13T09:15:00Z'
  }
];

export const mockPaymentMethods = [
  { id: 'gopay', name: 'GoPay', icon: '💳' },
  { id: 'linkaja', name: 'LinkAja', icon: '💳' },
  { id: 'ovo', name: 'OVO', icon: '💳' },
  { id: 'bank_transfer', name: 'Bank Transfer', icon: '🏦' }
];

export const mockPortfolioArtifacts = [
  {
    id: '1',
    name: 'Project Portfolio',
    verified: true,
    type: 'project'
  },
  {
    id: '2',
    name: 'Code Samples',
    verified: false,
    type: 'code'
  },
  {
    id: '3',
    name: 'Design Work',
    verified: true,
    type: 'design'
  }
];


