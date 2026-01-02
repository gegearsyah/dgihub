# DGIHub Platform - Setup Instructions

## Prerequisites

Before setting up the DGIHub platform, ensure you have:

1. **Node.js 18+** installed
   - Download from: https://nodejs.org/
   - Verify: `node --version`

2. **PostgreSQL 15+** installed
   - Download from: https://www.postgresql.org/download/
   - Verify: `psql --version`

3. **npm or yarn** package manager
   - Usually comes with Node.js
   - Verify: `npm --version`

4. **Git** (optional, for version control)
   - Download from: https://git-scm.com/

## Quick Setup (5 Minutes)

### Option 1: Docker (Recommended)

```bash
# 1. Clone or navigate to project directory
cd DGIHub

# 2. Copy environment file
cp .env.example .env

# 3. Start all services (PostgreSQL, API, Redis)
docker-compose up -d

# 4. Wait for services to start (30 seconds)
# Check status: docker-compose ps

# 5. Run database migrations
docker-compose exec api npm run db:migrate

# 6. Seed sample data
docker-compose exec api npm run db:seed

# 7. Access the API
# Health check: http://localhost:3000/health
# API: http://localhost:3000/api/v1
```

### Option 2: Local Development

```bash
# 1. Navigate to project directory
cd DGIHub

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# 4. Create PostgreSQL database
createdb dgihub
# Or using psql:
# psql -U postgres
# CREATE DATABASE dgihub;

# 5. Run database migrations
npm run db:migrate

# 6. Seed sample data
npm run db:seed

# 7. Start development server
npm run dev

# Server will start on http://localhost:3000
```

## Detailed Setup

### Step 1: Install Dependencies

```bash
npm install
```

This installs all required packages:
- Express.js (web framework)
- PostgreSQL client (pg)
- JWT (authentication)
- bcryptjs (password hashing)
- And more...

### Step 2: Configure Environment

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your configuration:
   ```env
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=dgihub
   DB_USER=postgres
   DB_PASSWORD=your-password

   # JWT Secrets (generate secure random strings)
   JWT_SECRET=your-secret-key-here
   JWT_REFRESH_SECRET=your-refresh-secret-here
   ```

### Step 3: Database Setup

#### Create Database

```bash
# Using createdb command
createdb dgihub

# Or using psql
psql -U postgres
CREATE DATABASE dgihub;
\q
```

#### Run Migrations

```bash
npm run db:migrate
```

This creates all tables, indexes, and triggers.

#### Seed Sample Data

```bash
npm run db:seed
```

This creates:
- 3 demo users (Talenta, Mitra, Industri)
- Sample course
- Sample certificate
- Sample job posting

### Step 4: Start Server

#### Development Mode

```bash
npm run dev
```

Uses nodemon for auto-reload on file changes.

#### Production Mode

```bash
npm start
```

### Step 5: Verify Installation

1. **Health Check**
   ```bash
   curl http://localhost:3000/health
   ```
   Should return:
   ```json
   {
     "status": "healthy",
     "timestamp": "2024-01-15T10:00:00.000Z",
     "uptime": 123.45,
     "environment": "development"
   }
   ```

2. **API Info**
   ```bash
   curl http://localhost:3000/api/v1
   ```
   Should return API information.

3. **Test Login**
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "talenta@demo.com",
       "password": "password123"
     }'
   ```

## Troubleshooting

### Database Connection Error

**Error**: `Connection refused` or `password authentication failed`

**Solution**:
1. Verify PostgreSQL is running:
   ```bash
   # Linux/Mac
   sudo systemctl status postgresql
   
   # Windows
   # Check Services panel
   ```

2. Check credentials in `.env`:
   ```env
   DB_HOST=localhost
   DB_USER=postgres
   DB_PASSWORD=your-actual-password
   ```

3. Test connection manually:
   ```bash
   psql -U postgres -d dgihub
   ```

### Port Already in Use

**Error**: `EADDRINUSE: address already in use :::3000`

**Solution**:
1. Change port in `.env`:
   ```env
   PORT=3001
   ```

2. Or kill the process:
   ```bash
   # Find process
   lsof -ti:3000
   
   # Kill process
   kill -9 <PID>
   ```

### Migration Errors

**Error**: `relation already exists` or `permission denied`

**Solution**:
1. Reset database (WARNING: Deletes all data):
   ```bash
   npm run db:reset
   npm run db:migrate
   ```

2. Check database user permissions:
   ```sql
   GRANT ALL PRIVILEGES ON DATABASE dgihub TO postgres;
   ```

### Module Not Found

**Error**: `Cannot find module 'xxx'`

**Solution**:
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Docker Commands

### Start Services
```bash
docker-compose up -d
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
```

### Stop Services
```bash
docker-compose down
```

### Reset Everything
```bash
# Stop and remove volumes
docker-compose down -v

# Start fresh
docker-compose up -d
docker-compose exec api npm run db:migrate
docker-compose exec api npm run db:seed
```

## Development Workflow

### 1. Make Code Changes
Edit files in `api/` directory.

### 2. Test Changes
```bash
# Run tests
npm test

# Or test manually with curl/Postman
```

### 3. Check Logs
```bash
# Application logs
tail -f logs/combined.log

# Error logs
tail -f logs/error.log
```

### 4. Database Changes
```bash
# Edit schema in database/schema/postgresql/ddl.sql
# Then run migrations
npm run db:migrate
```

## Production Deployment

See `DEPLOYMENT.md` for detailed production deployment instructions.

## Getting Help

1. Check documentation in `docs/` folder
2. Review `QUICK_START.md` for quick reference
3. Check `API_DOCUMENTATION.md` for API details
4. Review error logs in `logs/` directory

---

**Ready to build! 🚀**


