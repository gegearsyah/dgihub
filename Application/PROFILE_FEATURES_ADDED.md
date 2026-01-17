# Detailed Profile Features for Mitra (LPK) and Industri

## ✅ Completed Features

### 1. **LPK-Specific Database Fields** 📋
Created migration `009_add_lpk_fields.sql` with all required fields based on Indonesian government LPK regulations:

#### LPK Credentials:
- `lpk_license_number` - Nomor Izin LPK
- `lpk_establishment_decree` - SK Penetapan LPK
- `operational_license_number` - Nomor Izin Operasional
- `bnsp_accreditation_number` - Nomor Akreditasi BNSP
- `bnsp_accreditation_date` - Tanggal Akreditasi
- `bnsp_accreditation_expiry` - Masa Berlaku Akreditasi

#### Organization Details:
- `legal_status` - Status Hukum (Yayasan, CV, PT, etc.)
- `director_name` - Nama Direktur/Pimpinan
- `director_nip` - NIP Direktur (if applicable)
- `number_of_instructors` - Jumlah Instruktur
- `employee_count` - Jumlah Karyawan
- `years_of_operation` - Tahun Berdiri
- `total_graduates` - Total Lulusan

#### Business Information:
- `field_of_expertise` - Bidang Keahlian
- `facilities` - Fasilitas
- `training_programs` - Program Pelatihan
- `bank_name` - Nama Bank
- `bank_account_name` - Nama Rekening
- `bank_account_number` - Nomor Rekening

#### Documents:
- `lpk_license_certificate_url` - Sertifikat Izin LPK
- `establishment_decree_url` - SK Penetapan
- `bnsp_certificate_url` - Sertifikat Akreditasi BNSP
- `domicile_certificate_url` - Surat Keterangan Domisili
- `siup_url` - SIUP (Surat Izin Usaha Perdagangan)

### 2. **Detailed Mitra (LPK) Profile Page** 🏢
**Location**: `/mitra/profile`

#### Features:
- **4 Tabs**:
  1. **Basic Info**: Organization details, contact information
  2. **LPK Credentials**: All LPK-specific fields and BNSP accreditation
  3. **Documents**: Upload and manage all required documents
  4. **Statistics**: Total graduates, instructors, employees

#### Verification Badges:
- ✅ **Verified LPK** (Green) - Verified by admin
- ⏳ **Pending Review** (Yellow) - Awaiting verification
- ❌ **Rejected** (Red) - Verification rejected

#### Accreditation Badges:
- ✅ **Accredited** (Blue) - BNSP accredited and valid
- ⏳ **Pending** (Gray) - Accreditation pending
- ❌ **Expired** (Red) - Accreditation expired

#### All Required Fields:
- Organization name, registration number, tax ID
- LPK license number and establishment decree
- BNSP accreditation details
- Director information
- Field of expertise, facilities, training programs
- Bank account information
- All document uploads

### 3. **Detailed Industri Profile Page** 🏭
**Location**: `/industri/profile`

#### Features:
- **3 Tabs**:
  1. **Company Info**: Company details, business information
  2. **Documents**: Company registration, tax certificate, business license
  3. **Contact Details**: Contact person information

#### Verification Badges:
- ✅ **Verified Company** (Green)
- ⏳ **Pending Review** (Yellow)
- ❌ **Rejected** (Red)

#### All Required Fields:
- Company name, tax ID (NPWP), company type
- Industry sector
- Address, city, province, postal code
- Contact person details
- Tax incentive eligibility
- All document uploads

### 4. **API Endpoints** 🔌

#### Mitra Profile:
- `GET /api/v1/mitra/profile` - Get Mitra profile
- `PUT /api/v1/mitra/profile` - Update Mitra profile

#### Industri Profile:
- `GET /api/v1/industri/profile` - Get Industri profile
- `PUT /api/v1/industri/profile` - Update Industri profile

### 5. **Smart Profile Routing** 🔀
- `/profile` automatically redirects:
  - **MITRA** → `/mitra/profile`
  - **INDUSTRI** → `/industri/profile`
  - **TALENTA** → stays on `/profile`

## 📋 LPK Legitimacy Indicators

### Required for Verification:
1. ✅ LPK License Number (Nomor Izin LPK)
2. ✅ Registration Number
3. ✅ BNSP Accreditation (if applicable)
4. ✅ Director Information
5. ✅ Field of Expertise
6. ✅ Facilities Description
7. ✅ Training Programs
8. ✅ Bank Account Information
9. ✅ All Required Documents

### Document Requirements:
1. **LPK License Certificate** - Sertifikat Izin LPK
2. **Registration Certificate** - Sertifikat Registrasi
3. **BNSP Accreditation Certificate** - Sertifikat Akreditasi BNSP
4. **Establishment Decree** - SK Penetapan LPK
5. **Tax Certificate (NPWP)** - Sertifikat NPWP
6. **Domicile Certificate** - Surat Keterangan Domisili
7. **SIUP** - Surat Izin Usaha Perdagangan (if applicable)

## 🎯 Features

### For Mitra (LPK):
- ✅ Complete LPK credential management
- ✅ BNSP accreditation tracking
- ✅ Document upload and management
- ✅ Verification status display
- ✅ Accreditation expiry tracking
- ✅ Statistics dashboard
- ✅ All fields required by Indonesian government

### For Industri:
- ✅ Company information management
- ✅ Business license tracking
- ✅ Tax incentive eligibility
- ✅ Document management
- ✅ Verification status
- ✅ Contact person management

## 📁 Files Created/Modified

### Created:
- `Application/supabase/migrations/009_add_lpk_fields.sql` - LPK fields migration
- `Application/src/app/mitra/profile/page.tsx` - Mitra profile page
- `Application/src/app/industri/profile/page.tsx` - Industri profile page
- `Application/src/app/api/v1/mitra/profile/route.ts` - Mitra profile API
- `Application/src/app/api/v1/industri/profile/route.ts` - Industri profile API
- `Application/PROFILE_FEATURES_ADDED.md` - This documentation

### Modified:
- `Application/src/lib/api.ts` - Added profile API methods
- `Application/src/app/profile/page.tsx` - Added redirect logic

## 🚀 Usage

### For Mitra:
1. Navigate to `/mitra/profile` or click Profile in menu
2. Fill in all required LPK fields
3. Upload all required documents
4. Submit for verification
5. Wait for admin verification
6. Once verified, badge shows "Verified LPK"

### For Industri:
1. Navigate to `/industri/profile` or click Profile in menu
2. Fill in company information
3. Upload required documents
4. Submit for verification
5. Once verified, badge shows "Verified Company"

## 🔐 Security & Verification

- All profile updates require authentication
- Only verified profiles show verification badges
- Documents are stored securely
- Admin verification required for legitimacy
- Accreditation expiry tracking
- Status badges clearly indicate legitimacy

## 📝 Notes

- All fields are based on Indonesian government LPK regulations
- BNSP accreditation is optional but recommended
- Verification is done by platform administrators
- Documents can be uploaded as URLs (file upload to be implemented)
- Profile data is validated before saving
- All changes are logged with timestamps
