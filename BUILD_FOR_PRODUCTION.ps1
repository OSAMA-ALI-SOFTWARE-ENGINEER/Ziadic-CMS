# Kukaqka Production Build Script
# This script prepares your project for Hostinger deployment

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Kukaqka Production Build Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Admin Backend Build
Write-Host "Step 1: Building Admin Backend..." -ForegroundColor Yellow

Set-Location admin

# Check if .env.production exists
if (-not (Test-Path ".env.production")) {
    Write-Host "ERROR: .env.production file not found!" -ForegroundColor Red
    Write-Host "Please create admin/.env.production first with your database credentials" -ForegroundColor Red
    exit 1
}

# Generate APP_KEY if not already set
$envContent = Get-Content ".env.production"
if ($envContent -match "APP_KEY=base64:GENERATE_THIS") {
    Write-Host "Generating APP_KEY..." -ForegroundColor Cyan
    $appKey = php artisan key:generate --env=production --show
    $envContent = $envContent -replace "APP_KEY=base64:GENERATE_THIS_LOCALLY_FIRST", "APP_KEY=$appKey"
    Set-Content ".env.production" $envContent
    Write-Host "✓ APP_KEY generated: $appKey" -ForegroundColor Green
}

Write-Host "✓ Admin backend prepared" -ForegroundColor Green
Write-Host ""

# Step 2: Admin Frontend Build
Write-Host "Step 2: Building Admin Frontend..." -ForegroundColor Yellow

# Check Node.js
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: npm not found. Please install Node.js" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "Installing npm dependencies..." -ForegroundColor Cyan
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: npm install failed" -ForegroundColor Red
    exit 1
}

# Build for production
Write-Host "Building for production..." -ForegroundColor Cyan
$env:VITE_API_URL = "https://admin.kukaqka.com/api/v1/admin"
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Build failed" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Admin frontend built successfully" -ForegroundColor Green
Write-Host "  Output: admin/dist/" -ForegroundColor Green
Write-Host ""

# Step 3: Public Frontend Build
Write-Host "Step 3: Building Public Frontend..." -ForegroundColor Yellow

Set-Location ..\frontend

# Check if package.json exists
if (-not (Test-Path "package.json")) {
    Write-Host "⚠ Frontend package.json not found, skipping..." -ForegroundColor Yellow
} else {
    # Install dependencies
    Write-Host "Installing npm dependencies..." -ForegroundColor Cyan
    npm install

    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: npm install failed" -ForegroundColor Red
        exit 1
    }

    # Build for production
    Write-Host "Building for production..." -ForegroundColor Cyan
    npm run build

    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Build failed" -ForegroundColor Red
        exit 1
    }

    Write-Host "✓ Frontend built successfully" -ForegroundColor Green
    Write-Host "  Output: frontend/dist/" -ForegroundColor Green
}

Write-Host ""

# Step 4: Generate Deployment Summary
Set-Location ..\

Write-Host "Step 4: Generating Deployment Summary..." -ForegroundColor Yellow

$summary = @"
================================
BUILD COMPLETE - DEPLOYMENT READY
================================

Your project has been successfully built for production!

📁 BUILD OUTPUTS:
  1. Admin Panel: admin/dist/
     - Upload to: /public_html/admin/public/admin/

  2. Frontend: frontend/dist/
     - Upload to: /public_html/

  3. Admin Backend: admin/
     - Upload to: /public_html/admin/
     - EXCLUDE: node_modules/, .env (create fresh on server)

🔧 NEXT STEPS:

1. UPDATE PRODUCTION ENVIRONMENT:

   ✓ Update admin/.env.production with:
     - Database credentials
     - Email (SMTP) settings
     - Other sensitive data

   Don't commit this file to git!

2. PREPARE FOR UPLOAD:

   You need to upload TWO separate locations:

   A) ADMIN SUBDOMAIN (admin.kukaqka.com):
      Files to upload:
      - admin/ (entire folder except node_modules)
      - admin/dist/ → goes to: public/admin/
      - Upload admin/.env.production as: public/.env

   B) MAIN DOMAIN (kukaqka.com):
      Files to upload:
      - frontend/dist/* → goes to: public_html/
      - Create .htaccess in public_html/ (see guide)

3. ON HOSTINGER SERVER (via SSH):

   cd ~/public_html/admin

   # Install dependencies
   composer install --no-dev --optimize-autoloader

   # Setup database
   php artisan migrate --force

   # Cache everything
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache

   # Set permissions
   chmod -R 755 .
   chmod -R 777 storage bootstrap/cache

4. TEST DEPLOYMENT:

   - API: https://admin.kukaqka.com/api/v1/health
   - Admin: https://admin.kukaqka.com/
   - Frontend: https://kukaqka.com/

📖 FULL GUIDE:
   See: DEPLOYMENT_GUIDE.md for complete step-by-step instructions

🚀 READY TO DEPLOY!

"@

Write-Host $summary -ForegroundColor Green

# Save summary to file
$summary | Out-File -FilePath "DEPLOYMENT_SUMMARY.txt" -Encoding UTF8

Write-Host "Summary saved to: DEPLOYMENT_SUMMARY.txt" -ForegroundColor Cyan
