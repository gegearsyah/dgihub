# Database Table Structures Reference

This document lists all table structures used in the DGIHub platform to help with seed data and queries.

## Core Tables

### 1. `users`
- `user_id` (UUID, PRIMARY KEY) or `id` (UUID, PRIMARY KEY) - depends on migration
- `email` (TEXT, UNIQUE)
- `password_hash` (TEXT)
- `full_name` (TEXT)
- `user_type` (TEXT) - 'TALENTA', 'MITRA', 'INDUSTRI'
- `status` (TEXT)
- `email_verified` (BOOLEAN)
- `profile_complete` (BOOLEAN)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### 2. `talenta_profiles`
- `profile_id` (UUID, PRIMARY KEY)
- `user_id` (UUID, REFERENCES users)
- `nik` (TEXT)
- `phone` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### 3. `mitra_profiles`
- `profile_id` (UUID, PRIMARY KEY)
- `user_id` (UUID, REFERENCES users)
- `organization_name` (VARCHAR(255))
- `lpk_license_number` (VARCHAR(100)) - from migration 009
- `bnsp_accreditation_number` (VARCHAR(100)) - from migration 009
- `director_name` (VARCHAR(255)) - from migration 009
- `field_of_expertise` (TEXT) - from migration 009
- `facilities` (TEXT) - from migration 009
- `training_programs` (TEXT) - from migration 009
- `bank_account_name` (VARCHAR(255)) - from migration 009
- `bank_account_number` (VARCHAR(50)) - from migration 009
- `bank_name` (VARCHAR(100)) - from migration 009
- `verification_status` (VARCHAR(50)) - from migration 009
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### 4. `industri_profiles`
- `profile_id` (UUID, PRIMARY KEY)
- `user_id` (UUID, REFERENCES users)
- `company_name` (VARCHAR(255))
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## Learning Tables

### 5. `kursus` (Courses)
- `kursus_id` (UUID, PRIMARY KEY)
- `mitra_id` (UUID, REFERENCES mitra_profiles(profile_id))
- `title` (VARCHAR(255))
- `description` (TEXT)
- `category` (VARCHAR(100))
- `skkni_code` (VARCHAR(100))
- `skkni_name` (VARCHAR(255))
- `aqrf_level` (INTEGER, 1-8)
- `duration_hours` (INTEGER)
- `duration_days` (INTEGER)
- `price` (DECIMAL(15, 2))
- `delivery_mode` (VARCHAR(20)) - 'ONLINE', 'OFFLINE', 'HYBRID' - from migration 010
- `status` (VARCHAR(50)) - 'DRAFT', 'PUBLISHED', 'ARCHIVED', 'SUSPENDED'
- `published_at` (TIMESTAMP)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### 6. `materi` (Materials)
- `materi_id` (UUID, PRIMARY KEY)
- `kursus_id` (UUID, REFERENCES kursus(kursus_id))
- `title` (VARCHAR(255))
- `description` (TEXT)
- `material_type` (VARCHAR(50)) - 'VIDEO', 'PDF', 'DOCUMENT', 'IMAGE', 'AUDIO', 'LINK', 'QUIZ'
- `file_url` (VARCHAR(500))
- `file_size` (BIGINT)
- `file_type` (VARCHAR(100))
- `thumbnail_url` (VARCHAR(500))
- `module_number` (INTEGER)
- `lesson_number` (INTEGER)
- `order_index` (INTEGER)
- `duration_seconds` (INTEGER)
- `is_preview` (BOOLEAN)
- `requires_completion` (BOOLEAN)
- `status` (VARCHAR(50)) - 'ACTIVE', 'ARCHIVED', 'DRAFT'
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### 7. `enrollments`
- `enrollment_id` (UUID, PRIMARY KEY) or `id` (UUID, PRIMARY KEY)
- `talenta_id` (UUID, REFERENCES talenta_profiles(profile_id))
- `kursus_id` (UUID, REFERENCES kursus(kursus_id))
- `status` (VARCHAR(50)) - 'ENROLLED', 'COMPLETED', 'DROPPED'
- `enrolled_at` (TIMESTAMP)
- `progress` (DECIMAL(5, 2))
- `certificate_issued` (BOOLEAN)
- `created_at` (TIMESTAMP)

### 8. `material_completions`
- `materi_id` (UUID, REFERENCES materi(materi_id))
- `talenta_id` (UUID, REFERENCES talenta_profiles(profile_id))
- `completed_at` (TIMESTAMP)
- `progress_percentage` (DECIMAL(5, 2)) - from migration 011
- `last_position` (INTEGER) - from migration 011
- `time_spent_seconds` (INTEGER) - from migration 011
- `updated_at` (TIMESTAMP) - from migration 011
- PRIMARY KEY (materi_id, talenta_id)

