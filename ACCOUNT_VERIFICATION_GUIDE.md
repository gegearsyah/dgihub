# 🔐 Account Verification Guide

## How Account Verification Works

When you register, the system:
1. Creates your account with status `PENDING_VERIFICATION`
2. Generates a 6-digit verification code (stored in database)
3. Sets expiration time (24 hours from registration)

**Note:** Currently, the verification code is stored but not automatically sent via email/SMS. You need to verify manually or via Supabase.

---

## ✅ Method 1: Manual Verification via Supabase (For Development)

### Step 1: View Users in Supabase

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Select your project
3. Click **Table Editor** in the left sidebar
4. Click on **`users`** table

### Step 2: Find Your User

- Look for your email address
- Check the `status` column (should be `PENDING_VERIFICATION`)
- Note the `verification_code` (6-digit number)

### Step 3: Update Status Manually

1. Click on your user row
2. Click **Edit Row** (or double-click the row)
3. Change `status` from `PENDING_VERIFICATION` to `VERIFIED` or `ACTIVE`
4. Optionally set `email_verified` to `true`
5. Click **Save**

**That's it!** Your account is now verified.

---

## ✅ Method 2: Verify via SQL Editor

### Step 1: Open SQL Editor

1. Go to Supabase Dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: View Verification Code

```sql
-- View all pending verification users
SELECT 
    user_id,
    email,
    full_name,
    user_type,
    status,
    verification_code,
    verification_code_expires_at,
    created_at
FROM public.users
WHERE status = 'PENDING_VERIFICATION'
ORDER BY created_at DESC;
```

### Step 3: Verify Account

Replace `'your-email@example.com'` with your actual email:

```sql
-- Verify a specific user
UPDATE public.users
SET 
    status = 'VERIFIED',
    email_verified = true,
    email_verified_at = NOW()
WHERE email = 'your-email@example.com';
```

Or verify by verification code:

```sql
-- Verify using verification code
UPDATE public.users
SET 
    status = 'VERIFIED',
    email_verified = true,
    email_verified_at = NOW()
WHERE verification_code = '123456'  -- Replace with your code
  AND verification_code_expires_at > NOW();
```

---

## ✅ Method 3: Create Verification API Endpoint (Recommended)

Currently, there's no verification endpoint. Here's how to create one:

### Create Verification Endpoint

Create file: `src/app/api/v1/auth/verify/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, verificationCode } = body;

    if (!email || !verificationCode) {
      return NextResponse.json(
        { success: false, message: 'Email and verification code are required' },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, message: 'Database not configured' },
        { status: 500 }
      );
    }

    const db = supabaseAdmin;

    // Find user
    const { data: user, error: findError } = await db
      .from('users')
      .select('user_id, email, verification_code, verification_code_expires_at, status')
      .eq('email', email.toLowerCase())
      .single();

    if (findError || !user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if already verified
    if (user.status === 'VERIFIED' || user.status === 'ACTIVE') {
      return NextResponse.json(
        { success: false, message: 'Account already verified' },
        { status: 400 }
      );
    }

    // Check verification code
    if (user.verification_code !== verificationCode) {
      return NextResponse.json(
        { success: false, message: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Check if code expired
    const expiresAt = new Date(user.verification_code_expires_at);
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, message: 'Verification code has expired' },
        { status: 400 }
      );
    }

    // Verify account
    const { error: updateError } = await db
      .from('users')
      .update({
        status: 'VERIFIED',
        email_verified: true,
        email_verified_at: new Date().toISOString(),
        verification_code: null, // Clear code after use
        verification_code_expires_at: null
      })
      .eq('user_id', user.user_id);

    if (updateError) {
      console.error('Verification update error:', updateError);
      return NextResponse.json(
        { success: false, message: 'Failed to verify account' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Account verified successfully',
      data: {
        userId: user.user_id,
        email: user.email,
        status: 'VERIFIED'
      }
    });
  } catch (error: any) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred during verification' },
      { status: 500 }
    );
  }
}
```

### Use the Verification Endpoint

```bash
POST /api/v1/auth/verify
Content-Type: application/json

{
  "email": "your-email@example.com",
  "verificationCode": "123456"
}
```

