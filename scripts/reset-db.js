/**
 * Reset Database Script
 * Drops and recreates all tables (USE WITH CAUTION)
 */

const { pool } = require('../api/config/database');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function resetDatabase() {
  return new Promise((resolve, reject) => {
    rl.question('⚠️  This will DELETE ALL DATA. Are you sure? (yes/no): ', async (answer) => {
      if (answer.toLowerCase() !== 'yes') {
        console.log('Operation cancelled.');
        rl.close();
        resolve();
        return;
      }

      rl.close();

      try {
        console.log('Dropping all tables...');

        // Get all table names
        const tablesResult = await pool.query(`
          SELECT tablename 
          FROM pg_tables 
          WHERE schemaname = 'public'
        `);

        const tables = tablesResult.rows.map(row => row.tablename);

        // Drop tables in reverse dependency order
        const dropOrder = [
          'workshop_attendance',
          'workshop_registrations',
          'workshop_sessions',
          'workshop',
          'pelamar',
          'talent_pool',
          'lowongan',
          'sertifikat',
          'materi',
          'kursus',
          'workshop',
          'talenta_profiles',
          'mitra_profiles',
          'industri_profiles',
          'users'
        ];

        for (const table of dropOrder) {
          if (tables.includes(table)) {
            try {
              await pool.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
              console.log(`  ✓ Dropped ${table}`);
            } catch (error) {
              console.log(`  ⚠ Could not drop ${table}: ${error.message}`);
            }
          }
        }

        // Drop extensions if they exist
        await pool.query('DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE');
        await pool.query('DROP EXTENSION IF EXISTS "pgcrypto" CASCADE');

        console.log('\n✅ Database reset complete!');
        console.log('Run: npm run db:migrate to recreate tables');
        console.log('Run: npm run db:seed to populate sample data');

        resolve();
      } catch (error) {
        console.error('❌ Reset failed:', error);
        reject(error);
      } finally {
        await pool.end();
      }
    });
  });
}

resetDatabase().catch(console.error);


