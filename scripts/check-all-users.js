const { pool } = require('../api/config/database');
const bcrypt = require('bcryptjs');

async function checkAllUsers() {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT email, status, email_verified, user_type 
       FROM users 
       ORDER BY user_type, email`
    );

    console.log('\n📋 All Users in Database:\n');
    
    const issues = [];
    
    result.rows.forEach((user, index) => {
      const canLogin = user.status === 'ACTIVE' || user.status === 'VERIFIED';
      const statusIcon = canLogin ? '✅' : '❌';
      
      console.log(`${statusIcon} ${user.email}`);
      console.log(`   Type: ${user.user_type}`);
      console.log(`   Status: ${user.status}`);
      console.log(`   Email Verified: ${user.email_verified}`);
      console.log(`   Can Login: ${canLogin ? 'Yes' : 'No'}`);
      console.log('');
      
      if (!canLogin) {
        issues.push(user.email);
      }
    });

    if (issues.length > 0) {
      console.log(`\n⚠️  Found ${issues.length} users that cannot login:`);
      issues.forEach(email => console.log(`   - ${email}`));
      console.log('\n💡 Fixing user statuses...\n');
      
      for (const email of issues) {
        await client.query(
          `UPDATE users 
           SET status = 'ACTIVE', email_verified = TRUE 
           WHERE email = $1`,
          [email]
        );
        console.log(`✅ Fixed ${email}`);
      }
    } else {
      console.log('✅ All users can login!');
    }

    // Test password for first user
    if (result.rows.length > 0) {
      const firstUser = result.rows[0];
      const passwordResult = await client.query(
        'SELECT password_hash FROM users WHERE email = $1',
        [firstUser.email]
      );
      
      if (passwordResult.rows.length > 0) {
        const isValid = await bcrypt.compare('password123', passwordResult.rows[0].password_hash);
        console.log(`\n🔐 Password test for ${firstUser.email}: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
      }
    }

  } finally {
    client.release();
    await pool.end();
  }
}

checkAllUsers().catch(console.error);



