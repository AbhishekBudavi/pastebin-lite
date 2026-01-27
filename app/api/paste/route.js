import { NextResponse } from 'next/server';
import {
  generatePasteId,
  parseTTL,
  parseViewLimit,
  calculateExpiryTime,
  validateContent,
} from '@/lib/utils/helpers';
import { createPaste } from '@/lib/db/operations';

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

    // Support deterministic time for testing via header
    const testNow = request.headers.get('X-Test-Now');
    
    const ttlSeconds = parseTTL(ttl);
    const viewLimit = parseViewLimit(view_limit);
    const pasteId = generatePasteId();
    const expiresAt = calculateExpiryTime(ttlSeconds, testNow);

    const result = await createPaste(pasteId, content, expiresAt, viewLimit);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const pasteUrl = `${baseUrl}/paste/${result.id}`;

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
