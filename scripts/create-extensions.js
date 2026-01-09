const { pool } = require('../api/config/database');

async function createExtensions() {
  const client = await pool.connect();
  try {
    console.log('Creating PostgreSQL extensions...\n');
    
    // Create uuid-ossp extension
    try {
      await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
      console.log('✅ Created uuid-ossp extension');
    } catch (error) {
      console.log('⚠️  uuid-ossp extension:', error.message);
      if (error.message.includes('permission denied')) {
        console.log('   You may need to run this as a superuser or grant permissions.');
      }
    }
    
    // Create pgcrypto extension
    try {
      await client.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
      console.log('✅ Created pgcrypto extension');
    } catch (error) {
      console.log('⚠️  pgcrypto extension:', error.message);
    }
    
    // Verify extensions
    const result = await client.query(`
      SELECT extname 
      FROM pg_extension 
      WHERE extname IN ('uuid-ossp', 'pgcrypto')
    `);
    
    console.log('\n📦 Installed extensions:');
    result.rows.forEach(row => {
      console.log(`   ✓ ${row.extname}`);
    });
    
  } finally {
    client.release();
    await pool.end();
  }
}

createExtensions().catch(console.error);






