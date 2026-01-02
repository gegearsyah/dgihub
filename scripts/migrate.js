/**
 * Database Migration Script
 * Runs the PostgreSQL DDL schema with proper statement handling
 */

const fs = require('fs');
const path = require('path');
const { pool } = require('../api/config/database');

async function runMigrations() {
  console.log('Starting database migrations...\n');

  const client = await pool.connect();
  
  try {
    // Don't use a single transaction - handle each statement independently
    // This allows partial success even if some statements fail

    // Read DDL file
    const ddlPath = path.join(__dirname, '../database/schema/postgresql/ddl.sql');
    let ddl = fs.readFileSync(ddlPath, 'utf8');

    // Remove comments (but preserve -- in strings)
    ddl = ddl
      .split('\n')
      .map(line => {
        const trimmed = line.trim();
        // Remove full-line comments
        if (trimmed.startsWith('--')) {
          return '';
        }
        // Remove inline comments (simple approach)
        const commentIndex = line.indexOf('--');
        if (commentIndex > 0) {
          return line.substring(0, commentIndex).trim();
        }
        return line.trim();
      })
      .filter(line => line.length > 0)
      .join('\n');

    // Split by semicolons more carefully
    const statements = [];
    let currentStatement = '';
    let inString = false;
    let stringChar = '';

    for (let i = 0; i < ddl.length; i++) {
      const char = ddl[i];
      const prevChar = i > 0 ? ddl[i - 1] : '';

      // Handle string literals
      if ((char === "'" || char === '"') && prevChar !== '\\') {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
          stringChar = '';
        }
        currentStatement += char;
        continue;
      }

      // If we're in a string, just add the character
      if (inString) {
        currentStatement += char;
        continue;
      }

      // Check for semicolon (end of statement)
      if (char === ';') {
        currentStatement += char;
        const trimmed = currentStatement.trim();
        if (trimmed.length > 5 && !trimmed.startsWith('--')) {
          statements.push(trimmed);
        }
        currentStatement = '';
        continue;
      }

      currentStatement += char;
    }

    // Add any remaining statement
    if (currentStatement.trim().length > 5) {
      statements.push(currentStatement.trim());
    }

    console.log(`Executing ${statements.length} SQL statements...\n`);

    let successCount = 0;
    let skipCount = 0;
    const errors = [];

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      
      // Skip very short statements (likely empty)
      if (!statement || statement.length < 5) {
        continue;
      }

      try {
        await client.query(statement);
        successCount++;
        
        if ((i + 1) % 20 === 0) {
          process.stdout.write(`Progress: ${i + 1}/${statements.length} statements\r`);
        }
      } catch (error) {
        // For CREATE TABLE statements, always show the error
        if (statement.toUpperCase().trim().startsWith('CREATE TABLE')) {
          console.error(`\n❌ Failed to create table on statement ${i + 1}:`);
          console.error(`   Error: ${error.message}`);
          console.error(`   Code: ${error.code}`);
          console.error(`   Statement preview: ${statement.substring(0, 200)}...`);
        }
        // Ignore "already exists" errors
        if (error.code === '42P07' || // relation already exists
            error.code === '42710' || // duplicate object
            error.code === '42723' || // function already exists
            error.code === '42883') { // function does not exist (for REPLACE)
          skipCount++;
          continue;
        }

        // For CREATE INDEX on non-existent table, try with IF NOT EXISTS
        if (error.code === '42P01' && statement.toUpperCase().includes('CREATE INDEX')) {
          try {
            // Modify to add IF NOT EXISTS
            const modified = statement.replace(
              /CREATE\s+INDEX\s+(\w+)/i,
              'CREATE INDEX IF NOT EXISTS $1'
            );
            await client.query(modified);
            successCount++;
            continue;
          } catch (retryError) {
            // If table truly doesn't exist, this is expected - log and continue
            if (retryError.code === '42P01') {
              errors.push({
                index: i + 1,
                message: retryError.message,
                statement: statement.substring(0, 100)
              });
              continue;
            }
          }
        }

        // Log other errors but don't fail
        // However, if it's a CREATE TABLE statement, we should fail
        if (statement.toUpperCase().includes('CREATE TABLE') && !statement.toUpperCase().includes('IF NOT EXISTS')) {
          console.error(`\n❌ CRITICAL: Failed to create table on statement ${i + 1}`);
          console.error(`   Error: ${error.message}`);
          console.error(`   Code: ${error.code}`);
          console.error(`   Statement: ${statement.substring(0, 200)}...`);
          errors.push({
            index: i + 1,
            message: error.message,
            code: error.code,
            statement: statement.substring(0, 150),
            critical: true
          });
        } else {
          errors.push({
            index: i + 1,
            message: error.message,
            code: error.code,
            statement: statement.substring(0, 150)
          });
        }
      }
    }

    // No COMMIT needed since we're not using a transaction

    console.log(`\n\n✅ Migration completed!`);
    console.log(`   ✅ Success: ${successCount} statements`);
    console.log(`   ⏭️  Skipped (already exists): ${skipCount} statements`);
    
    if (errors.length > 0) {
      const criticalErrors = errors.filter(e => e.critical);
      if (criticalErrors.length > 0) {
        console.log(`\n❌ CRITICAL ERRORS: ${criticalErrors.length} table creation failures!`);
        criticalErrors.forEach(err => {
          console.log(`   - Statement ${err.index}: ${err.message}`);
        });
        console.log('\n⚠️  Migration may have failed. Please check the errors above.');
      } else {
        console.log(`   ⚠️  Warnings: ${errors.length} statements had issues (non-critical)`);
        if (errors.length <= 10) {
          errors.forEach(err => {
            console.log(`      - Statement ${err.index}: ${err.message.substring(0, 80)}`);
          });
        }
      }
    }
    console.log('');

  } catch (error) {
    // No ROLLBACK needed since we're not using a transaction
    console.error('\n❌ Migration failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();


