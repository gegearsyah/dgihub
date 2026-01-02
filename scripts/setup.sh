#!/bin/bash

# DGIHub Platform Setup Script
# This script sets up the development environment

set -e

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║           DGIHub Platform Setup                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check Node.js version
echo "Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18 or higher is required. Current version: $(node -v)"
    exit 1
fi
echo "✅ Node.js version: $(node -v)"

# Check PostgreSQL
echo "Checking PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL not found. Please install PostgreSQL 15+"
    echo "   Visit: https://www.postgresql.org/download/"
else
    echo "✅ PostgreSQL found: $(psql --version)"
fi

# Install dependencies
echo ""
echo "Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please update .env with your configuration"
fi

# Create logs directory
mkdir -p logs

# Create uploads directory
mkdir -p uploads

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your database and API credentials"
echo "2. Run database migrations: npm run db:migrate"
echo "3. Seed sample data: npm run db:seed"
echo "4. Start development server: npm run dev"
echo ""


