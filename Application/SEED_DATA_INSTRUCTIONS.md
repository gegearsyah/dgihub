# Seed Data Instructions for Learning Experience Feature

## Overview

This document explains how to seed your database with sample data to test the learning experience, quiz system, and workshop attendance features.

## Prerequisites

1. Supabase database set up
2. Database tables created (kursus, materi, enrollments, workshops, etc.)
3. At least one MITRA user and one TALENTA user in the database

## Step 1: Run the Seed SQL

Execute the SQL file `supabase/seed_learning_data.sql` in your Supabase SQL Editor:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Create a new query
4. Copy and paste the contents of `seed_learning_data.sql`
5. Click "Run" to execute

## Step 2: Verify Data

After running the seed script, verify the data was inserted:

```sql
-- Check courses
SELECT * FROM kursus WHERE kursus_id = '550e8400-e29b-41d4-a716-446655440001';

-- Check materials
SELECT * FROM materi WHERE kursus_id = '550e8400-e29b-41d4-a716-446655440001';

-- Check enrollments
SELECT * FROM enrollments WHERE kursus_id = '550e8400-e29b-41d4-a716-446655440001';

-- Check workshops
SELECT * FROM workshops WHERE workshop_id = '880e8400-e29b-41d4-a716-446655440001';
```

## Step 3: Test the Features

### Testing Learning Experience

1. **Login as TALENTA user**
   - Use a user account with `user_type = 'TALENTA'`

2. **Navigate to My Courses**
   - Go to `/talenta/my-courses`
   - You should see "Full Stack Web Development" course
   - Progress should show 20% (1 out of 6 materials completed)

3. **Click "Continue Learning"**
   - Should navigate to `/talenta/courses/550e8400-e29b-41d4-a716-446655440001/learn`
   - Learning page should load with materials sidebar
   - First incomplete material should be selected (React Fundamentals video)

4. **Test Video Player**
   - Click on "Introduction to Web Development" material
   - Video player should appear with controls
   - Play, pause, volume, and progress controls should work
   - Click "Mark as Complete" after watching

5. **Test Document Viewer**
   - Navigate to "JavaScript Best Practices Guide" material
   - PDF viewer should appear
   - Test zoom, download, and external link features

6. **Test Quiz System**
   - Navigate to "React Fundamentals Quiz" material
   - Quiz interface should appear with 5 questions
   - Answer questions and submit
   - Results page should show score and correct/incorrect answers
   - Passing score is 70% (need at least 4 correct out of 5)

### Testing Workshop Attendance

1. **Login as TALENTA user**

2. **Navigate to Workshops**
   - Go to `/talenta/workshops` (if this page exists)
   - Or directly go to `/talenta/workshops/880e8400-e29b-41d4-a716-446655440001/attendance`

3. **Test GPS Attendance**
   - Click "Get My Location" button
   - Browser should request location permission
   - After granting permission, location should be captured
   - Distance from workshop location should be calculated
   - If within 100m, "Record Attendance" button should be enabled
   - Click to record attendance

## Sample Data Details

### Course: Full Stack Web Development
- **Course ID**: `550e8400-e29b-41d4-a716-446655440001`
- **Materials**:
  1. Introduction to Web Development (Video) - 1 hour
  2. React Fundamentals (Video) - 1.5 hours
  3. JavaScript Best Practices Guide (PDF)
  4. React Fundamentals Quiz (Quiz) - 15 minutes, 5 questions
  5. Node.js Backend Development (Video) - 2 hours
  6. Additional Resources (External Link)

### Workshop: Hands-on React Workshop
- **Workshop ID**: `880e8400-e29b-41d4-a716-446655440001`
- **Location**: Jakarta Pusat, DKI Jakarta
- **Coordinates**: -6.2088, 106.8456 (Monas area)
- **Date**: 7 days from now
- **Time**: 09:00 - 17:00

### Quiz: React Fundamentals Quiz
- **5 Questions** covering:
  - What is React?
  - React Hooks
  - useState hook
  - JSX
  - Props
- **Time Limit**: 15 minutes
- **Passing Score**: 70% (4 out of 5 correct)

## Troubleshooting

### Issue: "Continue Learning" link shows undefined
**Solution**: Make sure the enrollment has a valid `kursus_id`. Check the database:
```sql
SELECT enrollment_id, kursus_id, talenta_id FROM enrollments;
```

### Issue: No materials showing in learning page
**Solution**: Verify materials exist and are linked to the course:
```sql
SELECT * FROM materi WHERE kursus_id = '550e8400-e29b-41d4-a716-446655440001';
```

### Issue: Quiz not loading
**Solution**: Check that quiz material has JSON data in description:
```sql
SELECT materi_id, title, description FROM materi WHERE material_type = 'QUIZ';
```

### Issue: GPS location not working
**Solution**: 
- Make sure browser has location permissions
- Test in HTTPS or localhost (required for geolocation API)
- Check browser console for errors

## Customizing Seed Data

To customize the seed data:

1. **Change Course IDs**: Update all references to use your own UUIDs
2. **Update File URLs**: Replace sample video/PDF URLs with your actual file storage URLs
3. **Modify Quiz Questions**: Edit the JSON in the quiz material description
4. **Adjust Workshop Location**: Update latitude/longitude to your test location

## Next Steps

After testing with seed data:

1. Create real courses through the Mitra portal
2. Upload actual video/document files to your storage (S3, Cloudinary, etc.)
3. Create quizzes using the Quiz Builder UI
4. Set up real workshop locations

## Notes

- Sample video URLs are from Google Cloud Storage (public test videos)
- Sample PDF URLs are from W3C (public test files)
- In production, use your own file storage service
- Workshop location is set to Jakarta coordinates - adjust for your testing location