### 9. `quiz_submissions`
- `submission_id` (UUID, PRIMARY KEY)
- `materi_id` (UUID, REFERENCES materi(materi_id))
- `talenta_id` (UUID, REFERENCES talenta_profiles(profile_id))
- `answers` (JSONB)
- `score` (INTEGER)
- `passed` (BOOLEAN)
- `submitted_at` (TIMESTAMP)

## Workshop Tables

### 10. `workshops`
- `workshop_id` (UUID, PRIMARY KEY)
- `mitra_id` (UUID, REFERENCES mitra_profiles(profile_id))
- `title` (VARCHAR(255))
- `description` (TEXT)
- `start_date` (DATE)
- `end_date` (DATE)
- `start_time` (TIME)
- `end_time` (TIME)
- `location_name` (VARCHAR(255)) - NOT `location`
- `address` (TEXT)
- `city` (VARCHAR(100))
- `province` (VARCHAR(100))
- `latitude` (DECIMAL(10, 8))
- `longitude` (DECIMAL(11, 8))
- `capacity` (INTEGER) - NOT `max_participants`
- `price` (DECIMAL(15, 2)) - from migration 008
- `status` (VARCHAR(50)) - 'DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED'
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### 11. `workshop_registrations`
- `registration_id` (UUID, PRIMARY KEY)
- `workshop_id` (UUID, REFERENCES workshops(workshop_id))
- `talenta_id` (UUID, REFERENCES talenta_profiles(profile_id))
- `registered_at` (TIMESTAMP)
- `status` (VARCHAR(50)) - 'PENDING', 'CONFIRMED', 'CANCELLED', 'ATTENDED'
- `created_at` (TIMESTAMP)
- UNIQUE(workshop_id, talenta_id)

### 12. `workshop_attendance`
- `attendance_id` (UUID, PRIMARY KEY)
- `workshop_id` (UUID, REFERENCES workshops(workshop_id))
- `talenta_id` (UUID, REFERENCES talenta_profiles(profile_id))
- `latitude` (DECIMAL(10, 8))
- `longitude` (DECIMAL(11, 8))
- `recorded_at` (TIMESTAMP)
- `status` (VARCHAR(50)) - 'PRESENT', 'ABSENT', 'LATE'
- `created_at` (TIMESTAMP)
- UNIQUE(workshop_id, talenta_id)

## Job Tables

### 13. `job_postings` (NOT `lowongan`)
- `id` (UUID, PRIMARY KEY) - NOT `lowongan_id`
- `industri_id` (UUID, REFERENCES industri_profiles(profile_id))
- `title` (TEXT)
- `description` (TEXT)
- `location` (TEXT)
- `city` (TEXT)
- `province` (TEXT)
- `salary_min` (INTEGER)
- `salary_max` (INTEGER)
- `status` (TEXT) - 'DRAFT', 'PUBLISHED', 'CLOSED'
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)
- **Note:** No `visible_to_talenta` or `published_at` columns

### 14. `job_applications`
- `id` (UUID, PRIMARY KEY)
- `job_id` (UUID, REFERENCES job_postings(id))
- `talenta_id` (UUID, REFERENCES talenta_profiles(profile_id))
- `status` (TEXT) - 'PENDING', 'ACCEPTED', 'REJECTED'
- `applied_at` (TIMESTAMPTZ)
- `reviewed_at` (TIMESTAMPTZ)
- UNIQUE(job_id, talenta_id)

## Common Mistakes to Avoid

1. **Workshops table:**
   - Use `location_name` NOT `location`
   - Use `capacity` NOT `max_participants`

2. **Job postings table:**
   - Table name is `job_postings` NOT `lowongan`
   - Primary key is `id` NOT `lowongan_id`
   - No `visible_to_talenta` or `published_at` columns

3. **Materials table:**
   - Use `material_type` NOT `content_type`
   - Use `file_url` NOT `content_url`

4. **Courses:**
   - Table name is `kursus` NOT `courses`
   - Primary key is `kursus_id` NOT `id`

5. **Enrollments:**
   - Use `kursus_id` NOT `course_id` (if using kursus table)
   - Status values: 'ENROLLED', 'COMPLETED', 'DROPPED' (NOT 'ACTIVE')

## Foreign Key Relationships

- `kursus.mitra_id` → `mitra_profiles.profile_id`
- `enrollments.talenta_id` → `talenta_profiles.profile_id`
- `enrollments.kursus_id` → `kursus.kursus_id`
- `materi.kursus_id` → `kursus.kursus_id`
- `workshops.mitra_id` → `mitra_profiles.profile_id`
- `job_postings.industri_id` → `industri_profiles.profile_id`
- `job_applications.job_id` → `job_postings.id`
- `job_applications.talenta_id` → `talenta_profiles.profile_id`
