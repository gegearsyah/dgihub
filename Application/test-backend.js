/**
 * Backend API Test Script
 * Tests all API endpoints on Vercel deployment
 * 
 * Usage: node test-backend.js
 */

const BASE_URL = process.env.TEST_URL || 'https://vocatio-test.vercel.app';

async function testEndpoint(method, path, body = null) {
  const url = `${BASE_URL}${path}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({ text: await response.text() }));
    
    return {
      status: response.status,
      statusText: response.statusText,
      data,
      success: response.ok
    };
  } catch (error) {
    return {
      status: 'ERROR',
      error: error.message,
      success: false
    };
  }
}

async function runTests() {
  console.log('🧪 Testing Backend API Endpoints\n');
  console.log(`Base URL: ${BASE_URL}\n`);
  console.log('='.repeat(60));

  // Test 1: Simple GET test route
  console.log('\n1️⃣  Testing GET /api/test');
  const test1 = await testEndpoint('GET', '/api/test');
  console.log(`   Status: ${test1.status} ${test1.statusText || ''}`);
  console.log(`   Response:`, JSON.stringify(test1.data, null, 2));
  console.log(`   ✅ ${test1.success ? 'PASS' : 'FAIL'}`);

  // Test 2: Health check
  console.log('\n2️⃣  Testing GET /api/v1/health');
  const test2 = await testEndpoint('GET', '/api/v1/health');
  console.log(`   Status: ${test2.status} ${test2.statusText || ''}`);
  console.log(`   Response:`, JSON.stringify(test2.data, null, 2));
  console.log(`   ✅ ${test2.success ? 'PASS' : 'FAIL'}`);

  // Test 3: POST test route
  console.log('\n3️⃣  Testing POST /api/test');
  const test3 = await testEndpoint('POST', '/api/test', { test: true });
  console.log(`   Status: ${test3.status} ${test3.statusText || ''}`);
  console.log(`   Response:`, JSON.stringify(test3.data, null, 2));
  console.log(`   ✅ ${test3.success ? 'PASS' : 'FAIL'}`);

  // Test 4: Login endpoint (should return 400/401 for invalid credentials)
  console.log('\n4️⃣  Testing POST /api/v1/auth/login');
  const test4 = await testEndpoint('POST', '/api/v1/auth/login', {
    email: 'test@example.com',
    password: 'test123'
  });
  console.log(`   Status: ${test4.status} ${test4.statusText || ''}`);
  console.log(`   Response:`, JSON.stringify(test4.data, null, 2));
  console.log(`   ✅ ${test4.status === 400 || test4.status === 401 ? 'PASS (Expected error)' : test4.success ? 'PASS' : 'FAIL'}`);

  // Test 5: Register endpoint (should return 400 for invalid data)
  console.log('\n5️⃣  Testing POST /api/v1/auth/register');
  const test5 = await testEndpoint('POST', '/api/v1/auth/register', {
    email: 'test@example.com',
    password: 'test123',
    fullName: 'Test User',
    userType: 'TALENTA'
  });
  console.log(`   Status: ${test5.status} ${test5.statusText || ''}`);
  console.log(`   Response:`, JSON.stringify(test5.data, null, 2));
  console.log(`   ✅ ${test5.status === 400 || test5.status === 409 ? 'PASS (Expected error)' : test5.success ? 'PASS' : 'FAIL'}`);

  // Test 6: OPTIONS preflight
  console.log('\n6️⃣  Testing OPTIONS /api/v1/auth/login');
  const test6 = await testEndpoint('OPTIONS', '/api/v1/auth/login');
  console.log(`   Status: ${test6.status} ${test6.statusText || ''}`);
  console.log(`   ✅ ${test6.status === 200 || test6.status === 204 ? 'PASS' : 'FAIL'}`);

  console.log('\n' + '='.repeat(60));
  console.log('\n✅ Backend API Testing Complete!\n');
}

runTests().catch(console.error);
