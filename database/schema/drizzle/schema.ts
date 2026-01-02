/**
 * Drizzle ORM Schema
 * Based on PostgreSQL DDL
 */

import { pgTable, uuid, varchar, text, timestamp, boolean, integer, decimal, jsonb, check, index, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================================================
// Users and Profiles
// ============================================================================

export const users = pgTable('users', {
  userId: uuid('user_id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  userType: varchar('user_type', { length: 20 }).notNull().$type<'TALENTA' | 'MITRA' | 'INDUSTRI'>(),
  status: varchar('status', { length: 20 }).default('PENDING_VERIFICATION').$type<'PENDING_VERIFICATION' | 'VERIFIED' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED'>(),
  emailVerified: boolean('email_verified').default(false),
  emailVerifiedAt: timestamp('email_verified_at'),
  verificationCode: varchar('verification_code', { length: 10 }),
  verificationCodeExpiresAt: timestamp('verification_code_expires_at'),
  profileComplete: boolean('profile_complete').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  lastLoginAt: timestamp('last_login_at'),
  metadata: jsonb('metadata')
}, (table) => ({
  emailIdx: index('idx_users_email').on(table.email),
  userTypeIdx: index('idx_users_user_type').on(table.userType),
  statusIdx: index('idx_users_status').on(table.status)
}));

export const talentaProfiles = pgTable('talenta_profiles', {
  profileId: uuid('profile_id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique().references(() => users.userId, { onDelete: 'cascade' }),
  nik: varchar('nik', { length: 50 }).unique(),
  nikVerified: boolean('nik_verified').default(false),
  nikVerifiedAt: timestamp('nik_verified_at'),
  dateOfBirth: timestamp('date_of_birth'),
  phone: varchar('phone', { length: 20 }),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  province: varchar('province', { length: 100 }),
  postalCode: varchar('postal_code', { length: 10 }),
  ekycVerified: boolean('ekyc_verified').default(false),
  ekycVerifiedAt: timestamp('ekyc_verified_at'),
  biometricType: varchar('biometric_type', { length: 50 }).$type<'FINGERPRINT' | 'FACE' | 'IRIS'>(),
  biometricHash: varchar('biometric_hash', { length: 64 }),
  skills: jsonb('skills'),
  aqrfLevel: integer('aqrf_level'),
  resumeUrl: varchar('resume_url', { length: 500 }),
  portfolioUrl: varchar('portfolio_url', { length: 500 }),
  jobPreferences: jsonb('job_preferences'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  userIdIdx: index('idx_talenta_profiles_user_id').on(table.userId),
  nikIdx: index('idx_talenta_profiles_nik').on(table.nik),
  skillsIdx: index('idx_talenta_profiles_skills').using('gin', table.skills)
}));

export const mitraProfiles = pgTable('mitra_profiles', {
  profileId: uuid('profile_id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique().references(() => users.userId, { onDelete: 'cascade' }),
  organizationName: varchar('organization_name', { length: 255 }).notNull(),
  registrationNumber: varchar('registration_number', { length: 100 }).notNull().unique(),
  taxId: varchar('tax_id', { length: 50 }),
  accreditationStatus: varchar('accreditation_status', { length: 50 }).default('PENDING').$type<'PENDING' | 'ACCREDITED' | 'EXPIRED' | 'REVOKED'>(),
  accreditationExpiresAt: timestamp('accreditation_expires_at'),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  province: varchar('province', { length: 100 }),
  postalCode: varchar('postal_code', { length: 10 }),
  phone: varchar('phone', { length: 20 }),
  website: varchar('website', { length: 255 }),
  contactPersonName: varchar('contact_person_name', { length: 255 }),
  contactPersonEmail: varchar('contact_person_email', { length: 255 }),
  contactPersonPhone: varchar('contact_person_phone', { length: 20 }),
  contactPersonPosition: varchar('contact_person_position', { length: 100 }),
  registrationCertificateUrl: varchar('registration_certificate_url', { length: 500 }),
  taxCertificateUrl: varchar('tax_certificate_url', { length: 500 }),
  accreditationLetterUrl: varchar('accreditation_letter_url', { length: 500 }),
  verificationStatus: varchar('verification_status', { length: 50 }).default('PENDING_REVIEW').$type<'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED'>(),
  verifiedAt: timestamp('verified_at'),
  verifiedBy: uuid('verified_by'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  userIdIdx: index('idx_mitra_profiles_user_id').on(table.userId),
  registrationNumberIdx: index('idx_mitra_profiles_registration_number').on(table.registrationNumber),
  accreditationStatusIdx: index('idx_mitra_profiles_accreditation_status').on(table.accreditationStatus)
}));

export const industriProfiles = pgTable('industri_profiles', {
  profileId: uuid('profile_id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique().references(() => users.userId, { onDelete: 'cascade' }),
  companyName: varchar('company_name', { length: 255 }).notNull(),
  companyTaxId: varchar('company_tax_id', { length: 50 }).notNull().unique(),
  companyType: varchar('company_type', { length: 100 }),
  industrySector: varchar('industry_sector', { length: 100 }),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  province: varchar('province', { length: 100 }),
  postalCode: varchar('postal_code', { length: 10 }),
  phone: varchar('phone', { length: 20 }),
  website: varchar('website', { length: 255 }),
  contactPersonName: varchar('contact_person_name', { length: 255 }),
  contactPersonEmail: varchar('contact_person_email', { length: 255 }),
  contactPersonPhone: varchar('contact_person_phone', { length: 20 }),
  contactPersonPosition: varchar('contact_person_position', { length: 100 }),
  companyRegistrationUrl: varchar('company_registration_url', { length: 500 }),
  taxCertificateUrl: varchar('tax_certificate_url', { length: 500 }),
  businessLicenseUrl: varchar('business_license_url', { length: 500 }),
  verificationStatus: varchar('verification_status', { length: 50 }).default('PENDING_REVIEW').$type<'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED'>(),
  verifiedAt: timestamp('verified_at'),
  verifiedBy: uuid('verified_by'),
  taxIncentiveEligible: boolean('tax_incentive_eligible').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  userIdIdx: index('idx_industri_profiles_user_id').on(table.userId),
  companyTaxIdIdx: index('idx_industri_profiles_company_tax_id').on(table.companyTaxId),
  verificationStatusIdx: index('idx_industri_profiles_verification_status').on(table.verificationStatus)
}));

// ============================================================================
// Courses and Materials
// ============================================================================

export const kursus = pgTable('kursus', {
  kursusId: uuid('kursus_id').primaryKey().defaultRandom(),
  mitraId: uuid('mitra_id').notNull().references(() => mitraProfiles.profileId, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  titleEn: varchar('title_en', { length: 255 }),
  description: text('description'),
  descriptionEn: text('description_en'),
  category: varchar('category', { length: 100 }),
  skkniCode: varchar('skkni_code', { length: 100 }),
  skkniName: varchar('skkni_name', { length: 255 }),
  aqrfLevel: integer('aqrf_level'),
  durationHours: integer('duration_hours').notNull(),
  durationDays: integer('duration_days'),
  price: decimal('price', { precision: 15, scale: 2 }).default('0'),
  currency: varchar('currency', { length: 3 }).default('IDR'),
  prerequisites: jsonb('prerequisites'),
  learningOutcomes: jsonb('learning_outcomes'),
  status: varchar('status', { length: 50 }).default('DRAFT').$type<'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'SUSPENDED'>(),
  siplatihProgramId: varchar('siplatih_program_id', { length: 100 }),
  siplatihRegistered: boolean('siplatih_registered').default(false),
  siplatihRegisteredAt: timestamp('siplatih_registered_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  publishedAt: timestamp('published_at')
}, (table) => ({
  mitraIdIdx: index('idx_kursus_mitra_id').on(table.mitraId),
  statusIdx: index('idx_kursus_status').on(table.status),
  skkniCodeIdx: index('idx_kursus_skkni_code').on(table.skkniCode),
  aqrfLevelIdx: index('idx_kursus_aqrf_level').on(table.aqrfLevel)
}));

export const materi = pgTable('materi', {
  materiId: uuid('materi_id').primaryKey().defaultRandom(),
  kursusId: uuid('kursus_id').notNull().references(() => kursus.kursusId, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  materialType: varchar('material_type', { length: 50 }).notNull().$type<'VIDEO' | 'PDF' | 'DOCUMENT' | 'IMAGE' | 'AUDIO' | 'LINK' | 'QUIZ'>(),
  fileUrl: varchar('file_url', { length: 500 }),
  fileSize: integer('file_size'),
  fileType: varchar('file_type', { length: 100 }),
  thumbnailUrl: varchar('thumbnail_url', { length: 500 }),
  moduleNumber: integer('module_number'),
  lessonNumber: integer('lesson_number'),
  orderIndex: integer('order_index').default(0),
  durationSeconds: integer('duration_seconds'),
  isPreview: boolean('is_preview').default(false),
  requiresCompletion: boolean('requires_completion').default(true),
  status: varchar('status', { length: 50 }).default('ACTIVE').$type<'ACTIVE' | 'ARCHIVED' | 'DRAFT'>(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  kursusIdIdx: index('idx_materi_kursus_id').on(table.kursusId),
  orderIdx: index('idx_materi_order').on(table.kursusId, table.orderIndex)
}));

// ============================================================================
// Workshops
// ============================================================================

export const workshop = pgTable('workshop', {
  workshopId: uuid('workshop_id').primaryKey().defaultRandom(),
  mitraId: uuid('mitra_id').notNull().references(() => mitraProfiles.profileId, { onDelete: 'cascade' }),
  kursusId: uuid('kursus_id').references(() => kursus.kursusId, { onDelete: 'set null' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  tefaLocationId: uuid('tefa_location_id'),
  tefaLocationName: varchar('tefa_location_name', { length: 255 }),
  tefaAddress: text('tefa_address'),
  tefaCity: varchar('tefa_city', { length: 100 }),
  tefaProvince: varchar('tefa_province', { length: 100 }),
  latitude: decimal('latitude', { precision: 10, scale: 8 }),
  longitude: decimal('longitude', { precision: 11, scale: 8 }),
  geofenceRadius: decimal('geofence_radius', { precision: 10, scale: 2 }),
  geofenceId: uuid('geofence_id'),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  startTime: timestamp('start_time'),
  endTime: timestamp('end_time'),
  durationHours: integer('duration_hours'),
  capacity: integer('capacity').notNull(),
  enrolledCount: integer('enrolled_count').default(0),
  price: decimal('price', { precision: 15, scale: 2 }).default('0'),
  currency: varchar('currency', { length: 3 }).default('IDR'),
  instructorId: uuid('instructor_id'),
  instructorName: varchar('instructor_name', { length: 255 }),
  requiresGpsAttendance: boolean('requires_gps_attendance').default(true),
  attendanceVerificationMethod: varchar('attendance_verification_method', { length: 50 }).default('GPS').$type<'GPS' | 'QR_CODE' | 'NFC' | 'BIOMETRIC' | 'MANUAL'>(),
  status: varchar('status', { length: 50 }).default('DRAFT').$type<'DRAFT' | 'OPEN' | 'FULL' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'>(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  mitraIdIdx: index('idx_workshop_mitra_id').on(table.mitraId),
  kursusIdIdx: index('idx_workshop_kursus_id').on(table.kursusId),
  startDateIdx: index('idx_workshop_start_date').on(table.startDate),
  statusIdx: index('idx_workshop_status').on(table.status)
}));

// ============================================================================
// Certificates
// ============================================================================

export const sertifikat = pgTable('sertifikat', {
  sertifikatId: uuid('sertifikat_id').primaryKey().defaultRandom(),
  mitraId: uuid('mitra_id').notNull().references(() => mitraProfiles.profileId, { onDelete: 'restrict' }),
  talentaId: uuid('talenta_id').notNull().references(() => talentaProfiles.profileId, { onDelete: 'cascade' }),
  kursusId: uuid('kursus_id').references(() => kursus.kursusId, { onDelete: 'set null' }),
  workshopId: uuid('workshop_id').references(() => workshop.workshopId, { onDelete: 'set null' }),
  certificateNumber: varchar('certificate_number', { length: 100 }).notNull().unique(),
  credentialId: varchar('credential_id', { length: 500 }).unique(),
  credentialJson: jsonb('credential_json').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  issuedDate: timestamp('issued_date').notNull().defaultNow(),
  expirationDate: timestamp('expiration_date'),
  skkniCode: varchar('skkni_code', { length: 100 }),
  skkniName: varchar('skkni_name', { length: 255 }),
  aqrfLevel: integer('aqrf_level'),
  score: decimal('score', { precision: 5, scale: 2 }),
  grade: varchar('grade', { length: 10 }),
  level: varchar('level', { length: 50 }),
  status: varchar('status', { length: 50 }).default('ACTIVE').$type<'ACTIVE' | 'REVOKED' | 'EXPIRED' | 'SUSPENDED'>(),
  revokedAt: timestamp('revoked_at'),
  revocationReason: text('revocation_reason'),
  proofType: varchar('proof_type', { length: 100 }),
  proofVerificationMethod: varchar('proof_verification_method', { length: 500 }),
  proofJws: text('proof_jws'),
  proofCreated: timestamp('proof_created'),
  merkleRootHash: varchar('merkle_root_hash', { length: 64 }),
  blockchainTxHash: varchar('blockchain_tx_hash', { length: 66 }),
  blockchainNetwork: varchar('blockchain_network', { length: 50 }),
  anchoredAt: timestamp('anchored_at'),
  visibleToIndustry: boolean('visible_to_industry').default(true),
  searchable: boolean('searchable').default(true),
  trainingCostId: uuid('training_cost_id'),
  taxDeductionEligible: boolean('tax_deduction_eligible').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  mitraIdIdx: index('idx_sertifikat_mitra_id').on(table.mitraId),
  talentaIdIdx: index('idx_sertifikat_talenta_id').on(table.talentaId),
  kursusIdIdx: index('idx_sertifikat_kursus_id').on(table.kursusId),
  statusIdx: index('idx_sertifikat_status').on(table.status),
  skkniCodeIdx: index('idx_sertifikat_skkni_code').on(table.skkniCode),
  visibleIndustryIdx: index('idx_sertifikat_visible_industry').on(table.visibleToIndustry, table.searchable),
  credentialJsonIdx: index('idx_sertifikat_credential_json').using('gin', table.credentialJson)
}));

// ============================================================================
// Job Postings and Applications
// ============================================================================

export const lowongan = pgTable('lowongan', {
  lowonganId: uuid('lowongan_id').primaryKey().defaultRandom(),
  industriId: uuid('industri_id').notNull().references(() => industriProfiles.profileId, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  jobType: varchar('job_type', { length: 50 }).$type<'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE'>(),
  location: varchar('location', { length: 255 }),
  city: varchar('city', { length: 100 }),
  province: varchar('province', { length: 100 }),
  remoteAllowed: boolean('remote_allowed').default(false),
  salaryMin: decimal('salary_min', { precision: 15, scale: 2 }),
  salaryMax: decimal('salary_max', { precision: 15, scale: 2 }),
  salaryCurrency: varchar('salary_currency', { length: 3 }).default('IDR'),
  salaryPeriod: varchar('salary_period', { length: 20 }).$type<'MONTHLY' | 'YEARLY' | 'HOURLY'>(),
  requirements: jsonb('requirements').notNull(),
  positionsAvailable: integer('positions_available').default(1),
  positionsFilled: integer('positions_filled').default(0),
  applicationDeadline: timestamp('application_deadline'),
  applicationCount: integer('application_count').default(0),
  status: varchar('status', { length: 50 }).default('DRAFT').$type<'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'FILLED' | 'CANCELLED'>(),
  visibleToTalenta: boolean('visible_to_talenta').default(false),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  industriIdIdx: index('idx_lowongan_industri_id').on(table.industriId),
  statusIdx: index('idx_lowongan_status').on(table.status),
  visibleTalentaIdx: index('idx_lowongan_visible_talenta').on(table.visibleToTalenta, table.status),
  requirementsIdx: index('idx_lowongan_requirements').using('gin', table.requirements)
}));

export const pelamar = pgTable('pelamar', {
  pelamarId: uuid('pelamar_id').primaryKey().defaultRandom(),
  lowonganId: uuid('lowongan_id').notNull().references(() => lowongan.lowonganId, { onDelete: 'cascade' }),
  talentaId: uuid('talenta_id').notNull().references(() => talentaProfiles.profileId, { onDelete: 'cascade' }),
  appliedAt: timestamp('applied_at').notNull().defaultNow(),
  status: varchar('status', { length: 50 }).default('PENDING').$type<'PENDING' | 'REVIEWING' | 'SHORTLISTED' | 'INTERVIEW_SCHEDULED' | 'HIRED' | 'REJECTED'>(),
  coverLetter: text('cover_letter'),
  resumeUrl: varchar('resume_url', { length: 500 }),
  attachedCertificates: jsonb('attached_certificates').$type<string[]>(),
  reviewedAt: timestamp('reviewed_at'),
  reviewedBy: uuid('reviewed_by'),
  reviewNotes: text('review_notes'),
  interviewScheduled: boolean('interview_scheduled').default(false),
  interviewDate: timestamp('interview_date'),
  interviewLocation: varchar('interview_location', { length: 255 }),
  interviewType: varchar('interview_type', { length: 50 }).$type<'ONLINE' | 'ONSITE' | 'PHONE' | 'VIDEO'>(),
  hiringDecision: varchar('hiring_decision', { length: 50 }).$type<'ACCEPT' | 'REJECT' | 'PENDING'>(),
  hiringDecisionAt: timestamp('hiring_decision_at'),
  hiringDecisionBy: uuid('hiring_decision_by'),
  hiringDecisionNotes: text('hiring_decision_notes'),
  savedToTalentPool: boolean('saved_to_talent_pool').default(false),
  talentPoolReason: text('talent_pool_reason'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  lowonganIdIdx: index('idx_pelamar_lowongan_id').on(table.lowonganId),
  talentaIdIdx: index('idx_pelamar_talenta_id').on(table.talentaId),
  statusIdx: index('idx_pelamar_status').on(table.status),
  appliedAtIdx: index('idx_pelamar_applied_at').on(table.appliedAt),
  hiringDecisionIdx: index('idx_pelamar_hiring_decision').on(table.hiringDecision),
  uniqueApplication: unique().on(table.lowonganId, table.talentaId)
}));

export const talentPool = pgTable('talent_pool', {
  talentPoolId: uuid('talent_pool_id').primaryKey().defaultRandom(),
  industriId: uuid('industri_id').notNull().references(() => industriProfiles.profileId, { onDelete: 'cascade' }),
  talentaId: uuid('talenta_id').notNull().references(() => talentaProfiles.profileId, { onDelete: 'cascade' }),
  sourceType: varchar('source_type', { length: 50 }).$type<'REJECTED_APPLICATION' | 'SEARCH' | 'MANUAL'>(),
  sourceApplicationId: uuid('source_application_id').references(() => pelamar.pelamarId, { onDelete: 'set null' }),
  sourceJobId: uuid('source_job_id').references(() => lowongan.lowonganId, { onDelete: 'set null' }),
  reason: text('reason'),
  notes: text('notes'),
  tags: jsonb('tags').$type<string[]>(),
  status: varchar('status', { length: 50 }).default('ACTIVE').$type<'ACTIVE' | 'CONTACTED' | 'HIRED' | 'REMOVED'>(),
  lastContactedAt: timestamp('last_contacted_at'),
  contactCount: integer('contact_count').default(0),
  addedAt: timestamp('added_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  industriIdIdx: index('idx_talent_pool_industri_id').on(table.industriId),
  talentaIdIdx: index('idx_talent_pool_talenta_id').on(table.talentaId),
  statusIdx: index('idx_talent_pool_status').on(table.status),
  tagsIdx: index('idx_talent_pool_tags').using('gin', table.tags),
  uniqueTalentPool: unique().on(table.industriId, table.talentaId)
}));

// ============================================================================
// Relations
// ============================================================================

export const usersRelations = relations(users, ({ one }) => ({
  talentaProfile: one(talentaProfiles),
  mitraProfile: one(mitraProfiles),
  industriProfile: one(industriProfiles)
}));

export const kursusRelations = relations(kursus, ({ one, many }) => ({
  mitra: one(mitraProfiles, {
    fields: [kursus.mitraId],
    references: [mitraProfiles.profileId]
  }),
  materials: many(materi),
  certificates: many(sertifikat)
}));

export const sertifikatRelations = relations(sertifikat, ({ one }) => ({
  mitra: one(mitraProfiles, {
    fields: [sertifikat.mitraId],
    references: [mitraProfiles.profileId]
  }),
  talenta: one(talentaProfiles, {
    fields: [sertifikat.talentaId],
    references: [talentaProfiles.profileId]
  }),
  kursus: one(kursus, {
    fields: [sertifikat.kursusId],
    references: [kursus.kursusId]
  })
}));

export const lowonganRelations = relations(lowongan, ({ one, many }) => ({
  industri: one(industriProfiles, {
    fields: [lowongan.industriId],
    references: [industriProfiles.profileId]
  }),
  applications: many(pelamar)
}));

export const pelamarRelations = relations(pelamar, ({ one }) => ({
  lowongan: one(lowongan, {
    fields: [pelamar.lowonganId],
    references: [lowongan.lowonganId]
  }),
  talenta: one(talentaProfiles, {
    fields: [pelamar.talentaId],
    references: [talentaProfiles.profileId]
  })
}));


