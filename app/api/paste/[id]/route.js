import { NextResponse } from 'next/server';
import { getPaste, decrementViews } from '@/lib/db/operations';

// Mark route as dynamic - cannot be cached/prerendered
export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    // First check if paste exists and is not expired/exhausted
    const paste = await getPaste(id);

    if (!paste) {
      return NextResponse.json(
        {
          error: 'Not found',
          message: 'The requested paste does not exist or has expired',
        },
        { status: 404 }
      );
    }

    // Decrement views if there's a view limit
    if (paste.views_remaining !== null) {
      const decremented = await decrementViews(id);
      
      if (!decremented) {
        // Views were exhausted before we could decrement
        return NextResponse.json(
          {
            error: 'Not found',
            message: 'The requested paste does not exist or has expired',
          },
          { status: 404 }
        );
      }

      // Fetch updated paste to get new remaining views count
      const updatedPaste = await getPaste(id);
      if (updatedPaste) {
        paste.views_remaining = updatedPaste.views_remaining;
      }
    }

    return NextResponse.json({
      id: paste.id,
      content: paste.content,
      remaining_views: paste.views_remaining,
      expires_at: paste.expires_at,
    });
  } catch (err) {
    console.error('Error fetching paste:', err);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to fetch paste',
      },
      { status: 500 }
    );
  }
}
