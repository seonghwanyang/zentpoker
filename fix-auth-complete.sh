#!/bin/bash

# ================================================
# Complete Authentication Fix Script
# ================================================
# This script fixes all authentication issues
# ================================================

echo "🔧 Starting complete authentication fix..."

# Step 1: Clear all browser data
echo "📋 Step 1: Please clear your browser data"
echo "   - Open Chrome DevTools (F12)"
echo "   - Go to Application tab"
echo "   - Click 'Clear site data'"
echo ""
read -p "Press Enter after clearing browser data..."

# Step 2: Stop the development server
echo "🛑 Step 2: Stopping development server..."
pkill -f "next dev" || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

# Step 3: Clear Next.js cache
echo "🗑️ Step 3: Clearing Next.js cache..."
rm -rf .next
rm -rf node_modules/.cache

# Step 4: Apply database migration
echo "📊 Step 4: Database migration"
echo "   Please run the following SQL script in your Supabase dashboard:"
echo "   File: fix-database-migration.sql"
echo ""
echo "   Key changes:"
echo "   - Updates all 'USER' roles to 'MEMBER'"
echo "   - Removes NextAuth tables"
echo "   - Sets up auto-sync with Supabase auth"
echo ""
read -p "Press Enter after running the SQL migration..."

# Step 5: Restart the development server
echo "🚀 Step 5: Starting development server..."
npm run dev &

echo ""
echo "✅ Fix complete! Please test the following:"
echo "   1. Go to http://localhost:3001"
echo "   2. Click Login"
echo "   3. Sign in with Google"
echo "   4. Verify you can access Dashboard"
echo "   5. Refresh the page - you should stay logged in"
echo ""
echo "🎉 Authentication should now work correctly!"