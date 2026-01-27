import { NextResponse } from 'next/server';
import { query } from '@/lib/db/pool';

export async function GET() {
  try {
    const result = await query('SELECT 1 as status');
    
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
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
