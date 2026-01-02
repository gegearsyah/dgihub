# DGIHub Platform - Pitch Deck

## Executive Summary

**DGIHub** is Indonesia's comprehensive vocational training platform connecting Government, Training Providers (LPKs), and Employers through verifiable credentials, skill-based matching, and tax incentive management.

---

## 🎯 Problem Statement

### Current Challenges

1. **Fragmented Training Ecosystem**
   - Training providers operate in silos
   - No unified credential system
   - Difficult to verify skills and competencies

2. **Employer-Talent Mismatch**
   - Employers struggle to find qualified candidates
   - No standardized skill verification
   - Limited visibility into candidate competencies

3. **Compliance Complexity**
   - Complex tax deduction processes (PMK 128/2019)
   - Manual verification and reporting
   - Lack of automated compliance tracking

4. **International Recognition**
   - Indonesian credentials not recognized internationally
   - No mapping to ASEAN Qualifications Reference Framework (AQRF)
   - Limited cross-border mobility

---

## 💡 Solution: DGIHub Platform

### Three-Track Ecosystem

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Talenta   │────▶│    Mitra    │────▶│  Industri   │
│  (Learners) │     │  (Training  │     │ (Employers) │
│             │     │  Providers) │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
      │                    │                    │
      └────────────────────┴────────────────────┘
                    │
            Verifiable Credentials
            (Open Badges 3.0)
