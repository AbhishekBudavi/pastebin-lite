
import { initializeSchema } from './schema.js';
import { query, closePool } from './pool.js';

async function migrate() {
  try {
    console.log('🔄 Running migrations...');
    
    await query('SELECT 1');
    console.log('Database connected');
    
    await initializeSchema();
    console.log('Schema initialized');
    
    console.log('\nMigrations completed successfully!');
    await closePool();
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    await closePool();
    process.exit(1);
  }
}

migrate();