---

## 📊 How to View Data in Supabase

### Method 1: Table Editor (Easiest)

1. **Go to Supabase Dashboard**
   - [https://app.supabase.com](https://app.supabase.com)
   - Select your project

2. **Open Table Editor**
   - Click **Table Editor** in left sidebar
   - You'll see all your tables:
     - `users` - All registered users
     - `talenta_profiles` - Learner profiles
     - `mitra_profiles` - Training provider profiles
     - `industri_profiles` - Employer profiles
     - `courses` - Training courses
     - `enrollments` - Course enrollments
     - `certificates` - Issued certificates
     - `job_postings` - Job listings
     - `job_applications` - Job applications

3. **View Data**
   - Click on any table name
   - See all rows with columns
   - Use search/filter at the top
   - Click on a row to edit

4. **Edit Data**
   - Double-click a cell to edit
   - Or click **Edit Row** button
   - Click **Save** when done

### Method 2: SQL Editor (More Powerful)

1. **Open SQL Editor**
   - Click **SQL Editor** in left sidebar
   - Click **New Query**

2. **Run Queries**

```sql
-- View all users
SELECT * FROM public.users;

-- View users with their profiles
SELECT 
    u.user_id,
    u.email,
    u.full_name,
    u.user_type,
    u.status,
    u.email_verified,
    u.created_at,
    tp.phone as talenta_phone,
    tp.nik as talenta_nik
FROM public.users u
LEFT JOIN public.talenta_profiles tp ON u.user_id = tp.user_id
ORDER BY u.created_at DESC;

-- View pending verification users
SELECT 
    user_id,
    email,
    full_name,
    user_type,
    verification_code,
    verification_code_expires_at
FROM public.users
WHERE status = 'PENDING_VERIFICATION';

-- View courses
SELECT * FROM public.courses;

-- View enrollments
SELECT 
    e.*,
    u.email as student_email,
    c.title as course_title
FROM public.enrollments e
JOIN public.talenta_profiles tp ON e.talenta_id = tp.profile_id
JOIN public.users u ON tp.user_id = u.user_id
JOIN public.courses c ON e.course_id = c.id;
```

3. **Save Queries**
   - Click **Save** to save frequently used queries
   - Access them later from **Saved Queries**

### Method 3: Database API (Programmatic)

You can also query via the Supabase client in your code:

```typescript
import { supabaseAdmin } from '@/lib/db';

// Get all users
const { data: users } = await supabaseAdmin
  .from('users')
  .select('*');

// Get user by email
const { data: user } = await supabaseAdmin
  .from('users')
  .select('*')
  .eq('email', 'user@example.com')
  .single();
```

---

## 🔍 Quick Verification Queries

### Find Your Verification Code

```sql
SELECT 
    email,
    verification_code,
    verification_code_expires_at,
    status
FROM public.users
WHERE email = 'your-email@example.com';
```

### Verify All Pending Users (Development Only!)

```sql
-- ⚠️ Use with caution - verifies ALL pending users
UPDATE public.users
SET 
    status = 'VERIFIED',
    email_verified = true,
    email_verified_at = NOW()
WHERE status = 'PENDING_VERIFICATION';
```

### Check User Status

```sql
SELECT 
    email,
    full_name,
    user_type,
    status,
    email_verified,
    created_at
FROM public.users
ORDER BY created_at DESC
LIMIT 10;
```

---

## 📝 Verification Status Values

- `PENDING_VERIFICATION` - Just registered, needs verification
- `VERIFIED` - Email verified, account active
- `ACTIVE` - Fully active account (can login)
- `SUSPENDED` - Account suspended
- `REJECTED` - Registration rejected

---

## 🚀 Next Steps

1. **For Development:** Use Method 1 or 2 to verify accounts manually
2. **For Production:** Implement Method 3 (verification endpoint) and add email sending
3. **Add Email Service:** Integrate email service (SendGrid, AWS SES, etc.) to send verification codes automatically

---

**Need help?** Check the Supabase docs: [https://supabase.com/docs](https://supabase.com/docs)




