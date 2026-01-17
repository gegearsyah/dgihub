-- ============================================================================
-- Update All Profiles with Complete Data
-- This script ensures all existing profiles have complete data
-- Run this after seed_comprehensive_data.sql or independently
-- ============================================================================

DO $$
DECLARE
    v_mitra_profile_id UUID;
    v_talenta_profile_id UUID;
    v_industri_profile_id UUID;
BEGIN
    -- ============================================================================
    -- UPDATE MITRA PROFILES (especially mitra1@demo.com)
    -- ============================================================================
    
    -- Update mitra1@demo.com profile specifically
    UPDATE public.mitra_profiles mp
    SET 
        organization_name = COALESCE(mp.organization_name, 'LPK Teknologi Indonesia'),
        lpk_license_number = COALESCE(mp.lpk_license_number, 'LPK-2024-001'),
        bnsp_accreditation_number = COALESCE(mp.bnsp_accreditation_number, 'BNSP-2024-001'),
        director_name = COALESCE(mp.director_name, 'Dr. Ahmad Wijaya, S.T., M.T.'),
        field_of_expertise = COALESCE(mp.field_of_expertise, 'Teknologi Informasi, Pengembangan Perangkat Lunak, Cloud Computing'),
        number_of_instructors = COALESCE(mp.number_of_instructors, 15),
        facilities = COALESCE(mp.facilities, 'Laboratorium komputer dengan 50 unit PC, ruang kelas ber-AC, perpustakaan digital, WiFi high-speed'),
        training_programs = COALESCE(mp.training_programs, 'Full Stack Web Development, Cloud Computing, Mobile App Development, Data Science, DevOps, Cybersecurity'),
        bank_account_name = COALESCE(mp.bank_account_name, 'LPK Teknologi Indonesia'),
        bank_account_number = COALESCE(mp.bank_account_number, '1234567890'),
        bank_name = COALESCE(mp.bank_name, 'Bank Mandiri'),
        verification_status = COALESCE(mp.verification_status, 'VERIFIED')
    FROM public.users u
    WHERE mp.user_id = u.user_id
    AND u.email = 'mitra1@demo.com';
    
    -- Update all other mitra profiles with default data
    -- Use a CTE to generate row numbers, then update
    WITH numbered_profiles AS (
        SELECT 
            mp.profile_id,
            mp.user_id,
            u.full_name,
            ROW_NUMBER() OVER (ORDER BY mp.profile_id) as row_num
        FROM public.mitra_profiles mp
        JOIN public.users u ON mp.user_id = u.user_id
        WHERE u.user_type = 'MITRA'
        AND u.email != 'mitra1@demo.com'
        AND (mp.organization_name IS NULL OR mp.lpk_license_number IS NULL)
    )
    UPDATE public.mitra_profiles mp
    SET 
        organization_name = COALESCE(mp.organization_name, np.full_name),
        lpk_license_number = COALESCE(mp.lpk_license_number, 'LPK-2024-' || LPAD(np.row_num::TEXT, 3, '0')),
        bnsp_accreditation_number = COALESCE(mp.bnsp_accreditation_number, 'BNSP-2024-' || LPAD(np.row_num::TEXT, 3, '0')),
        director_name = COALESCE(mp.director_name, 'Director'),
        field_of_expertise = COALESCE(mp.field_of_expertise, 'Teknologi Informasi'),
        number_of_instructors = COALESCE(mp.number_of_instructors, 10),
        facilities = COALESCE(mp.facilities, 'Laboratorium komputer, ruang kelas, perpustakaan'),
        training_programs = COALESCE(mp.training_programs, 'Various training programs'),
        bank_account_name = COALESCE(mp.bank_account_name, np.full_name),
        bank_account_number = COALESCE(mp.bank_account_number, '1234567890'),
        bank_name = COALESCE(mp.bank_name, 'Bank Mandiri'),
        verification_status = COALESCE(mp.verification_status, 'VERIFIED')
    FROM numbered_profiles np
    WHERE mp.profile_id = np.profile_id;
    
    RAISE NOTICE 'Updated Mitra profiles with complete data';

    -- ============================================================================
    -- UPDATE TALENTA PROFILES (especially talenta1@demo.com)
    -- ============================================================================
    
    -- Update talenta1@demo.com profile specifically
    UPDATE public.talenta_profiles tp
    SET 
        nik = COALESCE(tp.nik, '3201010101010001'),
        phone = COALESCE(tp.phone, '081234567890')
    FROM public.users u
    WHERE tp.user_id = u.user_id
    AND u.email = 'talenta1@demo.com';
    
    -- Update all other talenta profiles with default data
    -- Generate unique NIKs using profile_id hash to avoid conflicts
    WITH numbered_profiles AS (
        SELECT 
            tp.profile_id,
            ROW_NUMBER() OVER (ORDER BY tp.profile_id) as row_num,
            -- Generate unique NIK using hash of profile_id (ensures uniqueness)
            '320101010101' || LPAD((ABS(HASHTEXT(tp.profile_id::TEXT)) % 9999)::TEXT, 4, '0') as unique_nik,
            -- Generate unique phone using row number
            '08123456789' || LPAD((ROW_NUMBER() OVER (ORDER BY tp.profile_id) % 10)::TEXT, 1, '0') as unique_phone
        FROM public.talenta_profiles tp
        JOIN public.users u ON tp.user_id = u.user_id
        WHERE u.user_type = 'TALENTA'
        AND u.email != 'talenta1@demo.com'
        AND (tp.nik IS NULL OR tp.phone IS NULL)
    ),
    -- Filter out NIKs that already exist
    safe_profiles AS (
        SELECT 
            np.profile_id,
            np.row_num,
            np.unique_phone,
            -- If generated NIK exists, use a different one based on row_num
            CASE 
                WHEN EXISTS (SELECT 1 FROM public.talenta_profiles tp2 WHERE tp2.nik = np.unique_nik AND tp2.profile_id != np.profile_id)
                THEN '320101010101' || LPAD((2000 + np.row_num)::TEXT, 4, '0')
                ELSE np.unique_nik
            END as safe_nik
        FROM numbered_profiles np
    )
    UPDATE public.talenta_profiles tp
    SET 
        nik = COALESCE(tp.nik, sp.safe_nik),
        phone = COALESCE(tp.phone, sp.unique_phone)
    FROM safe_profiles sp
    WHERE tp.profile_id = sp.profile_id;
    
    RAISE NOTICE 'Updated Talenta profiles with complete data';

    -- ============================================================================
    -- UPDATE INDUSTRI PROFILES (especially industri1@demo.com)
    -- ============================================================================
    -- Note: industri_profiles table only has profile_id, user_id, created_at, updated_at
    -- Company name is stored in users.full_name, so we ensure the profile exists
    -- and update the user's full_name if needed
    
    -- Ensure industri1@demo.com has correct full_name
    UPDATE public.users u
    SET 
        full_name = COALESCE(u.full_name, 'PT Teknologi Maju')
    WHERE u.email = 'industri1@demo.com'
    AND u.user_type = 'INDUSTRI';
    
    -- Ensure all other industri users have full_name set
    UPDATE public.users u
    SET 
        full_name = COALESCE(u.full_name, 'Company Name')
    WHERE u.user_type = 'INDUSTRI'
    AND u.email != 'industri1@demo.com'
    AND u.full_name IS NULL;
    
    -- Ensure all industri users have profiles
    INSERT INTO public.industri_profiles (user_id)
    SELECT u.user_id
    FROM public.users u
    WHERE u.user_type = 'INDUSTRI'
    AND NOT EXISTS (
        SELECT 1 FROM public.industri_profiles ip WHERE ip.user_id = u.user_id
    )
    ON CONFLICT (user_id) DO NOTHING;
    
    RAISE NOTICE 'Updated Industri profiles with complete data';

    -- ============================================================================
    -- SUMMARY
    -- ============================================================================
    RAISE NOTICE '';
    RAISE NOTICE '✅ All profiles updated with complete data!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Profile Summary:';
    RAISE NOTICE '  - Mitra Profiles: %', (SELECT COUNT(*) FROM public.mitra_profiles);
    RAISE NOTICE '  - Talenta Profiles: %', (SELECT COUNT(*) FROM public.talenta_profiles);
    RAISE NOTICE '  - Industri Profiles: %', (SELECT COUNT(*) FROM public.industri_profiles);
    RAISE NOTICE '';
    RAISE NOTICE '🔍 Verify mitra1@demo.com:';
    RAISE NOTICE '  Organization: %', (SELECT organization_name FROM public.mitra_profiles mp JOIN public.users u ON mp.user_id = u.user_id WHERE u.email = 'mitra1@demo.com' LIMIT 1);
    RAISE NOTICE '  LPK License: %', (SELECT lpk_license_number FROM public.mitra_profiles mp JOIN public.users u ON mp.user_id = u.user_id WHERE u.email = 'mitra1@demo.com' LIMIT 1);
    RAISE NOTICE '  BNSP: %', (SELECT bnsp_accreditation_number FROM public.mitra_profiles mp JOIN public.users u ON mp.user_id = u.user_id WHERE u.email = 'mitra1@demo.com' LIMIT 1);
END $$;
