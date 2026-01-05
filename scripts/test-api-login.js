const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3000/api/v1';

async function testLogin(email, password) {
  try {
    console.log(`\n🔐 Testing login for: ${email}`);
    
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password
    }, {
      validateStatus: () => true // Don't throw on error status
    });

    if (response.status === 200 && response.data.success) {
      console.log('✅ Login successful!');
      console.log(`   Token: ${response.data.data.token.substring(0, 20)}...`);
      console.log(`   User: ${response.data.data.user.fullName}`);
      console.log(`   Type: ${response.data.data.user.userType}`);
      return true;
    } else {
      console.log('❌ Login failed!');
      console.log(`   Status: ${response.status}`);
      console.log(`   Message: ${response.data.message || 'Unknown error'}`);
      if (response.data.errors) {
        console.log(`   Errors:`, response.data.errors);
      }
      return false;
    }
  } catch (error) {
    console.log('❌ Request failed!');
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Message: ${error.response.data?.message || error.message}`);
    } else if (error.request) {
      console.log('   No response received. Is the server running?');
      console.log(`   URL: ${API_URL}/auth/login`);
    } else {
      console.log(`   Error: ${error.message}`);
    }
    return false;
  }
}

async function runTests() {
  console.log('🧪 Testing Login API\n');
  console.log(`API URL: ${API_URL}\n`);

  const testAccounts = [
    { email: 'talenta1@demo.com', password: 'password123', type: 'Talenta' },
    { email: 'mitra1@demo.com', password: 'password123', type: 'Mitra' },
    { email: 'industri1@demo.com', password: 'password123', type: 'Industri' }
  ];

  let successCount = 0;
  for (const account of testAccounts) {
    const success = await testLogin(account.email, account.password);
    if (success) successCount++;
  }

  console.log(`\n📊 Results: ${successCount}/${testAccounts.length} successful`);
  
  if (successCount === 0) {
    console.log('\n💡 Make sure:');
    console.log('   1. Server is running: npm start or npm run dev');
    console.log('   2. Database is seeded: npm run db:seed');
    console.log('   3. API_URL is correct (default: http://localhost:3000/api/v1)');
  }
}

runTests().catch(console.error);



