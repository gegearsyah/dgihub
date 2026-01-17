# Seed Data and Participants Fix - Summary

## Issues Fixed

### 1. SQL Error: Column "content_type" does not exist
**Problem:** The seed data was using incorrect column names for the `materi` table.

**Solution:** Updated all material inserts in `seed_comprehensive_data.sql` to use correct column names:
- Changed `content_type` → `material_type`
- Changed `content_url` → `file_url`
- Changed `'DOCUMENT'` → `'PDF'` (to match valid material_type values)

### 2. Talenta Cannot See Courses
**Problem:** Courses were PUBLISHED but not showing for Talenta users. The API was using `!inner` join which requires a matching `mitra_profiles` record.

**Solution:** 
- Changed the Talenta courses API from `mitra_profiles!inner` to `mitra_profiles!left` join
- This allows courses to show even if `mitra_profiles` data is incomplete
- Updated seed data to ensure `mitra_profiles` has `organization_name` set

### 3. Participants Page Shows Mock Data
**Problem:** The participants page was using hardcoded mock data instead of real API data.

**Solution:**
- Created new API endpoint: `/api/v1/mitra/courses/[id]/participants`
- Updated participants page to fetch real data from API
- Added loading states and empty states
- Updated styling to use the new blue color scheme

## Files Modified

### 1. `Application/supabase/seed_comprehensive_data.sql`
- Fixed all material inserts to use `material_type` and `file_url`
- Changed document types from `'DOCUMENT'` to `'PDF'`
- Ensured `mitra_profiles` has `organization_name` set

### 2. `Application/src/app/api/v1/talenta/courses/route.ts`
- Changed `mitra_profiles!inner` to `mitra_profiles!left` join
- This allows courses to show even without complete mitra_profiles data

### 3. `Application/src/app/api/v1/mitra/courses/[id]/participants/route.ts` (NEW)
- Created API endpoint to fetch course participants
- Returns enrollments with talenta profile and user information
- Includes progress and last accessed time

### 4. `Application/src/app/mitra/courses/[id]/participants/page.tsx`
- Removed mock data import
- Added API integration using `apiClient.getCourseParticipants()`
- Added loading and empty states
- Updated colors to use new blue scheme

## How to Use

### 1. Run the Fixed Seed Data
```sql
-- Run in Supabase SQL Editor
\i Application/supabase/seed_comprehensive_data.sql
```

This will:
- Create 9 PUBLISHED courses (visible to Talenta)
- Create materials for all courses with correct column names
- Create enrollments
- Ensure mitra_profiles have organization_name

### 2. Verify Courses Are Visible
1. Login as Talenta user
2. Go to `/talenta/courses`
3. Should see all PUBLISHED courses

### 3. Check Participants
1. Login as Mitra user
2. Go to a course
3. Click "Participants" button
4. Should see real enrollment data (not mock data)

## Testing

### Test Accounts
- **Talenta:** `talenta@demo.com` / `password123`
- **Mitra:** `mitra@demo.com` / `password123`

### Expected Results
1. **Seed data runs without errors** - All materials use correct column names
2. **Talenta sees courses** - All 9 PUBLISHED courses are visible
3. **Participants show real data** - Enrollment information from database
4. **No mock data** - All pages use real API data

## Database Schema Notes

### `materi` Table Columns
- `materi_id` - UUID primary key
- `kursus_id` - Foreign key to kursus
- `title` - Material title
- `material_type` - One of: 'VIDEO', 'PDF', 'DOCUMENT', 'IMAGE', 'AUDIO', 'LINK', 'QUIZ'
- `file_url` - URL to the material file
- `order_index` - Order in the course
- `status` - 'ACTIVE', 'ARCHIVED', or 'DRAFT'

### Course Visibility
- Talenta can only see courses with `status = 'PUBLISHED'`
- Courses must have a valid `mitra_id` that references `mitra_profiles`
- The API uses a left join so courses show even if mitra_profiles data is incomplete

## Next Steps

1. Run the fixed seed data script
2. Verify courses are visible to Talenta
3. Check participants page shows real data
4. Test enrollment flow end-to-end
