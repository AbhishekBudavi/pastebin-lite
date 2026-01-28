import { NextResponse } from 'next/server';
import {
  generatePasteId,
  parseTTL,
  parseViewLimit,
  calculateExpiryTime,
  validateContent,
} from '@/lib/utils/helpers';
import { createPaste } from '@/lib/db/operations';


export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { content, ttl, view_limit } = await request.json();

    if (!validateContent(content)) {
      return NextResponse.json(
        {
          error: 'Bad request',
          message: 'Content is required and cannot be empty',
        },
        { status: 400 }
      );
    }

    const testNow = request.headers.get('X-Test-Now');
    
    const ttlSeconds = parseTTL(ttl);
    const viewLimit = parseViewLimit(view_limit);
    const pasteId = generatePasteId();
    const expiresAt = calculateExpiryTime(ttlSeconds, testNow);

    const result = await createPaste(pasteId, content, expiresAt, viewLimit);

 
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    
    if (!baseUrl) {
  
      if (process.env.VERCEL_URL) {
        const protocol = process.env.VERCEL_ENV === 'production' ? 'https' : 'https';
        baseUrl = `${protocol}://${process.env.VERCEL_URL}`;
      }
  
      else if (request.url) {
        try {
          const requestUrl = new URL(request.url);
          baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
        } catch (e) {
          baseUrl = 'http://localhost:3000';
        }
      }
 
      else {
        const origin = request.headers.get('origin');
        const xForwardedProto = request.headers.get('x-forwarded-proto');
        const xForwardedHost = request.headers.get('x-forwarded-host');
        
        if (origin) {
          baseUrl = origin;
        } else if (xForwardedProto && xForwardedHost) {
          baseUrl = `${xForwardedProto}://${xForwardedHost}`;
        } else {
          baseUrl = 'http://localhost:3000';
        }
      }
    }
    
    const pasteUrl = `${baseUrl}/paste/${result.id}`;
    

    console.log('🔗 Generated paste URL:', {
      baseUrl,
      pasteUrl,
      vercelUrl: process.env.VERCEL_URL,
      nextPublicUrl: process.env.NEXT_PUBLIC_APP_URL,
      environment: process.env.VERCEL_ENV || 'local',
    });

    return NextResponse.json(
      {
        id: result.id,
        url: pasteUrl,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Error creating paste:', err);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to create paste',
      },
      { status: 500 }
    );
  }
}
