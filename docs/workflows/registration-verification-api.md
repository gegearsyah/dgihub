# Registration & Verification API Stubs

## Overview

This document defines API endpoints for user registration and verification for all three user types, based on flow chart nodes [1-3, 13-15, 17, 19, 23].

## 1. Unified Registration & Login [1-3]

### Registration Endpoint

```typescript
// api/auth/registration.ts
interface RegistrationRequest {
  email: string;
  password: string;
  fullName: string;
  userType: 'TALENTA' | 'MITRA' | 'INDUSTRI';
  // Talenta specific
  nik?: string;
  dateOfBirth?: Date;
  phone?: string;
  // Mitra specific
  organizationName?: string;
  registrationNumber?: string;
  taxId?: string;
  // Industri specific
  companyName?: string;
  companyTaxId?: string;
  companyAddress?: string;
}

interface RegistrationResponse {
  success: boolean;
  userId: string;
  userType: string;
  verificationRequired: boolean;
  verificationMethod: 'EMAIL' | 'SMS' | 'MANUAL';
  message: string;
}

// POST /api/v1/auth/register
export const registerUser = async (
  data: RegistrationRequest
): Promise<RegistrationResponse> => {
  // Step 1: Validate input
  validateRegistrationData(data);

  // Step 2: Check if user exists
  const existingUser = await db.findUserByEmail(data.email);
  if (existingUser) {
    throw new Error('User already exists');
  }

  // Step 3: Hash password
  const hashedPassword = await bcrypt.hash(data.password, 10);

  // Step 4: Create user account
  const user = await db.createUser({
    email: data.email,
    password: hashedPassword,
    fullName: data.fullName,
    userType: data.userType,
    status: 'PENDING_VERIFICATION',
    createdAt: new Date()
  });

  // Step 5: Create user-type-specific profile
  if (data.userType === 'TALENTA') {
    await createTalentaProfile(user.id, {
      nik: data.nik,
      dateOfBirth: data.dateOfBirth,
      phone: data.phone
    });
  } else if (data.userType === 'MITRA') {
    await createMitraProfile(user.id, {
      organizationName: data.organizationName,
      registrationNumber: data.registrationNumber,
      taxId: data.taxId
    });
  } else if (data.userType === 'INDUSTRI') {
    await createIndustriProfile(user.id, {
      companyName: data.companyName,
      companyTaxId: data.companyTaxId,
      companyAddress: data.companyAddress
    });
  }

  // Step 6: Send verification code
  const verificationCode = generateVerificationCode();
  await db.saveVerificationCode(user.id, verificationCode);

  if (data.userType === 'TALENTA') {
    await sendEmailVerification(user.email, verificationCode);
  } else {
    // Mitra and Industri require manual verification
    await sendVerificationRequestToAdmin(user.id, data.userType);
  }

  return {
    success: true,
    userId: user.id,
    userType: data.userType,
    verificationRequired: true,
    verificationMethod: data.userType === 'TALENTA' ? 'EMAIL' : 'MANUAL',
    message: 'Registration successful. Please verify your account.'
  };
};
```

### Login Endpoint

```typescript
// api/auth/login.ts
interface LoginRequest {
  email: string;
  password: string;
  userType?: 'TALENTA' | 'MITRA' | 'INDUSTRI';
}

interface LoginResponse {
  success: boolean;
  token: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    userType: string;
    profileComplete: boolean;
  };
  expiresIn: number;
}

// POST /api/v1/auth/login
export const loginUser = async (data: LoginRequest): Promise<LoginResponse> => {
  // Step 1: Find user
  const user = await db.findUserByEmail(data.email);
  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Step 2: Verify password
  const passwordValid = await bcrypt.compare(data.password, user.password);
  if (!passwordValid) {
    throw new Error('Invalid credentials');
  }

  // Step 3: Check user type match
  if (data.userType && user.userType !== data.userType) {
    throw new Error('Invalid user type');
  }

  // Step 4: Check verification status
  if (user.status !== 'VERIFIED' && user.status !== 'ACTIVE') {
    throw new Error('Account not verified. Please verify your account first.');
  }

  // Step 5: Generate tokens
  const token = jwt.sign(
    { userId: user.id, userType: user.userType },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  // Step 6: Save refresh token
  await db.saveRefreshToken(user.id, refreshToken);

  // Step 7: Update last login
  await db.updateUser(user.id, { lastLoginAt: new Date() });

  // Step 8: Get profile completion status
  const profileComplete = await checkProfileComplete(user.id, user.userType);

  return {
    success: true,
    token,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      userType: user.userType,
      profileComplete
    },
    expiresIn: 24 * 60 * 60 // 24 hours in seconds
  };
};
```

## 2. Talenta Verification [23]

