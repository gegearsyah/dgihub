# Account Login Troubleshooting Guide

## Verified Demo Accounts

All demo accounts use password: **`password123`**

### Talenta Accounts
- `talenta1@demo.com` / `password123`
- `talenta2@demo.com` / `password123`
- `talenta3@demo.com` / `password123`
- `talenta4@demo.com` / `password123`
- `talenta5@demo.com` / `password123`

### Mitra Accounts
- `mitra1@demo.com` / `password123`
- `mitra2@demo.com` / `password123`
- `mitra3@demo.com` / `password123`

### Industri Accounts
- `industri1@demo.com` / `password123`
- `industri2@demo.com` / `password123`
- `industri3@demo.com` / `password123`

## Common Issues & Solutions

### Issue: "Invalid email or password"

**Possible Causes:**
1. Wrong password (must be exactly `password123`)
2. Email case sensitivity (emails are case-insensitive but check spelling)
3. Account status is not ACTIVE or VERIFIED

**Solution:**
```bash
# Check user status
node scripts/check-all-users.js

# Fix user status if needed
node scripts/test-login.js
```

### Issue: "Account is pending_verification"

**Solution:**
The seed script should create users with `ACTIVE` status. If you see this error:

```bash
# Re-seed the database
npm run db:seed
```

Or manually fix:
```sql
UPDATE users 
SET status = 'ACTIVE', email_verified = TRUE 
WHERE email = 'your-email@demo.com';
```

### Issue: Password hash mismatch

**Solution:**
If passwords don't work, re-seed:
```bash
npm run db:reset  # WARNING: This deletes all data
npm run db:migrate
npm run db:seed
```

## Testing Login

### Test via Script
```bash
node scripts/test-api-login.js
```

### Test via API (if server is running)
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"talenta1@demo.com","password":"password123"}'
```

### Test via Frontend
1. Navigate to login page
2. Use: `talenta1@demo.com` / `password123`
3. Should redirect to dashboard

## Verification Checklist

✅ Database is migrated: `npm run db:migrate`
✅ Database is seeded: `npm run db:seed`
✅ All users have status ACTIVE or VERIFIED
✅ All users have email_verified = TRUE
✅ Password hash is correct (bcrypt)
✅ Server is running: `npm start` or `npm run dev`

## Quick Fix Script

If accounts don't work, run:
```bash
node scripts/check-all-users.js
```

This will:
1. Check all users
2. Fix any users with wrong status
3. Test password validation

## Still Having Issues?

1. **Check server logs** for detailed error messages
2. **Verify database connection** in `.env` file
3. **Check JWT_SECRET** is set in `.env`
4. **Verify email normalization** - login uses `normalizeEmail()` which converts to lowercase

## Account Status Values

- `ACTIVE` ✅ - Can login
- `VERIFIED` ✅ - Can login  
- `PENDING_VERIFICATION` ❌ - Cannot login
- `SUSPENDED` ❌ - Cannot login
- `REJECTED` ❌ - Cannot login

---

**Last Updated**: 2024-01-15



