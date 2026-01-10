# Backend API Test Script for PowerShell
# Tests all API endpoints on Vercel deployment

$BASE_URL = "https://vocatio-test.vercel.app"

Write-Host "🧪 Testing Backend API Endpoints" -ForegroundColor Cyan
Write-Host ""
Write-Host "Base URL: $BASE_URL"
Write-Host ("=" * 60)

# Test 1: Simple GET test route
Write-Host "`n1️⃣  Testing GET /api/test" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/test" -Method GET -UseBasicParsing
    Write-Host "   Status: $($response.StatusCode) $($response.StatusDescription)" -ForegroundColor Green
    Write-Host "   Response: $($response.Content)"
    Write-Host "   ✅ PASS" -ForegroundColor Green
} catch {
    Write-Host "   Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   ❌ FAIL" -ForegroundColor Red
}

# Test 2: Health check
Write-Host "`n2️⃣  Testing GET /api/v1/health" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/v1/health" -Method GET -UseBasicParsing
    Write-Host "   Status: $($response.StatusCode) $($response.StatusDescription)" -ForegroundColor Green
    Write-Host "   Response: $($response.Content)"
    Write-Host "   ✅ PASS" -ForegroundColor Green
} catch {
    Write-Host "   Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   ❌ FAIL" -ForegroundColor Red
}

# Test 3: POST test route
Write-Host "`n3️⃣  Testing POST /api/test" -ForegroundColor Yellow
try {
    $body = @{ test = $true } | ConvertTo-Json
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/test" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
    Write-Host "   Status: $($response.StatusCode) $($response.StatusDescription)" -ForegroundColor Green
    Write-Host "   Response: $($response.Content)"
    Write-Host "   ✅ PASS" -ForegroundColor Green
} catch {
    Write-Host "   Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   ❌ FAIL" -ForegroundColor Red
}

# Test 4: Login endpoint
Write-Host "`n4️⃣  Testing POST /api/v1/auth/login" -ForegroundColor Yellow
try {
    $body = @{
        email = "test@example.com"
        password = "test123"
    } | ConvertTo-Json
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/v1/auth/login" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
    Write-Host "   Status: $($response.StatusCode) $($response.StatusDescription)" -ForegroundColor Green
    Write-Host "   Response: $($response.Content)"
    Write-Host "   ✅ PASS" -ForegroundColor Green
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "   Status: $statusCode" -ForegroundColor $(if ($statusCode -eq 400 -or $statusCode -eq 401) { "Yellow" } else { "Red" })
    Write-Host "   Response: $($_.Exception.Response)" -ForegroundColor $(if ($statusCode -eq 400 -or $statusCode -eq 401) { "Yellow" } else { "Red" })
    if ($statusCode -eq 400 -or $statusCode -eq 401) {
        Write-Host "   ✅ PASS (Expected error for invalid credentials)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ FAIL" -ForegroundColor Red
    }
}

# Test 5: Register endpoint
Write-Host "`n5️⃣  Testing POST /api/v1/auth/register" -ForegroundColor Yellow
try {
    $body = @{
        email = "test@example.com"
        password = "test123"
        fullName = "Test User"
        userType = "TALENTA"
    } | ConvertTo-Json
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/v1/auth/register" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
    Write-Host "   Status: $($response.StatusCode) $($response.StatusDescription)" -ForegroundColor Green
    Write-Host "   Response: $($response.Content)"
    Write-Host "   ✅ PASS" -ForegroundColor Green
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "   Status: $statusCode" -ForegroundColor $(if ($statusCode -eq 400 -or $statusCode -eq 409) { "Yellow" } else { "Red" })
    if ($statusCode -eq 400 -or $statusCode -eq 409) {
        Write-Host "   ✅ PASS (Expected error for existing/invalid data)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ FAIL" -ForegroundColor Red
    }
}

Write-Host "`n" + ("=" * 60)
Write-Host "`n✅ Backend API Testing Complete!`n" -ForegroundColor Cyan