```typescript
// api/talenta/verification.ts
interface TalentaVerificationRequest {
  userId: string;
  verificationCode?: string;
  nik?: string;
  // e-KYC data
  biometricData?: {
    type: 'FINGERPRINT' | 'FACE' | 'IRIS';
    data: string; // base64 encoded
  };
  documentData?: {
    type: 'KTP' | 'PASSPORT';
    frontImage: string;
    backImage?: string;
  };
}

// POST /api/v1/talenta/verify
export const verifyTalenta = async (
  data: TalentaVerificationRequest
): Promise<VerificationResponse> => {
  // Step 1: Email verification (if code provided)
  if (data.verificationCode) {
    const isValid = await db.verifyEmailCode(data.userId, data.verificationCode);
    if (!isValid) {
      throw new Error('Invalid verification code');
    }
  }

  // Step 2: NIK verification (if provided)
  if (data.nik) {
    const nikValidation = await dukcapilApi.validateNIK(data.nik);
    if (!nikValidation.valid) {
      throw new Error('Invalid NIK');
    }
    await db.updateTalentaProfile(data.userId, {
      nik: data.nik,
      nikVerified: true,
      nikVerifiedAt: new Date()
    });
  }

  // Step 3: e-KYC verification (if provided)
  if (data.biometricData && data.documentData) {
    const ekycResult = await ekycService.performEKYC({
      nik: data.nik,
      biometricData: data.biometricData,
      documentData: data.documentData
    });

    if (!ekycResult.verified) {
      throw new Error('e-KYC verification failed');
    }

    await db.updateTalentaProfile(data.userId, {
      ekycVerified: true,
      ekycVerifiedAt: new Date(),
      biometricType: data.biometricData.type
    });
  }

  // Step 4: Update user status
  await db.updateUser(data.userId, {
    status: 'VERIFIED',
    verifiedAt: new Date()
  });

  return {
    success: true,
    verified: true,
    message: 'Account verified successfully'
  };
};
```

## 3. Mitra Verification [19]

```typescript
// api/mitra/verification.ts
interface MitraVerificationRequest {
  userId: string;
  organizationName: string;
  registrationNumber: string;
  taxId: string;
  documents: {
    registrationCertificate: string; // file URL
    taxCertificate: string;
    accreditationLetter?: string;
  };
  contactPerson: {
    name: string;
    email: string;
    phone: string;
    position: string;
  };
}

// POST /api/v1/mitra/verify
export const verifyMitra = async (
  data: MitraVerificationRequest
): Promise<VerificationResponse> => {
  // Step 1: Validate registration number
  const registrationValid = await validateLPKRegistration(data.registrationNumber);
  if (!registrationValid) {
    throw new Error('Invalid LPK registration number');
  }

  // Step 2: Validate tax ID
  const taxIdValid = await validateTaxId(data.taxId);
  if (!taxIdValid) {
    throw new Error('Invalid tax ID');
  }

  // Step 3: Upload and verify documents
  const documentVerification = await verifyDocuments(data.documents);
  if (!documentVerification.valid) {
    throw new Error(`Document verification failed: ${documentVerification.reason}`);
  }

  // Step 4: Update Mitra profile
  await db.updateMitraProfile(data.userId, {
    organizationName: data.organizationName,
    registrationNumber: data.registrationNumber,
    taxId: data.taxId,
    documents: data.documents,
    contactPerson: data.contactPerson,
    verificationStatus: 'PENDING_REVIEW',
    submittedAt: new Date()
  });

  // Step 5: Create verification request for admin
  await db.createVerificationRequest({
    userId: data.userId,
    userType: 'MITRA',
    status: 'PENDING',
    submittedAt: new Date(),
    documents: data.documents
  });

  // Step 6: Notify admin
  await notificationService.sendToAdmins({
    type: 'verification_request',
    title: 'New Mitra Verification Request',
    message: `${data.organizationName} has submitted verification documents`,
    data: { userId: data.userId }
  });

  return {
    success: true,
    verified: false,
    message: 'Verification request submitted. Awaiting admin approval.'
  };
};

// Admin approval endpoint
// POST /api/v1/admin/mitra/verify
export const approveMitraVerification = async (
  userId: string,
  adminId: string,
  approvalData: ApprovalData
): Promise<void> => {
  // Step 1: Update verification status
  await db.updateVerificationRequest(userId, {
    status: approvalData.approved ? 'APPROVED' : 'REJECTED',
    reviewedBy: adminId,
    reviewedAt: new Date(),
    notes: approvalData.notes
  });

  // Step 2: Update user status
  await db.updateUser(userId, {
    status: approvalData.approved ? 'VERIFIED' : 'REJECTED'
  });

  // Step 3: Update Mitra profile
  await db.updateMitraProfile(userId, {
    verificationStatus: approvalData.approved ? 'VERIFIED' : 'REJECTED',
    verifiedAt: approvalData.approved ? new Date() : null
  });

  // Step 4: Send notification
  await notificationService.send({
    userId,
    type: 'verification_result',
    title: approvalData.approved ? 'Verification Approved' : 'Verification Rejected',
    message: approvalData.approved
      ? 'Your Mitra account has been verified'
      : `Verification rejected: ${approvalData.notes}`
  });
};
```

