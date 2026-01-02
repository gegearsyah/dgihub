# DGIHub Platform

> Indonesia's Comprehensive Vocational Training Platform

[![License](https://img.shields.io/badge/license-Proprietary-red.svg)](LICENSE)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/postgresql-15+-blue.svg)](https://www.postgresql.org/)

## 🎯 Overview

DGIHub is a multi-tenant platform connecting **Government**, **Training Providers (LPKs)**, and **Employers** through verifiable credentials, skill-based matching, and automated tax incentive management.

### Key Features

- 🎓 **Digital Learning Hub** - Browse, enroll, and complete training programs
- 🏆 **Verifiable Credentials** - Open Badges 3.0 compliant certificates
- 🔍 **Talent Matching** - Skill and certificate-based talent search
- 💰 **Tax Incentive Automation** - 200% Super Tax Deduction (PMK 128/2019)
- 🔐 **UU PDP Compliant** - Full compliance with Indonesia's data protection law
- 🌐 **International Recognition** - SKKNI to AQRF mapping for ASEAN mobility

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- npm or yarn

### Installation

```bash
# Clone repository
git clone <repository-url>
cd DGIHub

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Run setup script
chmod +x scripts/setup.sh
./scripts/setup.sh

# Run database migrations
npm run db:migrate

# Seed sample data
npm run db:seed

# Start backend development server
npm run dev

# In a separate terminal, start frontend
cd frontend
npm install
npm run dev
```

### Docker (Recommended)

```bash
# Start all services
docker-compose up -d

# Run migrations
docker-compose exec api npm run db:migrate

# Seed data
docker-compose exec api npm run db:seed
```

## 📚 Documentation

- **[Quick Start Guide](QUICK_START.md)** - Get started in 5 minutes
- **[API Documentation](API_DOCUMENTATION.md)** - Complete API reference
- **[Pitch Deck](PITCH_DECK.md)** - Business presentation
- **[Deployment Guide](DEPLOYMENT.md)** - Production deployment

### Detailed Documentation

- **Architecture**: `docs/architecture/`
- **Security**: `docs/security/`
- **Compliance**: `docs/compliance/`
- **Workflows**: `docs/workflows/`
- **Data Engineering**: `docs/data-engineering/`

## 🏗️ Architecture

### Technology Stack

- **Frontend**: Next.js 16 (React 19) with TypeScript
- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL 15
- **ORM**: Drizzle / Prisma
- **Security**: AWS CloudHSM, KMS
- **Cloud**: AWS (Jakarta Region)
- **Container**: Docker + ECS Fargate

### Standards Compliance

- ✅ W3C Verifiable Credentials
- ✅ Open Badges 3.0
- ✅ xAPI (Experience API)
- ✅ UU PDP Law No. 27/2022
- ✅ ISO 27001
- ✅ AQRF (ASEAN Qualifications)

## 📊 Platform Tracks

### 1. Talenta (Learners)
- Browse and enroll in courses
- Track learning progress
- Earn verifiable certificates
- Apply for jobs
- Build lifelong learning passport

### 2. Mitra (Training Providers)
- Create and manage courses
- Upload training materials
- Manage participants
- Issue certificates
- Track accreditation

### 3. Industri (Employers)
- Search for talent
- Verify credentials
- Manage recruitment
- Track tax incentives
- Build talent pool

## 🔐 Security Features

- **Encryption**: End-to-end encryption (TLS 1.3, at-rest)
- **HSM**: CloudHSM for digital signatures
- **Access Control**: Role-based with tenant isolation
- **Audit Logging**: Comprehensive PII access logging
- **Compliance**: UU PDP Law, ISO 27001

## 📈 Roadmap

### Phase 1: Alpha (Weeks 1-12) ✅
- Core infrastructure
- Basic credentialing
- Learner portal MVP

### Phase 2: Beta (Weeks 13-20)
- SIPLatih integration
- Provider portal
- Enhanced features

### Phase 3: V1 (Weeks 21-32)
- Tax incentive system
- Employer portal
- Production launch

### Phase 4: V2 (Weeks 33-48)
- International expansion
- LinkedIn/Europass integration
- Mobile apps

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test
npm test -- auth.test.js
```

## 📦 Project Structure

```
DGIHub/
├── api/                    # API implementation
│   ├── config/            # Configuration
│   ├── middleware/       # Express middleware
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   └── utils/             # Utilities
├── frontend/              # Next.js frontend application
│   ├── src/
│   │   ├── app/          # Next.js app router pages
│   │   ├── contexts/     # React contexts (Auth, etc.)
│   │   └── lib/          # Utilities and API client
│   └── package.json
├── database/              # Database schemas
│   └── schema/           # DDL, Drizzle, Prisma
├── docs/                 # Documentation
├── scripts/              # Setup scripts
├── server.js             # Main entry point
└── package.json          # Backend dependencies
```

## 🔑 Demo Accounts

After seeding, use these accounts:

| Type | Email | Password |
|------|-------|----------|
| Talenta | `talenta@demo.com` | `password123` |
| Mitra | `mitra@demo.com` | `password123` |
| Industri | `industri@demo.com` | `password123` |

## 📝 API Examples

### Register User

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "fullName": "John Doe",
    "userType": "TALENTA",
    "nik": "3201010101010001"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "talenta@demo.com",
    "password": "password123"
  }'
```

### Get Courses (Authenticated)

```bash
TOKEN="your-jwt-token"
curl http://localhost:3000/api/v1/talenta/learning-hub \
  -H "Authorization: Bearer $TOKEN"
```

## 🛠️ Development

### Environment Setup

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env`
3. Configure database credentials
4. Run migrations: `npm run db:migrate`
5. Seed data: `npm run db:seed`
6. Start dev server: `npm run dev`

### Code Style

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## 📄 License

Proprietary - All rights reserved

## 🤝 Contributing

This is a proprietary project. For contributions, please contact the development team.

## 📞 Support

- **Documentation**: See `docs/` folder
- **API Docs**: See `API_DOCUMENTATION.md`
- **Issues**: Contact development team

## 🎯 Status

**Current Version**: 1.0.0 MVP  
**Status**: Ready for Demo and Pitch  
**Next Milestone**: Beta Release with SIPLatih Integration

---

**Built with ❤️ for Indonesia's Future Workforce**
