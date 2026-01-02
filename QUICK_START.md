# DGIHub Platform - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **PostgreSQL** 15+ ([Download](https://www.postgresql.org/download/))
- **npm** or **yarn**

### Option 1: Docker (Recommended)

```bash
# 1. Clone the repository
git clone <repository-url>
cd DGIHub

# 2. Copy environment file
cp .env.example .env

# 3. Start all services
docker-compose up -d

# 4. Run migrations
docker-compose exec api npm run db:migrate

# 5. Seed sample data
docker-compose exec api npm run db:seed

# 6. Access the API
# API: http://localhost:3000
# Health: http://localhost:3000/health
```

### Option 2: Local Development

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your database credentials

# 3. Setup database (if using setup script)
chmod +x scripts/setup.sh
./scripts/setup.sh

# 4. Run migrations
npm run db:migrate

# 5. Seed sample data
npm run db:seed

# 6. Start development server
npm run dev

# Server will start on http://localhost:3000
```

## 📋 Demo Accounts

After seeding, use these accounts to test:

| User Type | Email | Password | Description |
|-----------|-------|----------|-------------|
| **Talenta** | `talenta@demo.com` | `password123` | Learner/Student account |
| **Mitra** | `mitra@demo.com` | `password123` | Training Provider (LPK) account |
| **Industri** | `industri@demo.com` | `password123` | Employer account |

## 🧪 Test the API

### 1. Health Check

```bash
curl http://localhost:3000/health
```

### 2. Register a New User

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "password123",
    "fullName": "New User",
    "userType": "TALENTA",
    "nik": "3201010101010001"
  }'
```

### 3. Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "talenta@demo.com",
    "password": "password123"
  }'
```

### 4. Get Courses (as Talenta)

```bash
# First, login to get token
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"talenta@demo.com","password":"password123"}' | jq -r '.data.token')

# Then, get courses
curl http://localhost:3000/api/v1/talenta/learning-hub \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Create Course (as Mitra)

```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"mitra@demo.com","password":"password123"}' | jq -r '.data.token')

curl -X POST http://localhost:3000/api/v1/mitra/courses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Cloud Computing Fundamentals",
    "description": "Learn cloud computing basics",
    "durationHours": 80,
    "price": 3000000,
    "skkniCode": "SKKNI-IT-2023-002",
    "aqrfLevel": 5
  }'
```

### 6. Search Talent (as Industri)

```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"industri@demo.com","password":"password123"}' | jq -r '.data.token')

curl "http://localhost:3000/api/v1/industri/search-talenta?aqrfLevel=6&hasCertificates=true" \
  -H "Authorization: Bearer $TOKEN"
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Main Endpoints

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/verify-ekyc` - Complete e-KYC verification

#### Talenta (Learner)
- `GET /talenta/learning-hub` - Browse courses
- `POST /talenta/apply` - Apply for job
- `GET /talenta/certificates` - Get certificates

#### Mitra (Training Provider)
- `POST /mitra/courses` - Create course
- `POST /mitra/issue-certificate` - Issue certificate
- `GET /mitra/courses/:courseId/participants` - Get participants

#### Industri (Employer)
- `GET /industri/search-talenta` - Search for talent
- `GET /industri/talenta/:talentaId` - Get talent profile

## 🏗️ Project Structure

```
DGIHub/
├── api/
│   ├── config/          # Configuration files
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   └── services/        # Business logic services
├── database/
│   └── schema/          # Database schemas (PostgreSQL, Drizzle, Prisma)
├── docs/                # Documentation
├── scripts/             # Setup and utility scripts
├── server.js            # Main application entry
└── package.json         # Dependencies
```

## 🔧 Configuration

Edit `.env` file to configure:

- Database connection
- JWT secrets
- AWS credentials (for S3)
- External API keys (Dukcapil, SIPLatih, etc.)

## 🐳 Docker Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down

# Reset database
docker-compose down -v
docker-compose up -d
docker-compose exec api npm run db:migrate
docker-compose exec api npm run db:seed
```

## 📊 Database Management

```bash
# Run migrations
npm run db:migrate

# Seed sample data
npm run db:seed

# Reset database (WARNING: Deletes all data)
npm run db:reset
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📝 Next Steps

1. **Review Documentation**: Check `docs/` folder for detailed documentation
2. **Configure Environment**: Update `.env` with production values
3. **Set Up AWS**: Configure S3 bucket for file storage
4. **Set Up HSM**: Configure CloudHSM for digital signatures
5. **Deploy**: Follow deployment guide in `docs/roadmap/implementation-roadmap.md`

## 🆘 Troubleshooting

### Database Connection Error
- Check PostgreSQL is running: `pg_isready`
- Verify credentials in `.env`
- Check firewall settings

### Port Already in Use
- Change `PORT` in `.env`
- Or kill process: `lsof -ti:3000 | xargs kill`

### Migration Errors
- Ensure PostgreSQL extensions are enabled
- Check database user has CREATE privileges
- Review error messages in console

## 📞 Support

For issues or questions:
- Check documentation in `docs/` folder
- Review API error messages
- Check server logs in `logs/` directory

---

**Ready to build! 🚀**


