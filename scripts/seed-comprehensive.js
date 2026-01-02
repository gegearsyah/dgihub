/**
 * Comprehensive Database Seed Script
 * Populates database with extensive dummy data for all roles
 * Includes: Users, Courses, Workshops, Certificates, Job Postings, Enrollments, etc.
 */

const { pool } = require('../api/config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const DEFAULT_PASSWORD = 'password123';
const hashedPassword = bcrypt.hashSync(DEFAULT_PASSWORD, 10);

async function seedDatabase() {
  console.log('🌱 Starting comprehensive database seeding...\n');

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // ============================================================================
    // 1. CREATE USERS FOR ALL ROLES
    // ============================================================================
    console.log('👥 Creating users for all roles...');

    const users = [
      // Talenta Users (5 users)
      {
        email: 'talenta1@demo.com',
        password: hashedPassword,
        fullName: 'John Doe',
        userType: 'TALENTA',
        status: 'ACTIVE'
      },
      {
        email: 'talenta2@demo.com',
        password: hashedPassword,
        fullName: 'Jane Smith',
        userType: 'TALENTA',
        status: 'ACTIVE'
      },
      {
        email: 'talenta3@demo.com',
        password: hashedPassword,
        fullName: 'Bob Johnson',
        userType: 'TALENTA',
        status: 'ACTIVE'
      },
      {
        email: 'talenta4@demo.com',
        password: hashedPassword,
        fullName: 'Alice Williams',
        userType: 'TALENTA',
        status: 'ACTIVE'
      },
      {
        email: 'talenta5@demo.com',
        password: hashedPassword,
        fullName: 'Charlie Brown',
        userType: 'TALENTA',
        status: 'ACTIVE'
      },
      // Mitra Users (3 users)
      {
        email: 'mitra1@demo.com',
        password: hashedPassword,
        fullName: 'LPK Teknologi Indonesia',
        userType: 'MITRA',
        status: 'ACTIVE'
      },
      {
        email: 'mitra2@demo.com',
        password: hashedPassword,
        fullName: 'LPK Cloud Solutions',
        userType: 'MITRA',
        status: 'ACTIVE'
      },
      {
        email: 'mitra3@demo.com',
        password: hashedPassword,
        fullName: 'LPK Digital Skills Academy',
        userType: 'MITRA',
        status: 'ACTIVE'
      },
      // Industri Users (3 users)
      {
        email: 'industri1@demo.com',
        password: hashedPassword,
        fullName: 'PT Teknologi Maju',
        userType: 'INDUSTRI',
        status: 'ACTIVE'
      },
      {
        email: 'industri2@demo.com',
        password: hashedPassword,
        fullName: 'PT Digital Innovation',
        userType: 'INDUSTRI',
        status: 'ACTIVE'
      },
      {
        email: 'industri3@demo.com',
        password: hashedPassword,
        fullName: 'PT Smart Solutions',
        userType: 'INDUSTRI',
        status: 'ACTIVE'
      }
    ];

    const userIds = [];
    for (const user of users) {
      const result = await client.query(
        `INSERT INTO users (email, password_hash, full_name, user_type, status, email_verified, email_verified_at)
         VALUES ($1, $2, $3, $4, $5, TRUE, CURRENT_TIMESTAMP)
         ON CONFLICT (email) DO UPDATE 
         SET status = EXCLUDED.status, email_verified = TRUE
         RETURNING user_id, email, user_type`,
        [user.email, user.password, user.fullName, user.userType, user.status]
      );
      userIds.push({
        userId: result.rows[0].user_id,
        email: result.rows[0].email,
        userType: result.rows[0].user_type
      });
    }

    console.log(`✅ Created ${userIds.length} users`);

    // ============================================================================
    // 2. CREATE TALENTA PROFILES
    // ============================================================================
    console.log('🎓 Creating Talenta profiles...');

    const talentaUsers = userIds.filter(u => u.userType === 'TALENTA');
    const talentaProfiles = [];

    const talentaData = [
      {
        nik: '3201010101010001',
        phone: '081234567890',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        skills: [
          { name: 'JavaScript', level: 'Advanced', verified: true },
          { name: 'React', level: 'Advanced', verified: true },
          { name: 'Node.js', level: 'Intermediate', verified: true },
          { name: 'Cloud Computing', level: 'Intermediate', verified: false }
        ],
        aqrfLevel: 6
      },
      {
        nik: '3201010101010002',
        phone: '081234567891',
        city: 'Bandung',
        province: 'Jawa Barat',
        skills: [
          { name: 'Python', level: 'Advanced', verified: true },
          { name: 'Django', level: 'Advanced', verified: true },
          { name: 'Data Science', level: 'Intermediate', verified: true }
        ],
        aqrfLevel: 5
      },
      {
        nik: '3201010101010003',
        phone: '081234567892',
        city: 'Surabaya',
        province: 'Jawa Timur',
        skills: [
          { name: 'Java', level: 'Advanced', verified: true },
          { name: 'Spring Boot', level: 'Advanced', verified: true },
          { name: 'Microservices', level: 'Intermediate', verified: true }
        ],
        aqrfLevel: 6
      },
      {
        nik: '3201010101010004',
        phone: '081234567893',
        city: 'Yogyakarta',
        province: 'DI Yogyakarta',
        skills: [
          { name: 'UI/UX Design', level: 'Advanced', verified: true },
          { name: 'Figma', level: 'Advanced', verified: true },
          { name: 'Adobe XD', level: 'Intermediate', verified: true }
        ],
        aqrfLevel: 4
      },
      {
        nik: '3201010101010005',
        phone: '081234567894',
        city: 'Medan',
        province: 'Sumatera Utara',
        skills: [
          { name: 'DevOps', level: 'Advanced', verified: true },
          { name: 'Docker', level: 'Advanced', verified: true },
          { name: 'Kubernetes', level: 'Intermediate', verified: true }
        ],
        aqrfLevel: 7
      }
    ];

    for (let i = 0; i < talentaUsers.length; i++) {
      const user = talentaUsers[i];
      const data = talentaData[i];
      
      const result = await client.query(
        `INSERT INTO talenta_profiles (
          user_id, nik, nik_verified, nik_verified_at, phone, city, province,
          ekyc_verified, ekyc_verified_at, skills, aqrf_level
        ) VALUES ($1, $2, TRUE, CURRENT_TIMESTAMP, $3, $4, $5, TRUE, CURRENT_TIMESTAMP, $6, $7)
        ON CONFLICT (user_id) DO UPDATE SET
          nik = EXCLUDED.nik,
          skills = EXCLUDED.skills,
          aqrf_level = EXCLUDED.aqrf_level
        RETURNING profile_id`,
        [
          user.userId,
          data.nik,
          data.phone,
          data.city,
          data.province,
          JSON.stringify(data.skills),
          data.aqrfLevel
        ]
      );
      talentaProfiles.push({
        profileId: result.rows[0].profile_id,
        userId: user.userId
      });
    }

    console.log(`✅ Created ${talentaProfiles.length} Talenta profiles`);

    // ============================================================================
    // 3. CREATE MITRA PROFILES
    // ============================================================================
    console.log('🏢 Creating Mitra profiles...');

    const mitraUsers = userIds.filter(u => u.userType === 'MITRA');
    const mitraProfiles = [];

    const mitraData = [
      {
        organizationName: 'LPK Teknologi Indonesia',
        registrationNumber: 'LPK-001-2023',
        taxId: '01.234.567.8-901.000',
        accreditationStatus: 'ACCREDITED',
        verificationStatus: 'VERIFIED'
      },
      {
        organizationName: 'LPK Cloud Solutions',
        registrationNumber: 'LPK-002-2023',
        taxId: '01.234.567.8-902.000',
        accreditationStatus: 'ACCREDITED',
        verificationStatus: 'VERIFIED'
      },
      {
        organizationName: 'LPK Digital Skills Academy',
        registrationNumber: 'LPK-003-2023',
        taxId: '01.234.567.8-903.000',
        accreditationStatus: 'ACCREDITED',
        verificationStatus: 'VERIFIED'
      }
    ];

    for (let i = 0; i < mitraUsers.length; i++) {
      const user = mitraUsers[i];
      const data = mitraData[i];
      
      const result = await client.query(
        `INSERT INTO mitra_profiles (
          user_id, organization_name, registration_number, tax_id,
          accreditation_status, verification_status
        ) VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (user_id) DO UPDATE SET
          organization_name = EXCLUDED.organization_name,
          verification_status = EXCLUDED.verification_status
        RETURNING profile_id`,
        [
          user.userId,
          data.organizationName,
          data.registrationNumber,
          data.taxId,
          data.accreditationStatus,
          data.verificationStatus
        ]
      );
      mitraProfiles.push({
        profileId: result.rows[0].profile_id,
        userId: user.userId,
        organizationName: data.organizationName
      });
    }

    console.log(`✅ Created ${mitraProfiles.length} Mitra profiles`);

    // ============================================================================
    // 4. CREATE INDUSTRI PROFILES
    // ============================================================================
    console.log('🏭 Creating Industri profiles...');

    const industriUsers = userIds.filter(u => u.userType === 'INDUSTRI');
    const industriProfiles = [];

    const industriData = [
      {
        companyName: 'PT Teknologi Maju',
        companyTaxId: '01.234.567.8-904.000',
        verificationStatus: 'VERIFIED'
      },
      {
        companyName: 'PT Digital Innovation',
        companyTaxId: '01.234.567.8-905.000',
        verificationStatus: 'VERIFIED'
      },
      {
        companyName: 'PT Smart Solutions',
        companyTaxId: '01.234.567.8-906.000',
        verificationStatus: 'VERIFIED'
      }
    ];

    for (let i = 0; i < industriUsers.length; i++) {
      const user = industriUsers[i];
      const data = industriData[i];
      
      const result = await client.query(
        `INSERT INTO industri_profiles (
          user_id, company_name, company_tax_id, verification_status
        ) VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id) DO UPDATE SET
          company_name = EXCLUDED.company_name,
          verification_status = EXCLUDED.verification_status
        RETURNING profile_id`,
        [
          user.userId,
          data.companyName,
          data.companyTaxId,
          data.verificationStatus
        ]
      );
      industriProfiles.push({
        profileId: result.rows[0].profile_id,
        userId: user.userId
      });
    }

    console.log(`✅ Created ${industriProfiles.length} Industri profiles`);

    // ============================================================================
    // 5. CREATE COURSES
    // ============================================================================
    console.log('📚 Creating courses...');

    const courses = [
      {
        mitraIndex: 0,
        title: 'Advanced Software Development',
        titleEn: 'Advanced Software Development',
        description: 'Comprehensive training in advanced software development including microservices, cloud deployment, and DevOps practices.',
        descriptionEn: 'Comprehensive training in advanced software development including microservices, cloud deployment, and DevOps practices.',
        durationHours: 120,
        durationDays: 15,
        price: 2500000,
        skkniCode: 'SKKNI-IT-2023-001',
        aqrfLevel: 6,
        status: 'PUBLISHED',
        prerequisites: JSON.stringify({
          certificates: [],
          skills: ['Basic Programming']
        }),
        learningOutcomes: JSON.stringify([
          'Design microservices architecture',
          'Deploy applications using Docker',
          'Implement CI/CD pipelines',
          'Apply cloud-native practices'
        ])
      },
      {
        mitraIndex: 0,
        title: 'Cloud Architecture Fundamentals',
        titleEn: 'Cloud Architecture Fundamentals',
        description: 'Master cloud computing concepts and AWS services for building scalable applications.',
        descriptionEn: 'Master cloud computing concepts and AWS services for building scalable applications.',
        durationHours: 80,
        durationDays: 10,
        price: 1800000,
        skkniCode: 'SKKNI-IT-2023-002',
        aqrfLevel: 5,
        status: 'PUBLISHED',
        prerequisites: JSON.stringify({
          certificates: [],
          skills: ['Basic IT Knowledge']
        }),
        learningOutcomes: JSON.stringify([
          'Understand cloud computing fundamentals',
          'Deploy applications on AWS',
          'Manage cloud infrastructure',
          'Optimize cloud costs'
        ])
      },
      {
        mitraIndex: 1,
        title: 'Data Science & Machine Learning',
        titleEn: 'Data Science & Machine Learning',
        description: 'Learn data analysis, machine learning algorithms, and AI model deployment.',
        descriptionEn: 'Learn data analysis, machine learning algorithms, and AI model deployment.',
        durationHours: 100,
        durationDays: 12,
        price: 3000000,
        skkniCode: 'SKKNI-IT-2023-003',
        aqrfLevel: 6,
        status: 'PUBLISHED',
        prerequisites: JSON.stringify({
          certificates: [],
          skills: ['Python', 'Mathematics']
        }),
        learningOutcomes: JSON.stringify([
          'Analyze data using Python',
          'Build machine learning models',
          'Deploy AI models to production',
          'Interpret model results'
        ])
      },
      {
        mitraIndex: 1,
        title: 'Full Stack Web Development',
        titleEn: 'Full Stack Web Development',
        description: 'Complete web development course covering frontend, backend, and database technologies.',
        descriptionEn: 'Complete web development course covering frontend, backend, and database technologies.',
        durationHours: 150,
        durationDays: 18,
        price: 3500000,
        skkniCode: 'SKKNI-IT-2023-004',
        aqrfLevel: 5,
        status: 'PUBLISHED',
        prerequisites: JSON.stringify({
          certificates: [],
          skills: ['HTML', 'CSS', 'JavaScript']
        }),
        learningOutcomes: JSON.stringify([
          'Build responsive web applications',
          'Create RESTful APIs',
          'Implement database design',
          'Deploy web applications'
        ])
      },
      {
        mitraIndex: 2,
        title: 'UI/UX Design Mastery',
        titleEn: 'UI/UX Design Mastery',
        description: 'Master user interface and user experience design principles and tools.',
        descriptionEn: 'Master user interface and user experience design principles and tools.',
        durationHours: 90,
        durationDays: 11,
        price: 2200000,
        skkniCode: 'SKKNI-DESIGN-2023-001',
        aqrfLevel: 4,
        status: 'PUBLISHED',
        prerequisites: JSON.stringify({
          certificates: [],
          skills: ['Basic Design Knowledge']
        }),
        learningOutcomes: JSON.stringify([
          'Design user-friendly interfaces',
          'Create wireframes and prototypes',
          'Conduct user research',
          'Apply design systems'
        ])
      },
      {
        mitraIndex: 2,
        title: 'DevOps Engineering',
        titleEn: 'DevOps Engineering',
        description: 'Learn DevOps practices including CI/CD, containerization, and infrastructure as code.',
        descriptionEn: 'Learn DevOps practices including CI/CD, containerization, and infrastructure as code.',
        durationHours: 110,
        durationDays: 14,
        price: 2800000,
        skkniCode: 'SKKNI-DEVOPS-2023-001',
        aqrfLevel: 7,
        status: 'PUBLISHED',
        prerequisites: JSON.stringify({
          certificates: ['SKKNI-IT-2023-001'],
          skills: ['Linux', 'Scripting']
        }),
        learningOutcomes: JSON.stringify([
          'Implement CI/CD pipelines',
          'Manage containerized applications',
          'Automate infrastructure',
          'Monitor and troubleshoot systems'
        ])
      }
    ];

    const courseIds = [];
    for (const course of courses) {
      const mitraId = mitraProfiles[course.mitraIndex].profileId;
      
      const result = await client.query(
        `INSERT INTO kursus (
          mitra_id, title, title_en, description, description_en,
          duration_hours, duration_days, price, skkni_code, aqrf_level,
          status, prerequisites, learning_outcomes, published_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP)
        RETURNING kursus_id`,
        [
          mitraId,
          course.title,
          course.titleEn,
          course.description,
          course.descriptionEn,
          course.durationHours,
          course.durationDays,
          course.price,
          course.skkniCode,
          course.aqrfLevel,
          course.status,
          course.prerequisites,
          course.learningOutcomes
        ]
      );
      courseIds.push(result.rows[0].kursus_id);
    }

    console.log(`✅ Created ${courseIds.length} courses`);

    // ============================================================================
    // 6. CREATE COURSE MATERIALS
    // ============================================================================
    console.log('📖 Creating course materials...');

    const materials = [
      { courseIndex: 0, title: 'Introduction to Microservices', type: 'VIDEO', order: 1 },
      { courseIndex: 0, title: 'Docker and Containerization', type: 'VIDEO', order: 2 },
      { courseIndex: 0, title: 'Architecture Patterns PDF', type: 'PDF', order: 3 },
      { courseIndex: 0, title: 'Module 1 Assessment', type: 'QUIZ', order: 4 },
      { courseIndex: 1, title: 'Cloud Computing Basics', type: 'VIDEO', order: 1 },
      { courseIndex: 1, title: 'AWS Services Overview', type: 'VIDEO', order: 2 },
      { courseIndex: 1, title: 'AWS Best Practices', type: 'PDF', order: 3 },
      { courseIndex: 2, title: 'Python for Data Science', type: 'VIDEO', order: 1 },
      { courseIndex: 2, title: 'Machine Learning Fundamentals', type: 'VIDEO', order: 2 },
      { courseIndex: 2, title: 'Model Deployment Guide', type: 'PDF', order: 3 }
    ];

    for (const material of materials) {
      await client.query(
        `INSERT INTO materi (kursus_id, title, material_type, order_index, status)
         VALUES ($1, $2, $3, $4, 'ACTIVE')
         ON CONFLICT DO NOTHING`,
        [courseIds[material.courseIndex], material.title, material.type, material.order]
      );
    }

    console.log(`✅ Created ${materials.length} course materials`);

    // ============================================================================
    // 7. CREATE ENROLLMENTS
    // ============================================================================
    console.log('📝 Creating enrollments...');

    const enrollments = [
      { talentaIndex: 0, courseIndex: 0, progress: 75, status: 'ACTIVE', paymentStatus: 'PAID' },
      { talentaIndex: 0, courseIndex: 1, progress: 45, status: 'ACTIVE', paymentStatus: 'PAID' },
      { talentaIndex: 1, courseIndex: 2, progress: 90, status: 'ACTIVE', paymentStatus: 'PAID' },
      { talentaIndex: 1, courseIndex: 3, progress: 30, status: 'ACTIVE', paymentStatus: 'PAID' },
      { talentaIndex: 2, courseIndex: 0, progress: 100, status: 'COMPLETED', paymentStatus: 'PAID' },
      { talentaIndex: 2, courseIndex: 4, progress: 60, status: 'ACTIVE', paymentStatus: 'PAID' },
      { talentaIndex: 3, courseIndex: 4, progress: 85, status: 'ACTIVE', paymentStatus: 'PAID' },
      { talentaIndex: 4, courseIndex: 5, progress: 50, status: 'ACTIVE', paymentStatus: 'PAID' }
    ];

    for (const enrollment of enrollments) {
      const talentaId = talentaProfiles[enrollment.talentaIndex].profileId;
      const kursusId = courseIds[enrollment.courseIndex];
      
      await client.query(
        `INSERT INTO enrollments (
          kursus_id, talenta_id, status, progress, payment_status, enrolled_at
        ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP - INTERVAL '${Math.floor(Math.random() * 30)} days')
        ON CONFLICT (kursus_id, talenta_id) DO UPDATE SET
          status = EXCLUDED.status,
          progress = EXCLUDED.progress`,
        [
          kursusId,
          talentaId,
          enrollment.status,
          enrollment.progress,
          enrollment.paymentStatus
        ]
      );
    }

    console.log(`✅ Created ${enrollments.length} enrollments`);

    // ============================================================================
    // 8. CREATE CERTIFICATES
    // ============================================================================
    console.log('🏆 Creating certificates...');

    const certificates = [
      { talentaIndex: 0, courseIndex: 0, mitraIndex: 0, score: 85, grade: 'A' },
      { talentaIndex: 2, courseIndex: 0, mitraIndex: 0, score: 92, grade: 'A' },
      { talentaIndex: 1, courseIndex: 2, mitraIndex: 1, score: 88, grade: 'A' },
      { talentaIndex: 3, courseIndex: 4, mitraIndex: 2, score: 90, grade: 'A' }
    ];

    for (const cert of certificates) {
      const talentaId = talentaProfiles[cert.talentaIndex].profileId;
      const mitraId = mitraProfiles[cert.mitraIndex].profileId;
      const kursusId = courseIds[cert.courseIndex];
      
      const courseResult = await client.query(
        'SELECT title, skkni_code, aqrf_level FROM kursus WHERE kursus_id = $1',
        [kursusId]
      );
      const course = courseResult.rows[0];

      const credentialId = `https://dgihub.go.id/credentials/badges/${uuidv4()}`;
      const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      const credentialJson = {
        "@context": [
          "https://www.w3.org/2018/credentials/v1",
          "https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json"
        ],
        "type": ["VerifiableCredential", "OpenBadgeCredential"],
        "id": credentialId,
        "name": course.title,
        "issuer": {
          "id": `https://dgihub.go.id/issuers/mitra-${mitraId}`,
          "type": "Profile",
          "name": mitraProfiles[cert.mitraIndex].organizationName
        },
        "issuanceDate": new Date().toISOString(),
        "credentialSubject": {
          "id": `did:key:${talentaId}`,
          "type": "AchievementSubject",
          "achievement": {
            "id": `https://dgihub.go.id/achievements/${kursusId}`,
            "type": "Achievement",
            "name": {
              "en-US": course.title,
              "id-ID": course.title
            }
          }
        }
      };

      await client.query(
        `INSERT INTO sertifikat (
          mitra_id, talenta_id, kursus_id, certificate_number, credential_id,
          credential_json, title, issued_date, skkni_code, aqrf_level,
          status, visible_to_industry, searchable
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, $8, $9, 'ACTIVE', TRUE, TRUE)
        ON CONFLICT DO NOTHING`,
        [
          mitraId,
          talentaId,
          kursusId,
          certificateNumber,
          credentialId,
          JSON.stringify(credentialJson),
          course.title,
          course.skkni_code,
          course.aqrf_level
        ]
      );
    }

    console.log(`✅ Created ${certificates.length} certificates`);

    // ============================================================================
    // 9. CREATE WORKSHOPS
    // ============================================================================
    console.log('🎪 Creating workshops...');

    const workshops = [
      {
        mitraIndex: 0,
        kursusIndex: 0,
        title: 'Hands-on React Workshop',
        description: 'Practical React development workshop with live coding sessions.',
        startDate: '2024-02-15',
        endDate: '2024-02-15',
        startTime: '09:00',
        endTime: '17:00',
        locationName: 'LPK Training Center Jakarta',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        address: 'Jl. Sudirman No. 123',
        latitude: -6.2088,
        longitude: 106.8456,
        capacity: 30,
        price: 500000,
        attendanceMethod: 'GPS',
        geofenceRadius: 100
      },
      {
        mitraIndex: 1,
        kursusIndex: 2,
        title: 'Data Science Bootcamp',
        description: 'Intensive data science workshop covering Python, pandas, and scikit-learn.',
        startDate: '2024-02-20',
        endDate: '2024-02-22',
        startTime: '08:00',
        endTime: '17:00',
        locationName: 'LPK Cloud Solutions Training Hall',
        city: 'Bandung',
        province: 'Jawa Barat',
        address: 'Jl. Dago No. 45',
        latitude: -6.9175,
        longitude: 107.6191,
        capacity: 25,
        price: 750000,
        attendanceMethod: 'GPS',
        geofenceRadius: 100
      }
    ];

    const workshopIds = [];
    for (const workshop of workshops) {
      const mitraId = mitraProfiles[workshop.mitraIndex].profileId;
      const kursusId = courseIds[workshop.kursusIndex] || null;
      
      const result = await client.query(
        `INSERT INTO workshop (
          mitra_id, kursus_id, title, description,
          start_date, end_date, start_time, end_time,
          location_name, city, province, address,
          latitude, longitude, capacity, price,
          attendance_method, geofence_radius, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, 'OPEN')
        RETURNING workshop_id`,
        [
          mitraId,
          kursusId,
          workshop.title,
          workshop.description,
          workshop.startDate,
          workshop.endDate,
          workshop.startTime,
          workshop.endTime,
          workshop.locationName,
          workshop.city,
          workshop.province,
          workshop.address,
          workshop.latitude,
          workshop.longitude,
          workshop.capacity,
          workshop.price,
          workshop.attendanceMethod,
          workshop.geofenceRadius
        ]
      );
      workshopIds.push(result.rows[0].workshop_id);
    }

    console.log(`✅ Created ${workshopIds.length} workshops`);

    // ============================================================================
    // 10. CREATE WORKSHOP REGISTRATIONS
    // ============================================================================
    console.log('📋 Creating workshop registrations...');

    const registrations = [
      { talentaIndex: 0, workshopIndex: 0, status: 'CONFIRMED', paymentStatus: 'PAID' },
      { talentaIndex: 1, workshopIndex: 0, status: 'CONFIRMED', paymentStatus: 'PAID' },
      { talentaIndex: 2, workshopIndex: 1, status: 'CONFIRMED', paymentStatus: 'PAID' }
    ];

    for (const reg of registrations) {
      const talentaId = talentaProfiles[reg.talentaIndex].profileId;
      const workshopId = workshopIds[reg.workshopIndex];
      
      await client.query(
        `INSERT INTO workshop_registrations (
          workshop_id, talenta_id, status, payment_status, registered_at
        ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
        ON CONFLICT (workshop_id, talenta_id) DO NOTHING`,
        [workshopId, talentaId, reg.status, reg.paymentStatus]
      );
    }

    console.log(`✅ Created ${registrations.length} workshop registrations`);

    // ============================================================================
    // 11. CREATE JOB POSTINGS
    // ============================================================================
    console.log('💼 Creating job postings...');

    const jobPostings = [
      {
        industriIndex: 0,
        title: 'Senior Software Engineer',
        description: 'We are looking for an experienced software engineer with expertise in microservices, cloud technologies, and modern development practices.',
        jobType: 'FULL_TIME',
        location: 'Jakarta',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        salaryMin: 15000000,
        salaryMax: 25000000,
        requirements: {
          skills: ['JavaScript', 'React', 'Node.js', 'Microservices'],
          skkniCodes: ['SKKNI-IT-2023-001'],
          aqrfLevel: 6,
          certificates: [],
          minExperience: 3
        }
      },
      {
        industriIndex: 0,
        title: 'Cloud Solutions Architect',
        description: 'Seeking a cloud architect to design and implement scalable cloud solutions.',
        jobType: 'FULL_TIME',
        location: 'Jakarta',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        salaryMin: 20000000,
        salaryMax: 35000000,
        requirements: {
          skills: ['AWS', 'Cloud Architecture', 'DevOps'],
          skkniCodes: ['SKKNI-IT-2023-002'],
          aqrfLevel: 7,
          certificates: [],
          minExperience: 5
        }
      },
      {
        industriIndex: 1,
        title: 'Data Scientist',
        description: 'Join our data science team to build machine learning models and analyze large datasets.',
        jobType: 'FULL_TIME',
        location: 'Bandung',
        city: 'Bandung',
        province: 'Jawa Barat',
        salaryMin: 18000000,
        salaryMax: 30000000,
        requirements: {
          skills: ['Python', 'Machine Learning', 'Data Science'],
          skkniCodes: ['SKKNI-IT-2023-003'],
          aqrfLevel: 6,
          certificates: [],
          minExperience: 2
        }
      },
      {
        industriIndex: 2,
        title: 'UI/UX Designer',
        description: 'We need a creative UI/UX designer to design beautiful and user-friendly interfaces.',
        jobType: 'FULL_TIME',
        location: 'Yogyakarta',
        city: 'Yogyakarta',
        province: 'DI Yogyakarta',
        salaryMin: 12000000,
        salaryMax: 20000000,
        requirements: {
          skills: ['UI/UX Design', 'Figma', 'Adobe XD'],
          skkniCodes: ['SKKNI-DESIGN-2023-001'],
          aqrfLevel: 4,
          certificates: [],
          minExperience: 2
        }
      }
    ];

    const jobIds = [];
    for (const job of jobPostings) {
      const industriId = industriProfiles[job.industriIndex].profileId;
      
      const result = await client.query(
        `INSERT INTO lowongan (
          industri_id, title, description, job_type, location, city, province,
          salary_min, salary_max, requirements, status, visible_to_talenta, published_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'PUBLISHED', TRUE, CURRENT_TIMESTAMP)
        RETURNING lowongan_id`,
        [
          industriId,
          job.title,
          job.description,
          job.jobType,
          job.location,
          job.city,
          job.province,
          job.salaryMin,
          job.salaryMax,
          JSON.stringify(job.requirements)
        ]
      );
      jobIds.push(result.rows[0].lowongan_id);
    }

    console.log(`✅ Created ${jobIds.length} job postings`);

    // ============================================================================
    // 12. CREATE JOB APPLICATIONS
    // ============================================================================
    console.log('📮 Creating job applications...');

    const applications = [
      { talentaIndex: 0, jobIndex: 0, status: 'PENDING', coverLetter: 'I am very interested in this position...' },
      { talentaIndex: 2, jobIndex: 0, status: 'PENDING', coverLetter: 'I have extensive experience in...' },
      { talentaIndex: 1, jobIndex: 2, status: 'PENDING', coverLetter: 'My background in data science...' },
      { talentaIndex: 3, jobIndex: 3, status: 'PENDING', coverLetter: 'I am passionate about design...' }
    ];

    for (const app of applications) {
      const talentaId = talentaProfiles[app.talentaIndex].profileId;
      const lowonganId = jobIds[app.jobIndex];
      
      await client.query(
        `INSERT INTO pelamar (
          lowongan_id, talenta_id, status, cover_letter, applied_at
        ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
        ON CONFLICT (lowongan_id, talenta_id) DO NOTHING`,
        [lowonganId, talentaId, app.status, app.coverLetter]
      );
    }

    console.log(`✅ Created ${applications.length} job applications`);

    await client.query('COMMIT');

    // ============================================================================
    // SUMMARY
    // ============================================================================
    console.log('\n' + '='.repeat(60));
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('\n📊 Summary:');
    console.log(`   👥 Users: ${userIds.length} (5 Talenta, 3 Mitra, 3 Industri)`);
    console.log(`   🎓 Talenta Profiles: ${talentaProfiles.length}`);
    console.log(`   🏢 Mitra Profiles: ${mitraProfiles.length}`);
    console.log(`   🏭 Industri Profiles: ${industriProfiles.length}`);
    console.log(`   📚 Courses: ${courseIds.length}`);
    console.log(`   📖 Materials: ${materials.length}`);
    console.log(`   📝 Enrollments: ${enrollments.length}`);
    console.log(`   🏆 Certificates: ${certificates.length}`);
    console.log(`   🎪 Workshops: ${workshopIds.length}`);
    console.log(`   📋 Workshop Registrations: ${registrations.length}`);
    console.log(`   💼 Job Postings: ${jobIds.length}`);
    console.log(`   📮 Job Applications: ${applications.length}`);
    
    console.log('\n🔑 Demo Accounts (Password: password123):');
    console.log('\n   TALENTA:');
    talentaUsers.forEach((u, i) => {
      console.log(`   ${i + 1}. ${u.email} - ${users.find(usr => usr.email === u.email)?.fullName}`);
    });
    console.log('\n   MITRA:');
    mitraUsers.forEach((u, i) => {
      console.log(`   ${i + 1}. ${u.email} - ${users.find(usr => usr.email === u.email)?.fullName}`);
    });
    console.log('\n   INDUSTRI:');
    industriUsers.forEach((u, i) => {
      console.log(`   ${i + 1}. ${u.email} - ${users.find(usr => usr.email === u.email)?.fullName}`);
    });
    console.log('\n');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Seeding failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run seeding
seedDatabase().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