## 4. Industri Verification [17]

```typescript
// api/industri/verification.ts
interface IndustriVerificationRequest {
  userId: string;
  companyName: string;
  companyTaxId: string;
  companyAddress: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
  };
  documents: {
    companyRegistration: string;
    taxCertificate: string;
    businessLicense?: string;
  };
  contactPerson: {
    name: string;
    email: string;
    phone: string;
    position: string;
  };
}

// POST /api/v1/industri/verify
export const verifyIndustri = async (
  data: IndustriVerificationRequest
): Promise<VerificationResponse> => {
  // Step 1: Validate company tax ID (NPWP)
  const taxIdValid = await validateCompanyTaxId(data.companyTaxId);
  if (!taxIdValid) {
    throw new Error('Invalid company tax ID');
  }

  // Step 2: Verify company registration
  const companyValid = await validateCompanyRegistration(
    data.companyName,
    data.companyTaxId
  );
  if (!companyValid) {
    throw new Error('Company registration not found');
  }

  // Step 3: Upload and verify documents
  const documentVerification = await verifyCompanyDocuments(data.documents);
  if (!documentVerification.valid) {
    throw new Error(`Document verification failed: ${documentVerification.reason}`);
  }

  // Step 4: Update Industri profile
  await db.updateIndustriProfile(data.userId, {
    companyName: data.companyName,
    companyTaxId: data.companyTaxId,
    companyAddress: data.companyAddress,
    documents: data.documents,
    contactPerson: data.contactPerson,
    verificationStatus: 'PENDING_REVIEW',
    submittedAt: new Date()
  });

  // Step 5: Create verification request
  await db.createVerificationRequest({
    userId: data.userId,
    userType: 'INDUSTRI',
    status: 'PENDING',
    submittedAt: new Date(),
    documents: data.documents
  });

  // Step 6: Notify admin
  await notificationService.sendToAdmins({
    type: 'verification_request',
    title: 'New Industri Verification Request',
    message: `${data.companyName} has submitted verification documents`,
    data: { userId: data.userId }
  });

  return {
    success: true,
    verified: false,
    message: 'Verification request submitted. Awaiting admin approval.'
  };
};
```

## 5. Common Verification Endpoints

### Email Verification

```typescript
// POST /api/v1/auth/verify-email
export const verifyEmail = async (
  userId: string,
  code: string
): Promise<VerificationResponse> => {
  const isValid = await db.verifyEmailCode(userId, code);
  if (!isValid) {
    throw new Error('Invalid verification code');
  }

  await db.updateUser(userId, {
    emailVerified: true,
    emailVerifiedAt: new Date()
  });

  return {
    success: true,
    verified: true,
    message: 'Email verified successfully'
  };
};
```

### Resend Verification Code

```typescript
// POST /api/v1/auth/resend-verification
export const resendVerificationCode = async (
  userId: string
): Promise<{ success: boolean; message: string }> => {
  const user = await db.getUser(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const code = generateVerificationCode();
  await db.saveVerificationCode(userId, code);

  if (user.userType === 'TALENTA') {
    await sendEmailVerification(user.email, code);
  } else {
    await sendSMSVerification(user.phone, code);
  }

  return {
    success: true,
    message: 'Verification code sent'
  };
};
```

## API Endpoint Summary

| Endpoint | Method | Description | User Type |
|----------|--------|-------------|-----------|
| `/api/v1/auth/register` | POST | Register new user | All |
| `/api/v1/auth/login` | POST | Login user | All |
| `/api/v1/auth/verify-email` | POST | Verify email | All |
| `/api/v1/auth/resend-verification` | POST | Resend verification code | All |
| `/api/v1/talenta/verify` | POST | Verify Talenta account | Talenta |
| `/api/v1/mitra/verify` | POST | Submit Mitra verification | Mitra |
| `/api/v1/industri/verify` | POST | Submit Industri verification | Industri |
| `/api/v1/admin/mitra/verify` | POST | Approve/reject Mitra | Admin |
| `/api/v1/admin/industri/verify` | POST | Approve/reject Industri | Admin |

---

**Last Updated**: 2024-01-15  
**Version**: 1.0.0


