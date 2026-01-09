# PowerShell script to test Vercel API endpoints
# Run this after deploying to verify API routes work

$baseUrl = "https://dgihub-test.vercel.app"

Write-Host "Testing Vercel API Endpoints..." -ForegroundColor Cyan
Write-Host "Base URL: $baseUrl" -ForegroundColor Yellow
Write-Host ""

# Test 1: GET /api/test
Write-Host "Test 1: GET /api/test" -ForegroundColor Green
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/test" -Method GET -UseBasicParsing
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
}
Write-Host ""

# Test 2: POST /api/test
Write-Host "Test 2: POST /api/test" -ForegroundColor Green
try {
    $body = @{ test = "data" } | ConvertTo-Json
    $response = Invoke-WebRequest -Uri "$baseUrl/api/test" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
        Write-Host "This is likely a 405 Method Not Allowed error" -ForegroundColor Yellow
        Write-Host "Check Root Directory in Vercel Dashboard!" -ForegroundColor Yellow
    }
}
Write-Host ""

# Test 3: POST /api/v1/auth/register
Write-Host "Test 3: POST /api/v1/auth/register" -ForegroundColor Green
try {
    $registerBody = @{
        email = "test$(Get-Random)@example.com"
        password = "test1234"
        fullName = "Test User"
        userType = "TALENTA"
    } | ConvertTo-Json
    $response = Invoke-WebRequest -Uri "$baseUrl/api/v1/auth/register" -Method POST -Body $registerBody -ContentType "application/json" -UseBasicParsing
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
        if ($_.Exception.Response.StatusCode.value__ -eq 405) {
            Write-Host "405 Method Not Allowed - Check Vercel configuration!" -ForegroundColor Yellow
        }
    }
}
Write-Host ""

Write-Host "Testing complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "If you see 405 errors:" -ForegroundColor Yellow
Write-Host "1. Check Root Directory in Vercel Dashboard (must be empty)" -ForegroundColor Yellow
Write-Host "2. Disable Vercel Authentication" -ForegroundColor Yellow
Write-Host "3. Clear Build Cache and Redeploy" -ForegroundColor Yellow

