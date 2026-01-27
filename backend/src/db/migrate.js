#!/usr/bin/env node

/**
 * Database migration script
 * Run this to initialize/upgrade database schema
 */

import { initializeSchema } from './schema.js';
import { query, closePool } from './pool.js';

async function migrate() {
  try {
    console.log('🔄 Running migrations...');
    
    // Test connection
    await query('SELECT 1');
    console.log('✅ Database connected');
    
    // Initialize schema
    await initializeSchema();
    console.log('✅ Schema initialized');
    
    console.log('\n✨ Migrations completed successfully!');
    await closePool();
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    await closePool();
    process.exit(1);
  }
}

migrate();
