const { pool } = require('../api/config/database');

async function checkTables() {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('\n📊 Existing tables in database:');
    if (result.rows.length === 0) {
      console.log('   ❌ No tables found!');
    } else {
      result.rows.forEach(row => {
        console.log(`   ✓ ${row.table_name}`);
      });
    }
    
    const usersExists = result.rows.some(r => r.table_name === 'users');
    console.log(`\n✅ Users table exists: ${usersExists}`);
    
    if (!usersExists) {
      console.log('\n⚠️  Tables not created. Run: npm run db:migrate');
    }
  } finally {
    client.release();
    await pool.end();
  }
}

checkTables().catch(console.error);






