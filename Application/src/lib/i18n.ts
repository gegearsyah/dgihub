/**
 * Internationalization (i18n) System
 * Provides translations for Indonesian (ID) and English (EN)
 */

type Language = 'id' | 'en';

export const translations = {
  id: {
    // Common
    common: {
      home: 'Beranda',
      profile: 'Profil',
      logout: 'Keluar',
      login: 'Masuk',
      register: 'Daftar',
      save: 'Simpan',
      cancel: 'Batal',
      delete: 'Hapus',
      edit: 'Edit',
      view: 'Lihat',
      search: 'Cari',
      filter: 'Filter',
      loading: 'Memuat...',
      noData: 'Tidak ada data',
      error: 'Terjadi kesalahan',
      success: 'Berhasil',
    },
    // Navigation
    nav: {
      home: 'Beranda',
      courses: 'Kursus',
      myCourses: 'Kursus Saya',
      wallet: 'Dompet',
      jobs: 'Lowongan',
      search: 'Cari',
      talentPool: 'Kumpulan Talenta',
      analytics: 'Analitik',
      workshops: 'Workshop',
      profile: 'Profil',
    },
    // Dashboard
    dashboard: {
      title: 'Dashboard',
      welcome: 'Selamat Datang',
      welcomeSubtitle: 'Kelola pembelajaran dan kredensial Anda di satu tempat',
      quickActions: 'Aksi Cepat',
      quickActionsDesc: 'Akses cepat ke fitur utama platform',
      recommendedCourses: 'Kursus yang Direkomendasikan',
      recommendedCoursesDesc: 'Saran kursus yang dipersonalisasi untuk Anda',
      browseCourses: 'Jelajahi Kursus',
      browseCoursesDesc: 'Jelajahi program pelatihan yang tersedia',
      myCourses: 'Kursus Saya',
      myCoursesDesc: 'Lihat kursus yang sedang Anda ikuti',
      learningTranscript: 'Transkrip Pembelajaran',
      learningTranscriptDesc: 'Riwayat pembelajaran lengkap Anda',
      certificates: 'Sertifikat',
      certificatesDesc: 'Lihat kredensial terverifikasi Anda',
      myApplications: 'Lamaran Saya',
      myApplicationsDesc: 'Lacak status lamaran pekerjaan',
      analyticsDashboard: 'Dashboard Analitik',
      analyticsDashboardDesc: 'Lihat statistik dan metrik',
      manageCourses: 'Kelola Kursus',
      manageCoursesDesc: 'Buat dan kelola program pelatihan',
      manageWorkshops: 'Kelola Workshop',
      manageWorkshopsDesc: 'Kelola sesi workshop',
      issueCertificates: 'Terbitkan Sertifikat',
      issueCertificatesDesc: 'Terbitkan kredensial untuk pembelajar',
      searchTalent: 'Cari Talenta',
      searchTalentDesc: 'Temukan kandidat yang memenuhi syarat',
      jobPostings: 'Lowongan Kerja',
      jobPostingsDesc: 'Kelola lowongan pekerjaan',
      manageSavedCandidates: 'Kumpulan Talenta',
      manageSavedCandidatesDesc: 'Kelola kandidat yang disimpan',
      savedSearches: 'Pencarian Tersimpan',
      savedSearchesDesc: 'Akses cepat ke filter pencarian',
    },
    // Courses
    courses: {
      title: 'Kursus',
      browse: 'Jelajahi Kursus',
      myCourses: 'Kursus Saya',
      enroll: 'Daftar',
      enrolled: 'Terdaftar',
      continueLearning: 'Lanjutkan Belajar',
      viewDetails: 'Lihat Detail',
      duration: 'Durasi',
      price: 'Harga',
      provider: 'Penyelenggara',
      noCourses: 'Tidak ada kursus',
      searchPlaceholder: 'Cari kursus...',
    },
    // Certificates
    certificates: {
      title: 'Sertifikat',
      myCertificates: 'Sertifikat Saya',
      wallet: 'Dompet Kredensial',
      issued: 'Diterbitkan',
      expires: 'Berlaku Hingga',
      status: 'Status',
      viewDetails: 'Lihat Detail',
      share: 'Bagikan',
      noCertificates: 'Belum ada sertifikat',
    },
    // Jobs
    jobs: {
      title: 'Lowongan Kerja',
      search: 'Cari Lowongan',
      create: 'Buat Lowongan',
      location: 'Lokasi',
      salary: 'Gaji',
      applicants: 'Pelamar',
      pending: 'Menunggu',
      accepted: 'Diterima',
      viewApplicants: 'Lihat Pelamar',
      noJobs: 'Tidak ada lowongan',
    },
    // Applications
    applications: {
      title: 'Lamaran Saya',
      trackApplications: 'Lacak Status Lamaran',
      applied: 'Dilamar',
      status: 'Status',
      noApplications: 'Belum ada lamaran',
      browseJobs: 'Jelajahi Lowongan',
    },
    // Profile
    profile: {
      title: 'Profil',
      personalInfo: 'Informasi Pribadi',
      skills: 'Keterampilan',
      settings: 'Pengaturan',
      fullName: 'Nama Lengkap',
      email: 'Email',
      phone: 'Telepon',
      city: 'Kota',
      province: 'Provinsi',
      bio: 'Bio',
    },
  },
  en: {
    // Common
    common: {
      home: 'Home',
      profile: 'Profile',
      logout: 'Logout',
      login: 'Login',
      register: 'Register',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      search: 'Search',
      filter: 'Filter',
      loading: 'Loading...',
      noData: 'No data available',
      error: 'An error occurred',
      success: 'Success',
    },
    // Navigation
    nav: {
      home: 'Home',
      courses: 'Courses',
      myCourses: 'My Courses',
      wallet: 'Wallet',
      jobs: 'Jobs',
      search: 'Search',
      talentPool: 'Talent Pool',
      analytics: 'Analytics',
      workshops: 'Workshops',
      profile: 'Profile',
    },
    // Dashboard
    dashboard: {
      title: 'Dashboard',
      welcome: 'Welcome',
      welcomeSubtitle: 'Manage your learning and credentials in one place',
      quickActions: 'Quick Actions',
      quickActionsDesc: 'Quick access to main platform features',
      recommendedCourses: 'Recommended Courses',
      recommendedCoursesDesc: 'Personalized course suggestions for you',
      browseCourses: 'Browse Courses',
      browseCoursesDesc: 'Explore available training programs',
      myCourses: 'My Courses',
      myCoursesDesc: 'View courses you are enrolled in',
      learningTranscript: 'Learning Transcript',
      learningTranscriptDesc: 'Complete learning history',
      certificates: 'Certificates',
      certificatesDesc: 'View your verified credentials',
      myApplications: 'My Applications',
      myApplicationsDesc: 'Track your job application status',
      analyticsDashboard: 'Analytics Dashboard',
      analyticsDashboardDesc: 'View statistics and metrics',
      manageCourses: 'Manage Courses',
      manageCoursesDesc: 'Create and manage training programs',
      manageWorkshops: 'Manage Workshops',
      manageWorkshopsDesc: 'Manage workshop sessions',
      issueCertificates: 'Issue Certificates',
      issueCertificatesDesc: 'Issue credentials to learners',
      searchTalent: 'Search Talent',
      searchTalentDesc: 'Find qualified candidates',
      jobPostings: 'Job Postings',
      jobPostingsDesc: 'Manage job openings',
      manageSavedCandidates: 'Talent Pool',
      manageSavedCandidatesDesc: 'Manage saved candidates',
      savedSearches: 'Saved Searches',
      savedSearchesDesc: 'Quick access to search filters',
    },
    // Courses
    courses: {
      title: 'Courses',
      browse: 'Browse Courses',
      myCourses: 'My Courses',
      enroll: 'Enroll',
      enrolled: 'Enrolled',
      continueLearning: 'Continue Learning',
      viewDetails: 'View Details',
      duration: 'Duration',
      price: 'Price',
      provider: 'Provider',
      noCourses: 'No courses available',
      searchPlaceholder: 'Search courses...',
    },
    // Certificates
    certificates: {
      title: 'Certificates',
      myCertificates: 'My Certificates',
      wallet: 'Credential Wallet',
      issued: 'Issued',
      expires: 'Expires',
      status: 'Status',
      viewDetails: 'View Details',
      share: 'Share',
      noCertificates: 'No certificates yet',
    },
    // Jobs
    jobs: {
      title: 'Job Postings',
      search: 'Job Search',
      create: 'Create Job Posting',
      location: 'Location',
      salary: 'Salary',
      applicants: 'Applicants',
      pending: 'Pending',
      accepted: 'Accepted',
      viewApplicants: 'View Applicants',
      noJobs: 'No jobs found',
    },
    // Applications
    applications: {
      title: 'My Applications',
      trackApplications: 'Track your job applications',
      applied: 'Applied',
      status: 'Status',
      noApplications: 'No applications yet',
      browseJobs: 'Browse Available Jobs',
    },
    // Profile
    profile: {
      title: 'Profile',
      personalInfo: 'Personal Information',
      skills: 'Skills',
      settings: 'Settings',
      fullName: 'Full Name',
      email: 'Email',
      phone: 'Phone',
      city: 'City',
      province: 'Province',
      bio: 'Bio',
    },
  },
} as const;

export type TranslationKey = keyof typeof translations.id;

/**
 * Get translation for current language
 */
export function getTranslation(language: Language, key: string): string {
  const keys = key.split('.');
  let value: any = translations[language];
  
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) {
      // Fallback to Indonesian if key not found
      value = translations.id;
      for (const k2 of keys) {
        value = value?.[k2];
      }
      break;
    }
  }
  
  return typeof value === 'string' ? value : key;
}

/**
 * Hook to use translations
 */
export function useTranslation(language: Language) {
  return (key: string): string => getTranslation(language, key);
}

