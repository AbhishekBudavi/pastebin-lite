import { NextResponse } from 'next/server';
import { getPaste } from '@/lib/db/operations';

// Mark route as dynamic - cannot be cached/prerendered
export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    // Support deterministic time for testing via header
    const testNow = request.headers.get('X-Test-Now');
    
    const paste = await getPaste(id, testNow);

    if (!paste) {
      return NextResponse.json(
        {
          error: 'Not found',
          message: 'The requested paste does not exist or has expired',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: paste.id,
      content: paste.content,
      remaining_views: paste.views_remaining,
      expires_at: paste.expires_at,
    });
  } catch (err) {
    console.error('Error fetching paste preview:', err);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to fetch paste',
      },
      { status: 500 }
    );
  }
}
