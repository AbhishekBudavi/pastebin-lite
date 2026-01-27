#!/usr/bin/env node

/**
 * Database reset script
 * ⚠️  WARNING: This deletes all data!
 * Use only for development/testing
 */

import { resetDatabase, initializeSchema } from './schema.js';
import { query, closePool } from './pool.js';

async function reset() {
  try {
    console.log('⚠️  WARNING: This will delete all pastes!');
    console.log('Use only for development/testing.\n');
    
    // Test connection
    await query('SELECT 1');
    console.log('✅ Database connected');
    
    // Reset schema
    console.log('🔄 Resetting database...');
    await resetDatabase();
    console.log('✅ Database reset');
    
    console.log('✅ Schema reinitialized');
    console.log('\n✨ Database reset completed!\n');
    
    await closePool();
    process.exit(0);
  } catch (err) {
    console.error('❌ Reset failed:', err.message);
    await closePool();
    process.exit(1);
  }
}

reset();
