/**
 * Supabase Seed Script
 * Populates Supabase database with comprehensive interconnected data
 * 
 * Usage:
 *   node scripts/seed-supabase.js
 * 
 * Make sure you have:
 *   - NEXT_PUBLIC_SUPABASE_URL in .env.local
 *   - SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase credentials!');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const DEFAULT_PASSWORD = 'password123';
const hashedPassword = bcrypt.hashSync(DEFAULT_PASSWORD, 10);

// Store created IDs for relationships
const userIds = {
  talenta: [],
  mitra: [],
  industri: []
};

const profileIds = {
  talenta: [],
  mitra: [],
  industri: []
};

const courseIds = [];
const jobIds = [];

async function seedDatabase() {
  console.log('🌱 Starting Supabase database seeding...\n');

  try {
    // ============================================================================
    // 1. CREATE USERS
    // ============================================================================
    console.log('👥 Creating users...');

    const users = [
      // Talenta Users
      { email: 'talenta1@demo.com', fullName: 'Budi Santoso', userType: 'TALENTA', status: 'ACTIVE' },
      { email: 'talenta2@demo.com', fullName: 'Siti Nurhaliza', userType: 'TALENTA', status: 'ACTIVE' },
      { email: 'talenta3@demo.com', fullName: 'Ahmad Fauzi', userType: 'TALENTA', status: 'ACTIVE' },
      { email: 'talenta4@demo.com', fullName: 'Dewi Sartika', userType: 'TALENTA', status: 'VERIFIED' },
      { email: 'talenta5@demo.com', fullName: 'Rizki Pratama', userType: 'TALENTA', status: 'ACTIVE' },
      
      // Mitra Users
      { email: 'mitra1@demo.com', fullName: 'LPK Teknologi Indonesia', userType: 'MITRA', status: 'ACTIVE' },
      { email: 'mitra2@demo.com', fullName: 'LPK Cloud Solutions', userType: 'MITRA', status: 'ACTIVE' },
      { email: 'mitra3@demo.com', fullName: 'LPK Digital Skills Academy', userType: 'MITRA', status: 'ACTIVE' },
      
      // Industri Users
      { email: 'industri1@demo.com', fullName: 'PT Teknologi Maju', userType: 'INDUSTRI', status: 'ACTIVE' },
      { email: 'industri2@demo.com', fullName: 'PT Digital Innovation', userType: 'INDUSTRI', status: 'ACTIVE' },
      { email: 'industri3@demo.com', fullName: 'PT Smart Solutions', userType: 'INDUSTRI', status: 'ACTIVE' }
    ];

    for (const userData of users) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('user_id')
        .eq('email', userData.email)
        .single();

      if (existingUser) {
        console.log(`  ⏭️  User ${userData.email} already exists, skipping...`);
        userIds[userData.userType.toLowerCase()].push(existingUser.user_id);
        continue;
      }

      const { data: user, error } = await supabase
        .from('users')
        .insert({
          email: userData.email,
          password_hash: hashedPassword,
          full_name: userData.fullName,
          user_type: userData.userType,
          status: userData.status,
          email_verified: true,
          profile_complete: userData.userType !== 'TALENTA' || userData.status === 'ACTIVE'
        })
        .select('user_id')
        .single();

      if (error) {
        console.error(`  ❌ Error creating user ${userData.email}:`, error.message);
        continue;
      }

      console.log(`  ✅ Created user: ${userData.email}`);
      userIds[userData.userType.toLowerCase()].push(user.user_id);
    }

    // ============================================================================
    // 2. CREATE PROFILES
    // ============================================================================
    console.log('\n📋 Creating profiles...');

    // Talenta Profiles
    const talentaProfiles = [
      { email: 'talenta1@demo.com', nik: '3201010101010001', phone: '081234567890', city: 'Jakarta', province: 'DKI Jakarta', skills: ['JavaScript', 'React', 'Node.js', 'TypeScript'], aqrfLevel: 4 },
      { email: 'talenta2@demo.com', nik: '3201010101010002', phone: '081234567891', city: 'Bandung', province: 'Jawa Barat', skills: ['Python', 'Django', 'PostgreSQL', 'Docker'], aqrfLevel: 5 },
      { email: 'talenta3@demo.com', nik: '3201010101010003', phone: '081234567892', city: 'Surabaya', province: 'Jawa Timur', skills: ['Java', 'Spring Boot', 'MySQL', 'Kubernetes'], aqrfLevel: 3 },
      { email: 'talenta4@demo.com', nik: '3201010101010004', phone: '081234567893', city: 'Yogyakarta', province: 'DI Yogyakarta', skills: ['Vue.js', 'Nuxt.js', 'MongoDB', 'AWS'], aqrfLevel: 4 },
      { email: 'talenta5@demo.com', nik: '3201010101010005', phone: '081234567894', city: 'Medan', province: 'Sumatera Utara', skills: ['PHP', 'Laravel', 'MySQL', 'Linux'], aqrfLevel: 3 }
    ];

    for (let i = 0; i < talentaProfiles.length; i++) {
      const profileData = talentaProfiles[i];
      if (!userIds.talenta[i]) continue;

      const userId = userIds.talenta[i];

      const { data: existingProfile } = await supabase
        .from('talenta_profiles')
        .select('profile_id')
        .eq('user_id', userId)
        .single();

      if (existingProfile) {
        profileIds.talenta.push(existingProfile.profile_id);
        continue;
      }

      const { data: profile, error } = await supabase
        .from('talenta_profiles')
        .insert({
          user_id: userId,
          nik: profileData.nik,
          phone: profileData.phone,
          city: profileData.city,
          province: profileData.province,
          skills: profileData.skills.map(s => ({ name: s, level: 'INTERMEDIATE', verified: true })),
          aqrf_level: profileData.aqrfLevel
        })
        .select('profile_id')
        .single();

      if (error) {
        console.error(`  ❌ Error creating talenta profile for ${profileData.email}:`, error.message);
        continue;
      }

      console.log(`  ✅ Created talenta profile: ${profileData.email}`);
      profileIds.talenta.push(profile.profile_id);
    }

    // Mitra Profiles
    const mitraProfiles = [
      { email: 'mitra1@demo.com', orgName: 'LPK Teknologi Indonesia', regNumber: 'LPK-TEK-2024-001', phone: '021-12345678', city: 'Jakarta', province: 'DKI Jakarta' },
      { email: 'mitra2@demo.com', orgName: 'LPK Cloud Solutions', regNumber: 'LPK-CLOUD-2024-002', phone: '021-12345679', city: 'Bandung', province: 'Jawa Barat' },
      { email: 'mitra3@demo.com', orgName: 'LPK Digital Skills Academy', regNumber: 'LPK-DIGITAL-2024-003', phone: '021-12345680', city: 'Surabaya', province: 'Jawa Timur' }
    ];

    for (let i = 0; i < mitraProfiles.length; i++) {
      const profileData = mitraProfiles[i];
      if (!userIds.mitra[i]) continue;

      const { data: existingProfile } = await supabase
        .from('mitra_profiles')
        .select('profile_id')
        .eq('user_id', userIds.mitra[i])
        .single();

      if (existingProfile) {
        profileIds.mitra.push(existingProfile.profile_id);
        continue;
      }

      const { data: profile, error } = await supabase
        .from('mitra_profiles')
        .insert({
          user_id: userIds.mitra[i],
          organization_name: profileData.orgName,
          registration_number: profileData.regNumber,
          phone: profileData.phone,
          city: profileData.city,
          province: profileData.province,
          accreditation_status: 'ACCREDITED'
        })
        .select('profile_id')
        .single();

      if (error) {
        console.error(`  ❌ Error creating mitra profile for ${profileData.email}:`, error.message);
        continue;
      }

      console.log(`  ✅ Created mitra profile: ${profileData.email}`);
      profileIds.mitra.push(profile.profile_id);
    }

    // Industri Profiles
    const industriProfiles = [
      { email: 'industri1@demo.com', companyName: 'PT Teknologi Maju', taxId: '01.234.567.8-901.000', phone: '021-98765432', city: 'Jakarta', province: 'DKI Jakarta', sector: 'Technology' },
      { email: 'industri2@demo.com', companyName: 'PT Digital Innovation', taxId: '01.234.567.8-902.000', phone: '021-98765433', city: 'Bandung', province: 'Jawa Barat', sector: 'Software Development' },
      { email: 'industri3@demo.com', companyName: 'PT Smart Solutions', taxId: '01.234.567.8-903.000', phone: '021-98765434', city: 'Surabaya', province: 'Jawa Timur', sector: 'IT Services' }
    ];

    for (let i = 0; i < industriProfiles.length; i++) {
      const profileData = industriProfiles[i];
      if (!userIds.industri[i]) continue;

      const { data: existingProfile } = await supabase
        .from('industri_profiles')
        .select('profile_id')
        .eq('user_id', userIds.industri[i])
        .single();

      if (existingProfile) {
        profileIds.industri.push(existingProfile.profile_id);
        continue;
      }

      const { data: profile, error } = await supabase
        .from('industri_profiles')
        .insert({
          user_id: userIds.industri[i],
          company_name: profileData.companyName,
          company_tax_id: profileData.taxId,
          company_type: 'PT',
          industry_sector: profileData.sector,
          phone: profileData.phone,
          city: profileData.city,
          province: profileData.province,
          verification_status: 'VERIFIED'
        })
        .select('profile_id')
        .single();

      if (error) {
        console.error(`  ❌ Error creating industri profile for ${profileData.email}:`, error.message);
        continue;
      }

      console.log(`  ✅ Created industri profile: ${profileData.email}`);
      profileIds.industri.push(profile.profile_id);
    }

    // ============================================================================
    // 3. CREATE COURSES
    // ============================================================================
    console.log('\n📚 Creating courses...');

    const courses = [
      { mitraIndex: 0, title: 'Full Stack Web Development', description: 'Comprehensive course covering HTML, CSS, JavaScript, React, Node.js, and database management. Learn to build modern web applications from scratch.', category: 'Web Development', durationHours: 120, skkniCode: 'SKKNI-IT-2024-001' },
      { mitraIndex: 0, title: 'Cloud Computing Fundamentals', description: 'Introduction to cloud computing concepts, AWS services, and deployment strategies. Perfect for beginners.', category: 'Cloud Computing', durationHours: 80, skkniCode: 'SKKNI-IT-2024-002' },
      { mitraIndex: 0, title: 'Mobile App Development', description: 'Learn to build native and cross-platform mobile applications using React Native and Flutter.', category: 'Mobile Development', durationHours: 100, skkniCode: 'SKKNI-IT-2024-003' },
      { mitraIndex: 1, title: 'DevOps Engineering', description: 'Master CI/CD pipelines, containerization with Docker, Kubernetes orchestration, and infrastructure as code.', category: 'DevOps', durationHours: 140, skkniCode: 'SKKNI-IT-2024-004' },
      { mitraIndex: 1, title: 'Data Science & Analytics', description: 'Learn Python for data analysis, machine learning basics, and data visualization techniques.', category: 'Data Science', durationHours: 100, skkniCode: 'SKKNI-IT-2024-005' },
      { mitraIndex: 1, title: 'Cybersecurity Fundamentals', description: 'Introduction to network security, ethical hacking, and security best practices.', category: 'Cybersecurity', durationHours: 90, skkniCode: 'SKKNI-IT-2024-006' },
      { mitraIndex: 2, title: 'UI/UX Design', description: 'Learn design principles, user research, prototyping, and design tools like Figma and Adobe XD.', category: 'Design', durationHours: 80, skkniCode: 'SKKNI-IT-2024-007' },
      { mitraIndex: 2, title: 'Digital Marketing', description: 'Master SEO, social media marketing, content creation, and analytics.', category: 'Marketing', durationHours: 60, skkniCode: 'SKKNI-IT-2024-008' },
      { mitraIndex: 2, title: 'Project Management', description: 'Learn Agile, Scrum, project planning, and team management skills.', category: 'Management', durationHours: 70, skkniCode: 'SKKNI-IT-2024-009' }
    ];

    for (const courseData of courses) {
      if (!profileIds.mitra[courseData.mitraIndex]) continue;

      const { data: existingCourse } = await supabase
        .from('courses')
        .select('id')
        .eq('mitra_id', profileIds.mitra[courseData.mitraIndex])
        .eq('title', courseData.title)
        .single();

      if (existingCourse) {
        courseIds.push(existingCourse.id);
        continue;
      }

      const { data: course, error } = await supabase
        .from('courses')
        .insert({
          mitra_id: profileIds.mitra[courseData.mitraIndex],
          title: courseData.title,
          description: courseData.description,
          category: courseData.category,
          duration_hours: courseData.durationHours,
          skkni_code: courseData.skkniCode,
          status: 'PUBLISHED'
        })
        .select('id')
        .single();

      if (error) {
        console.error(`  ❌ Error creating course ${courseData.title}:`, error.message);
        continue;
      }

      console.log(`  ✅ Created course: ${courseData.title}`);
      courseIds.push(course.id);
    }

    // ============================================================================
    // 4. CREATE ENROLLMENTS
    // ============================================================================
    console.log('\n🎓 Creating enrollments...');

    const enrollments = [
      { talentaIndex: 0, courseIndex: 0, status: 'COMPLETED', daysAgo: 20 },
      { talentaIndex: 0, courseIndex: 1, status: 'ENROLLED', daysAgo: 10 },
      { talentaIndex: 0, courseIndex: 3, status: 'ENROLLED', daysAgo: 5 },
      { talentaIndex: 1, courseIndex: 4, status: 'COMPLETED', daysAgo: 15 },
      { talentaIndex: 1, courseIndex: 0, status: 'COMPLETED', daysAgo: 25 },
      { talentaIndex: 1, courseIndex: 6, status: 'ENROLLED', daysAgo: 8 },
      { talentaIndex: 2, courseIndex: 2, status: 'ENROLLED', daysAgo: 12 },
      { talentaIndex: 2, courseIndex: 5, status: 'ENROLLED', daysAgo: 6 },
      { talentaIndex: 3, courseIndex: 7, status: 'ENROLLED', daysAgo: 3 },
      { talentaIndex: 3, courseIndex: 8, status: 'ENROLLED', daysAgo: 1 },
      { talentaIndex: 4, courseIndex: 0, status: 'COMPLETED', daysAgo: 18 },
      { talentaIndex: 4, courseIndex: 3, status: 'ENROLLED', daysAgo: 7 }
    ];

    for (const enrollmentData of enrollments) {
      if (!profileIds.talenta[enrollmentData.talentaIndex] || !courseIds[enrollmentData.courseIndex]) continue;

      const enrolledAt = new Date();
      enrolledAt.setDate(enrolledAt.getDate() - enrollmentData.daysAgo);

      const completedAt = enrollmentData.status === 'COMPLETED' 
        ? new Date(enrolledAt.getTime() + 5 * 24 * 60 * 60 * 1000)
        : null;

      const { error } = await supabase
        .from('enrollments')
        .insert({
          talenta_id: profileIds.talenta[enrollmentData.talentaIndex],
          course_id: courseIds[enrollmentData.courseIndex],
          status: enrollmentData.status,
          enrolled_at: enrolledAt.toISOString(),
          completed_at: completedAt?.toISOString() || null
        });

      if (error && !error.message.includes('duplicate')) {
        console.error(`  ❌ Error creating enrollment:`, error.message);
      }
    }

    console.log(`  ✅ Created ${enrollments.length} enrollments`);

    // ============================================================================
    // 5. CREATE CERTIFICATES
    // ============================================================================
    console.log('\n🏆 Creating certificates...');

    const { data: completedEnrollments } = await supabase
      .from('enrollments')
      .select('talenta_id, course_id, completed_at')
      .eq('status', 'COMPLETED')
      .not('completed_at', 'is', null);

    let certNumber = 1;
    for (const enrollment of completedEnrollments || []) {
      const { data: course } = await supabase
        .from('courses')
        .select('mitra_id, title')
        .eq('id', enrollment.course_id)
        .single();

      if (!course) continue;

      const aqrfLevel = course.title.includes('Full Stack') ? '4' :
                       course.title.includes('Data Science') || course.title.includes('DevOps') ? '5' :
                       course.title.includes('Cloud') ? '4' : '3';

      const certificateNumber = `CERT-${new Date().getFullYear()}-${String(certNumber).padStart(6, '0')}`;
      certNumber++;

      const { error } = await supabase
        .from('certificates')
        .insert({
          talenta_id: enrollment.talenta_id,
          course_id: enrollment.course_id,
          mitra_id: course.mitra_id,
          certificate_number: certificateNumber,
          issued_date: enrollment.completed_at,
          aqrf_level: aqrfLevel
        });

      if (error && !error.message.includes('duplicate')) {
        console.error(`  ❌ Error creating certificate:`, error.message);
      }
    }

    console.log(`  ✅ Created ${certNumber - 1} certificates`);

    // ============================================================================
    // 6. CREATE JOB POSTINGS
    // ============================================================================
    console.log('\n💼 Creating job postings...');

    const jobPostings = [
      { industriIndex: 0, title: 'Senior Full Stack Developer', description: 'We are looking for an experienced Full Stack Developer to join our team. Must have experience with React, Node.js, and PostgreSQL.', location: 'Jl. Sudirman No. 123', city: 'Jakarta', province: 'DKI Jakarta', salaryMin: 15000000, salaryMax: 25000000, daysAgo: 20 },
      { industriIndex: 0, title: 'DevOps Engineer', description: 'Seeking a DevOps Engineer with experience in AWS, Docker, and Kubernetes. CI/CD pipeline experience required.', location: 'Jl. Sudirman No. 123', city: 'Jakarta', province: 'DKI Jakarta', salaryMin: 12000000, salaryMax: 20000000, daysAgo: 15 },
      { industriIndex: 1, title: 'Frontend Developer', description: 'Join our team as a Frontend Developer. Experience with React, Vue.js, or Angular required.', location: 'Jl. Dago No. 456', city: 'Bandung', province: 'Jawa Barat', salaryMin: 10000000, salaryMax: 18000000, daysAgo: 18 },
      { industriIndex: 1, title: 'Data Scientist', description: 'Looking for a Data Scientist with Python and machine learning experience. Must have portfolio of projects.', location: 'Jl. Dago No. 456', city: 'Bandung', province: 'Jawa Barat', salaryMin: 15000000, salaryMax: 25000000, daysAgo: 12 },
      { industriIndex: 2, title: 'Backend Developer', description: 'Backend Developer position with Java or Node.js experience. Microservices architecture knowledge preferred.', location: 'Jl. Pemuda No. 789', city: 'Surabaya', province: 'Jawa Timur', salaryMin: 11000000, salaryMax: 19000000, daysAgo: 10 },
      { industriIndex: 2, title: 'UI/UX Designer', description: 'Creative UI/UX Designer needed. Must be proficient in Figma and have a strong portfolio.', location: 'Jl. Pemuda No. 789', city: 'Surabaya', province: 'Jawa Timur', salaryMin: 8000000, salaryMax: 15000000, daysAgo: 8 }
    ];

    for (const jobData of jobPostings) {
      if (!profileIds.industri[jobData.industriIndex]) continue;

      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - jobData.daysAgo);

      const { data: job, error } = await supabase
        .from('job_postings')
        .insert({
          industri_id: profileIds.industri[jobData.industriIndex],
          title: jobData.title,
          description: jobData.description,
          location: jobData.location,
          city: jobData.city,
          province: jobData.province,
          salary_min: jobData.salaryMin,
          salary_max: jobData.salaryMax,
          status: 'PUBLISHED',
          created_at: createdAt.toISOString()
        })
        .select('id')
        .single();

      if (error) {
        console.error(`  ❌ Error creating job posting ${jobData.title}:`, error.message);
        continue;
      }

      console.log(`  ✅ Created job posting: ${jobData.title}`);
      jobIds.push(job.id);
    }

    // ============================================================================
    // 7. CREATE JOB APPLICATIONS
    // ============================================================================
    console.log('\n📝 Creating job applications...');

    const applications = [
      { jobIndex: 0, talentaIndex: 0, status: 'PENDING', daysAgo: 5 },
      { jobIndex: 0, talentaIndex: 1, status: 'ACCEPTED', daysAgo: 7 },
      { jobIndex: 0, talentaIndex: 4, status: 'PENDING', daysAgo: 3 },
      { jobIndex: 1, talentaIndex: 0, status: 'PENDING', daysAgo: 4 },
      { jobIndex: 1, talentaIndex: 1, status: 'REJECTED', daysAgo: 6 },
      { jobIndex: 2, talentaIndex: 1, status: 'ACCEPTED', daysAgo: 8 },
      { jobIndex: 2, talentaIndex: 3, status: 'PENDING', daysAgo: 2 },
      { jobIndex: 3, talentaIndex: 1, status: 'PENDING', daysAgo: 5 },
      { jobIndex: 4, talentaIndex: 2, status: 'PENDING', daysAgo: 4 },
      { jobIndex: 4, talentaIndex: 4, status: 'PENDING', daysAgo: 1 },
      { jobIndex: 5, talentaIndex: 3, status: 'PENDING', daysAgo: 3 }
    ];

    for (const appData of applications) {
      if (!jobIds[appData.jobIndex] || !profileIds.talenta[appData.talentaIndex]) continue;

      const appliedAt = new Date();
      appliedAt.setDate(appliedAt.getDate() - appData.daysAgo);

      const reviewedAt = appData.status !== 'PENDING' 
        ? new Date(appliedAt.getTime() + 2 * 24 * 60 * 60 * 1000)
        : null;

      const { error } = await supabase
        .from('job_applications')
        .insert({
          job_id: jobIds[appData.jobIndex],
          talenta_id: profileIds.talenta[appData.talentaIndex],
          status: appData.status,
          applied_at: appliedAt.toISOString(),
          reviewed_at: reviewedAt?.toISOString() || null
        });

      if (error && !error.message.includes('duplicate')) {
        console.error(`  ❌ Error creating application:`, error.message);
      }
    }

    console.log(`  ✅ Created ${applications.length} job applications`);

    // ============================================================================
    // SUMMARY
    // ============================================================================
    console.log('\n✅ Seed data created successfully!\n');
    console.log('📊 Summary:');
    
    const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { count: courseCount } = await supabase.from('courses').select('*', { count: 'exact', head: true });
    const { count: enrollmentCount } = await supabase.from('enrollments').select('*', { count: 'exact', head: true });
    const { count: certCount } = await supabase.from('certificates').select('*', { count: 'exact', head: true });
    const { count: jobCount } = await supabase.from('job_postings').select('*', { count: 'exact', head: true });
    const { count: appCount } = await supabase.from('job_applications').select('*', { count: 'exact', head: true });

    console.log(`  - Users: ${userCount}`);
    console.log(`  - Courses: ${courseCount}`);
    console.log(`  - Enrollments: ${enrollmentCount}`);
    console.log(`  - Certificates: ${certCount}`);
    console.log(`  - Job Postings: ${jobCount}`);
    console.log(`  - Job Applications: ${appCount}`);
    console.log('\n🔑 Demo Accounts (password: password123):');
    console.log('  Talenta: talenta1@demo.com, talenta2@demo.com, talenta3@demo.com');
    console.log('  Mitra: mitra1@demo.com, mitra2@demo.com, mitra3@demo.com');
    console.log('  Industri: industri1@demo.com, industri2@demo.com, industri3@demo.com\n');

  } catch (error) {
    console.error('❌ Fatal error during seeding:', error);
    process.exit(1);
  }
}

seedDatabase();

