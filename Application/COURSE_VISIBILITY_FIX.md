# Course Visibility Fix - Summary

## Problem
When opening a Mitra account, courses were visible, but when opening a Talenta account, no courses were shown.

## Root Cause
The Talenta courses API (`/api/v1/talenta/courses`) filters courses by `status = 'PUBLISHED'`. However:
- Courses were being created with `status = 'DRAFT'` by default
- Seed data may not have set all courses to `PUBLISHED`
- Existing courses in the database may have been in `DRAFT` status

## Solution Implemented

### 1. Course Visibility Rules Documentation
Created `COURSE_VISIBILITY_RULES.md` explaining:
- Talenta can only see `PUBLISHED` courses
- Mitra can see all their courses (DRAFT, PUBLISHED, ARCHIVED, SUSPENDED)
- How to publish courses

### 2. Publish/Unpublish Button
Added a quick publish/unpublish button to each course card in the Mitra courses page:
- **Publish button** (Send icon) - Changes status from DRAFT to PUBLISHED
- **Unpublish button** (EyeOff icon) - Changes status from PUBLISHED to DRAFT
- Located next to Edit and Delete buttons on each course card

### 3. Comprehensive Seed Data
Created `seed_comprehensive_data.sql` with:
- **9 PUBLISHED courses** (all visible to Talenta)
- **Materials** for all courses (videos, documents, quizzes)
- **Enrollments** for Talenta users
- **Workshops** with registrations
- **Job postings** for Industri users
- All courses have proper `delivery_mode`, `price`, `category`, etc.

### 4. Bulk Update Script
Created `update_courses_to_published.sql` to:
- Update all existing DRAFT courses to PUBLISHED
- Set `published_at` timestamp
- Provide summary of course statuses

## Files Modified

1. **`Application/src/app/mitra/courses/page.tsx`**
   - Added `handleTogglePublish` function
   - Added Publish/Unpublish button to course cards
   - Imported `Send` and `EyeOff` icons

2. **`Application/supabase/seed_comprehensive_data.sql`** (NEW)
   - Comprehensive seed data with 9 PUBLISHED courses
   - Materials, enrollments, workshops, job postings
   - All courses are PUBLISHED by default

3. **`Application/supabase/update_courses_to_published.sql`** (NEW)
   - SQL script to bulk update DRAFT courses to PUBLISHED

4. **`Application/COURSE_VISIBILITY_RULES.md`** (NEW)
   - Documentation explaining visibility rules
   - Troubleshooting guide
   - Best practices

## How to Use

### For New Deployments
Run the comprehensive seed data:
```sql
-- Run in Supabase SQL Editor
\i Application/supabase/seed_comprehensive_data.sql
```

### For Existing Deployments
If you have existing DRAFT courses:
```sql
-- Run in Supabase SQL Editor
\i Application/supabase/update_courses_to_published.sql
```

### For Mitra Users
1. Go to `/mitra/courses`
2. Find the course you want to publish
3. Click the **Publish** button (Send icon) on the course card
4. The course will immediately become visible to Talenta users

## Testing

### Test Accounts
- **Talenta:** `talenta@demo.com` / `password123`
- **Mitra:** `mitra@demo.com` / `password123`
- **Industri:** `industri@demo.com` / `password123`

### Expected Behavior
1. **Mitra account:** Should see all courses (DRAFT, PUBLISHED, etc.)
2. **Talenta account:** Should see only PUBLISHED courses
3. **Publish button:** Should change course status and make it visible to Talenta
4. **Unpublish button:** Should hide course from Talenta

## Verification

After running the seed data or update script, verify:
```sql
-- Check course statuses
SELECT status, COUNT(*) 
FROM public.kursus 
GROUP BY status;

-- Should show PUBLISHED courses
SELECT COUNT(*) 
FROM public.kursus 
WHERE status = 'PUBLISHED';
```

## Next Steps

1. Run the seed data script in your Supabase database
2. Test with Talenta account - should see 9 courses
3. Test publish/unpublish functionality with Mitra account
4. Verify courses appear/disappear for Talenta based on status