```

### Key Features

#### 1. **Digital Learning Hub** 🎓
- Browse and enroll in courses
- Track learning progress
- Earn verifiable certificates
- GPS-based attendance for workshops

#### 2. **Credential Management** 🏆
- Open Badges 3.0 compliant
- SKKNI to AQRF mapping
- Blockchain-anchored for non-repudiation
- Automatic profile updates

#### 3. **Talent Matching** 🔍
- Skill-based search
- Certificate verification
- AQRF level filtering
- Talent pool management

#### 4. **Tax Incentive Automation** 💰
- 200% Super Tax Deduction (PMK 128/2019)
- Automated verification
- Training cost tracking
- Compliance reporting

---

## 🏗️ Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL 15
- **ORM**: Drizzle / Prisma
- **Authentication**: JWT

### Security
- **HSM**: AWS CloudHSM for digital signatures
- **Encryption**: AES-256 (KMS/HSM)
- **Compliance**: UU PDP Law No. 27/2022
- **Standards**: ISO 27001

### Infrastructure
- **Cloud**: AWS Jakarta Region
- **Compute**: ECS Fargate
- **Storage**: S3 (encrypted)
- **CDN**: CloudFront

### Standards
- **Credentials**: W3C Verifiable Credentials
- **Badges**: Open Badges 3.0
- **Learning**: xAPI (Experience API)
- **Framework**: AQRF (ASEAN Qualifications)

---

## 📊 Market Opportunity

### Indonesia Vocational Training Market

- **Market Size**: $2.5B+ annually
- **Training Providers**: 5,000+ LPKs
- **Annual Graduates**: 500,000+
- **Employers**: 50,000+ companies eligible for tax incentives

### Target Users

| Segment | Size | Value Proposition |
|---------|------|-------------------|
| **Talenta** | 500K+ learners | Free access, verifiable credentials, job matching |
| **Mitra** | 5,000+ LPKs | Credential issuance, participant management |
| **Industri** | 50K+ companies | Talent search, tax savings (200% deduction) |

---

## 💼 Business Model

### Revenue Streams

1. **Subscription Fees** (Mitra)
   - Course listing fees
   - Premium features
   - Analytics dashboard

2. **Transaction Fees**
   - Course enrollment commissions
   - Payment processing
   - Certificate issuance fees

3. **Enterprise Services** (Industri)
   - Talent search subscriptions
   - Custom integrations
   - Compliance reporting tools

4. **Government Contracts**
   - Platform licensing
   - Integration services
   - Training and support

### Projected Revenue (Year 1)

- **Mitra Subscriptions**: 1,000 LPKs × $100/month = $1.2M
- **Transaction Fees**: 50,000 enrollments × $10 = $500K
- **Enterprise**: 500 companies × $500/month = $3M
- **Total Year 1**: ~$4.7M

---

## 🎯 Competitive Advantages

### 1. **First-Mover Advantage**
- First comprehensive platform in Indonesia
- Government partnership (SIPLatih integration)
- Early market entry

### 2. **Compliance Built-In**
- UU PDP Law compliance
- PMK 128/2019 tax deduction automation
- ISO 27001 security standards

### 3. **International Recognition**
- AQRF mapping for ASEAN mobility
- W3C Verifiable Credentials
- Europass integration

### 4. **Technology Leadership**
- Blockchain-anchored credentials
- HSM-based security
- Modern, scalable architecture

---

## 📈 Growth Strategy

### Phase 1: Foundation (Months 1-3)
- ✅ Core platform development
- ✅ Beta testing with 10 LPKs
- ✅ Government partnership

### Phase 2: Expansion (Months 4-6)
- 📈 100 LPKs onboarded
- 📈 10,000 learners registered
- 📈 100 employers using platform

### Phase 3: Scale (Months 7-12)
- 🚀 1,000 LPKs
- 🚀 100,000 learners
- 🚀 1,000 employers
- 🚀 International expansion (Southeast Asia)

---

## 🔐 Security & Compliance

### UU PDP Law Compliance
- ✅ Privacy by Design
- ✅ Consent management
- ✅ 72-hour breach notification
- ✅ Data subject rights

### Security Features
- ✅ End-to-end encryption
- ✅ HSM for digital signatures
- ✅ Multi-factor authentication
- ✅ Comprehensive audit logging

### Certifications
- 🎯 ISO 27001 (in progress)
- 🎯 W3C Verifiable Credentials
- 🎯 Open Badges 3.0

---

## 🚀 Demo Highlights

### Live Demo Scenarios

1. **Learner Journey**
   - Register with NIK
   - Browse and enroll in course
   - Complete training
   - Receive verifiable certificate
   - Apply for job with certificate

2. **Training Provider Journey**
   - Create course with materials
   - Manage participants
   - Issue certificates
   - Track completion rates

3. **Employer Journey**
   - Search for talent by skills/certificates
   - Review candidate profiles
   - Verify credentials
   - Save to talent pool
   - Track tax incentives

---

## 📞 Investment Ask

### Funding Requirements

**Seed Round: $500K**

- **Development**: $200K (40%)
- **Marketing**: $150K (30%)
- **Operations**: $100K (20%)
- **Reserve**: $50K (10%)

### Use of Funds

1. **Team Expansion**
   - 2 Backend Engineers
   - 2 Frontend Engineers
   - 1 DevOps Engineer
   - 1 UI/UX Designer

2. **Infrastructure**
   - AWS cloud setup
   - HSM configuration
   - Security audit

3. **Partnerships**
   - Government relations
   - LPK onboarding
   - Employer outreach

---

## 🎯 Success Metrics

### 6-Month Targets

- ✅ 100 LPKs onboarded
- ✅ 10,000 learners registered
- ✅ 100 employers using platform
- ✅ 5,000 certificates issued
- ✅ $500K in transaction volume

### 12-Month Targets

- 🎯 1,000 LPKs
- 🎯 100,000 learners
- 🎯 1,000 employers
- 🎯 50,000 certificates
- 🎯 $5M in transaction volume

---

## 🤝 Partnerships

### Strategic Partners

1. **Government**
   - Ministry of Manpower (SIPLatih)
   - Ministry of Finance (Tax incentives)
   - BKN (SKKNI standards)

2. **Training Providers**
   - LPK associations
   - Vocational schools
   - Industry training centers

3. **Technology Partners**
   - AWS (Infrastructure)
   - Payment gateways (GoPay, LinkAja, OVO)
   - Blockchain networks (Polygon)

---

## 📱 Platform Preview

### Key Screens

1. **Learner Dashboard**
   - Active courses
   - Certificates earned
   - Job applications
   - Learning progress

2. **Provider Dashboard**
   - Course management
   - Participant tracking
   - Certificate issuance
   - Revenue analytics

3. **Employer Dashboard**
   - Talent search
   - Application management
   - Tax incentive tracking
   - Talent pool

---

## 🏆 Why Now?

### Market Timing

1. **Regulatory Support**
   - UU PDP Law enforcement
   - PMK 128/2019 tax incentives
   - Government digitalization push

2. **Technology Readiness**
   - Blockchain maturity
   - Cloud infrastructure
   - Mobile adoption

3. **Market Demand**
   - Skills gap in Indonesia
   - Need for verified credentials
   - Employer demand for qualified talent

---

## 📞 Contact & Next Steps

### Get Started

1. **Request Demo**: See the platform in action
2. **Pilot Program**: Join our beta testing
3. **Partnership**: Explore integration opportunities

### Contact Information

- **Website**: https://dgihub.go.id
- **Email**: info@dgihub.go.id
- **Documentation**: See `docs/` folder

---

## 🎯 Call to Action

**Join Indonesia's Vocational Revolution**

- For **Learners**: Build your lifelong learning passport
- For **Training Providers**: Expand your reach, automate compliance
- For **Employers**: Find qualified talent, maximize tax savings
- For **Investors**: Be part of Indonesia's digital transformation

---

**Built with ❤️ for Indonesia's Future Workforce**


