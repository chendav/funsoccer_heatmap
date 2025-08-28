import { NextRequest, NextResponse } from 'next/server';

const EDGE_API_BASE = 'http://10.0.0.118:8000';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params;
    
    if (!filename) {
      return NextResponse.json(
        { error: 'filename parameter is required' },
        { status: 400 }
      );
    }
    
    const response = await fetch(`${EDGE_API_BASE}/photo/thumbnail/${filename}`, {
      method: 'GET',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch image' },
        { status: response.status }
      );
    }

    // Forward the image response
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Get thumbnail error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}