#!/bin/bash
# Project Setup Script (for reference)
# This documents the steps to get the project running

echo "🚀 Pastebin-Lite Setup Guide"
echo "=============================="
echo ""

# Step 1: Install PostgreSQL
echo "Step 1: Install PostgreSQL"
echo "  macOS:   brew install postgresql && brew services start postgresql"
echo "  Linux:   sudo apt-get install postgresql && sudo service postgresql start"
echo "  Windows: Download from https://www.postgresql.org/download/windows/"
echo ""

# Step 2: Create Database
echo "Step 2: Create Database"
echo "  psql -U postgres -c \"CREATE DATABASE pastebin_lite;\""
echo ""

# Step 3: Start Backend
echo "Step 3: Start Backend"
echo "  cd backend"
echo "  npm install"
echo "  npm run dev"
echo ""

# Step 4: Test
echo "Step 4: Test It"
echo "  curl -X POST http://localhost:3001/api/paste \\"
echo "    -H \"Content-Type: application/json\" \\"
echo "    -d '{\"content\": \"Hello World\"}'"
echo ""

# Step 5: Run Tests
echo "Step 5: Run Tests"
echo "  npm test"
echo ""

# Step 6: Frontend (Optional)
echo "Step 6: Start Frontend (Optional)"
echo "  cd ../frontend"
echo "  npm install"
echo "  npm run dev"
echo ""

echo "✨ Project is ready! Visit http://localhost:3000 for the UI"
