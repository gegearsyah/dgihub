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
      recommendedCourses: 'Kursus yang Direkomendasikan',
      browseCourses: 'Jelajahi Kursus',
      myCourses: 'Kursus Saya',
      learningTranscript: 'Transkrip Pembelajaran',
      certificates: 'Sertifikat',
      myApplications: 'Lamaran Saya',
      analyticsDashboard: 'Dashboard Analitik',
      manageCourses: 'Kelola Kursus',
      manageWorkshops: 'Kelola Workshop',
      issueCertificates: 'Terbitkan Sertifikat',
      searchTalent: 'Cari Talenta',
      jobPostings: 'Lowongan Kerja',
      manageSavedCandidates: 'Kelola Kandidat Tersimpan',
      savedSearches: 'Pencarian Tersimpan',
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
      recommendedCourses: 'Recommended Courses',
      browseCourses: 'Browse Courses',
      myCourses: 'My Courses',
      learningTranscript: 'Learning Transcript',
      certificates: 'Certificates',
      myApplications: 'My Applications',
      analyticsDashboard: 'Analytics Dashboard',
      manageCourses: 'Manage Courses',
      manageWorkshops: 'Manage Workshops',
      issueCertificates: 'Issue Certificates',
      searchTalent: 'Search Talent',
      jobPostings: 'Job Postings',
      manageSavedCandidates: 'Manage Saved Candidates',
      savedSearches: 'Saved Searches',
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

