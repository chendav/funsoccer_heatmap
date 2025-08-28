import { NextRequest, NextResponse } from 'next/server';

const EDGE_API_BASE = process.env.EDGE_API_BASE || 'http://10.0.0.118:8000';
const USE_MOCK_DATA = process.env.NODE_ENV === 'production' && !process.env.EDGE_API_BASE;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await context.params;
    
    if (!filename) {
      return NextResponse.json(
        { error: 'filename parameter is required' },
        { status: 400 }
      );
    }
    
    // Use mock image in production if edge device is not accessible
    if (USE_MOCK_DATA) {
      console.log('Using mock image for thumbnail:', filename);
      
      // Generate a simple placeholder image (1x1 pixel PNG)
      const mockImageData = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 
        0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x01, 0x90, 0x00, 0x00, 0x01, 0x2C, 
        0x08, 0x02, 0x00, 0x00, 0x00, 0x53, 0xC4, 0x47, 0x65, 0x00, 0x00, 0x00, 
        0x0C, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0xF8, 0x00, 0x00, 0x00, 
        0x00, 0x01, 0x00, 0x01, 0x35, 0xA6, 0x96, 0xB7, 0x00, 0x00, 0x00, 0x00, 
        0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
      ]);
      
      return new NextResponse(mockImageData, {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=3600',
        },
      });
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