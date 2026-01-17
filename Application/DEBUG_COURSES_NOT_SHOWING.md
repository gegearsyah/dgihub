# Debug: Courses Not Showing for Talenta

## Possible Issues

### 1. User Account Setup
- Check if `talenta1@demo.com` has a `talenta_profiles` record
- Check if the user's `user_id` matches the `talenta_profiles.user_id`
- Verify the user is logged in correctly

### 2. Course Status
- Courses must have `status = 'PUBLISHED'` to be visible to Talenta
- Check: `SELECT * FROM kursus WHERE status = 'PUBLISHED';`

### 3. Mitra Profiles
- Courses need a valid `mitra_id` that references `mitra_profiles(profile_id)`
- The `mitra_profiles` must have `organization_name` set
- Check: `SELECT k.*, mp.organization_name FROM kursus k LEFT JOIN mitra_profiles mp ON k.mitra_id = mp.profile_id WHERE k.status = 'PUBLISHED';`

### 4. API Query Issue
- The API uses a left join: `mitra_profiles!left`
- If `mitra_profiles` is missing, courses should still show but with "Unknown Provider"
- Check browser console for API errors

### 5. Recommended Courses
- Uses the same API as regular courses
- Filters out enrolled courses
- If no courses show, check the main courses page first

## Debugging Steps

### Step 1: Check Database
```sql
-- Check if courses exist and are PUBLISHED
SELECT kursus_id, title, status, mitra_id 
FROM kursus 
WHERE status = 'PUBLISHED';

-- Check if mitra_profiles exist
SELECT profile_id, organization_name, user_id 
FROM mitra_profiles;

-- Check if courses have valid mitra_id
SELECT k.kursus_id, k.title, k.status, k.mitra_id, mp.organization_name
FROM kursus k
LEFT JOIN mitra_profiles mp ON k.mitra_id = mp.profile_id
WHERE k.status = 'PUBLISHED';
```

### Step 2: Check User Account
```sql
-- Check if talenta1@demo.com exists
SELECT user_id, email, user_type, status 
FROM users 
WHERE email = 'talenta1@demo.com';

-- Check if talenta profile exists
SELECT tp.profile_id, tp.user_id, u.email
FROM talenta_profiles tp
JOIN users u ON tp.user_id = u.user_id
WHERE u.email = 'talenta1@demo.com';
```

### Step 3: Check API Response
1. Open browser DevTools (F12)
2. Go to Network tab
3. Navigate to `/talenta/courses`
4. Check the API request to `/api/v1/talenta/courses`
5. Look at the response - should have `success: true` and `data.courses` array

### Step 4: Check Console Errors
- Look for any JavaScript errors in the console
- Check for API errors (401, 403, 500)
- Verify authentication token is present

## Common Fixes

### Fix 1: Update Courses to PUBLISHED
```sql
UPDATE kursus 
SET status = 'PUBLISHED', published_at = NOW()
WHERE status = 'DRAFT' OR status IS NULL;
```

### Fix 2: Ensure Mitra Profiles Have organization_name
```sql
UPDATE mitra_profiles
SET organization_name = COALESCE(organization_name, 'Training Provider')
WHERE organization_name IS NULL;
```

### Fix 3: Create Missing Talenta Profile
```sql
-- If talenta1@demo.com doesn't have a profile
INSERT INTO talenta_profiles (user_id, nik, phone)
SELECT user_id, '3201010101010001', '081234567890'
FROM users
WHERE email = 'talenta1@demo.com'
AND NOT EXISTS (
  SELECT 1 FROM talenta_profiles WHERE user_id = users.user_id
);
```

### Fix 4: Verify Seed Data Ran
```sql
-- Check if seed data was inserted
SELECT COUNT(*) as course_count FROM kursus WHERE status = 'PUBLISHED';
SELECT COUNT(*) as material_count FROM materi;
SELECT COUNT(*) as enrollment_count FROM enrollments;
```

## Expected Behavior

1. **Talenta logs in** → Should see courses page
2. **API call** → `/api/v1/talenta/courses` returns PUBLISHED courses
3. **Courses display** → Grid of course cards
4. **Recommended courses** → Shows courses not yet enrolled

If courses don't show:
- Check browser console for errors
- Check Network tab for API response
- Verify database has PUBLISHED courses
- Verify user is authenticated correctly
