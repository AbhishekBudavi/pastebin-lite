import { NextResponse } from 'next/server';
import { query } from '@/lib/db/pool';

export async function GET(request) {
  try {
    // Support deterministic time for testing via header
    const testNow = request.headers.get('X-Test-Now');
    const timestamp = testNow ? new Date(testNow).toISOString() : new Date().toISOString();
    
    const result = await query('SELECT 1 as status');
    
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      timestamp: timestamp,
    });
  } catch (err) {
    console.error('Health check failed:', err);
    return NextResponse.json(
      {
        status: 'unhealthy',
        database: 'disconnected',
        error: err.message,
      },
      { status: 500 }
    );
  }
}
