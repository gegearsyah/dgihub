# Course Visibility Rules

## Overview
This document explains how course visibility works in the DGIHub platform and how to ensure courses are visible to Talenta users.

## Visibility Rules

### For Talenta Users
- **Talenta can ONLY see courses with `status = 'PUBLISHED'`**
- Courses with status `DRAFT`, `ARCHIVED`, or `SUSPENDED` are **NOT visible** to Talenta
- This ensures that only completed and approved courses are shown to learners

### For Mitra Users
- **Mitra can see ALL their courses** regardless of status
- This allows Mitra to manage their courses (create, edit, publish, archive) before making them public
- Mitra can see:
  - `DRAFT` - Courses being prepared
  - `PUBLISHED` - Courses visible to Talenta
  - `ARCHIVED` - Old courses no longer active
  - `SUSPENDED` - Temporarily disabled courses

## How to Make Courses Visible to Talenta

### Option 1: Create Course as PUBLISHED
When creating a course in the Mitra dashboard:
1. Fill in all course details
2. Set **Status** to `PUBLISHED` in the form
3. Save the course

### Option 2: Publish Existing Course
If you have a DRAFT course:
1. Go to `/mitra/courses`
2. Find the course card
3. Click the **Publish** button (Send icon) on the course card
4. The course status will change to `PUBLISHED` and become visible to Talenta

### Option 3: Edit Course Status
1. Go to `/mitra/courses`
2. Click **Edit** on the course card
3. Change **Status** to `PUBLISHED` in the form
4. Save the changes

### Option 4: Bulk Update via SQL (For Administrators)
Run the SQL script to update all DRAFT courses to PUBLISHED:
```sql
-- Run: Application/supabase/update_courses_to_published.sql
```

## Seed Data
The comprehensive seed data script (`seed_comprehensive_data.sql`) creates all courses with `status = 'PUBLISHED'` by default, ensuring they are immediately visible to Talenta users.

## API Endpoints

### Get Courses (Talenta)
- **Endpoint:** `GET /api/v1/talenta/courses`
- **Filter:** Automatically filters by `status = 'PUBLISHED'`
- **Returns:** Only published courses

### Get Courses (Mitra)
- **Endpoint:** `GET /api/v1/mitra/courses`
- **Filter:** No status filter - returns all courses for the Mitra
- **Returns:** All courses owned by the Mitra

### Update Course Status
- **Endpoint:** `PUT /api/v1/mitra/courses/[id]`
- **Body:** `{ "status": "PUBLISHED" }`
- **Requires:** Mitra authentication

## Troubleshooting

### Issue: Talenta cannot see courses
**Solution:**
1. Check course status in Mitra dashboard
2. If status is `DRAFT`, publish the course
3. Verify the course has `published_at` timestamp set
4. Check that the course belongs to a verified Mitra

### Issue: Course shows in Mitra but not in Talenta
**Solution:**
- This is expected behavior if the course status is not `PUBLISHED`
- Publish the course using one of the methods above

### Issue: Need to hide a course from Talenta
**Solution:**
1. Edit the course
2. Change status to `DRAFT`, `ARCHIVED`, or `SUSPENDED`
3. Or use the Unpublish button on the course card

## Best Practices

1. **Create as DRAFT first:** Start with DRAFT status while preparing course content
2. **Add materials:** Ensure course has at least one material before publishing
3. **Review before publishing:** Check all course details are correct
4. **Publish when ready:** Only publish when course is complete and ready for learners
5. **Archive old courses:** Use ARCHIVED status for courses no longer offered
