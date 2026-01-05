const { pool } = require('../api/config/database');
const bcrypt = require('bcryptjs');

async function testLogin() {
  const client = await pool.connect();
  try {
    // Check a user
    const result = await client.query(
      `SELECT user_id, email, password_hash, full_name, user_type, status, email_verified
       FROM users WHERE email = $1`,
      ['talenta1@demo.com']
    );

    if (result.rows.length === 0) {
      console.log('❌ User not found!');
      return;
    }

    const user = result.rows[0];
    console.log('\n📋 User Details:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Status: ${user.status}`);
    console.log(`   Email Verified: ${user.email_verified}`);
    console.log(`   User Type: ${user.user_type}`);
    console.log(`   Password Hash: ${user.password_hash.substring(0, 20)}...`);

    // Test password
    const testPassword = 'password123';
    const isValid = await bcrypt.compare(testPassword, user.password_hash);
    console.log(`\n🔐 Password Test: ${isValid ? '✅ Valid' : '❌ Invalid'}`);

    // Check if status allows login
    const canLogin = user.status === 'ACTIVE' || user.status === 'VERIFIED';
    console.log(`\n🚪 Can Login: ${canLogin ? '✅ Yes' : '❌ No (status: ' + user.status + ')'}`);

    if (!canLogin) {
      console.log('\n💡 Fix: Update user status to ACTIVE or VERIFIED');
      await client.query(
        `UPDATE users SET status = 'ACTIVE', email_verified = TRUE WHERE email = $1`,
        ['talenta1@demo.com']
      );
      console.log('✅ Updated user status to ACTIVE');
    }

  } finally {
    client.release();
    await pool.end();
  }
}

testLogin().catch(console.error);



