# Fixes Applied ✅

## 1. Landing Page Access ✅

### Issue
Users were automatically redirected to dashboard when logged in, preventing access to the landing page.

### Fix
- Removed automatic redirect logic from landing page
- Users can now access the landing page whether logged in or logged out
- Dashboard access is available via header navigation when logged in

### Changes
**File**: `Application/src/app/page.tsx`
- Removed `useEffect` that redirected authenticated users
- Removed dependency on `isAuthenticated` and `loading` for rendering
- Landing page now always renders regardless of auth state

## 2. Database Query Error Fix ✅

### Issue
Error: `column courses_1.aqrf_level does not exist`
- The API was trying to select `aqrf_level` from the `courses` table
- But `aqrf_level` is stored in the `certificates` table, not `courses`

### Root Cause
The query in `/api/v1/talenta/certificates/route.ts` was:
```sql
SELECT *, courses (title, skkni_code, aqrf_level)
```
The `aqrf_level` column doesn't exist in the `courses` table.

### Fix
**File**: `Application/src/app/api/v1/talenta/certificates/route.ts`

1. **Removed `aqrf_level` from courses selection**:
   ```typescript
   courses:course_id (title, skkni_code)  // Removed aqrf_level
   ```

2. **Added proper data transformation**:
   - Select `aqrf_level` directly from `certificates` table
   - Fetch issuer names from `mitra_profiles` separately
   - Transform data to match frontend interface expectations

3. **Enhanced query to include all needed fields**:
   - Certificate ID, number, dates
   - AQRF level from certificates table
   - Course title and SKKNI code from courses table
   - Issuer name from mitra_profiles

### Database Schema Reference
- **certificates table**: Has `aqrf_level` column (TEXT type)
- **courses table**: Has `title`, `skkni_code` but NOT `aqrf_level`
- **mitra_profiles table**: Has `organization_name` for issuer

### Data Transformation
The API now transforms the response to match frontend expectations:
```typescript
{
  sertifikat_id: string,
  certificate_number: string,
  title: string,              // from courses.title
  course_title: string,       // from courses.title
  issued_date: string,
  expiration_date: string,
  skkni_code: string,        // from courses.skkni_code
  aqrf_level: number,        // from certificates.aqrf_level
  status: string,
  issuer_name: string         // from mitra_profiles.organization_name
}
```

## Testing

### Landing Page
- ✅ Can access `/` when logged out
- ✅ Can access `/` when logged in
- ✅ No automatic redirect to dashboard
- ✅ Header navigation works for dashboard access

### Certificates API
- ✅ No more `aqrf_level` column error
- ✅ Certificates fetch successfully
- ✅ All required fields are present
- ✅ Data transformation works correctly

## Files Modified

1. `Application/src/app/page.tsx` - Removed redirect logic
2. `Application/src/app/api/v1/talenta/certificates/route.ts` - Fixed query and added transformation

## Status

✅ **Both issues fixed and tested**
- Landing page accessible to all users
- Certificates API working correctly
- No database errors

---

**Last Updated**: Fixed landing page access and certificates API database error
