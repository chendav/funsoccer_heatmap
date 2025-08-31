import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_BASE = process.env.BACKEND_API_BASE || 'http://47.239.73.57:8000';
const USE_MOCK_DATA = process.env.NODE_ENV === 'production' && !process.env.BACKEND_API_BASE;

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
      
      // Generate SVG placeholder image with football field
      const svgContent = `
        <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grass" patternUnits="userSpaceOnUse" width="20" height="20">
              <rect width="20" height="20" fill="#4ade80"/>
              <rect width="20" height="20" fill="#22c55e" opacity="0.3"/>
            </pattern>
          </defs>
          
          <!-- Football field background -->
          <rect width="400" height="300" fill="url(#grass)"/>
          
          <!-- Field markings -->
          <rect x="20" y="20" width="360" height="260" fill="none" stroke="white" stroke-width="3"/>
          <rect x="50" y="80" width="80" height="140" fill="none" stroke="white" stroke-width="2"/>
          <rect x="270" y="80" width="80" height="140" fill="none" stroke="white" stroke-2"/>
          <line x1="200" y1="20" x2="200" y2="280" stroke="white" stroke-width="2"/>
          <circle cx="200" cy="150" r="50" fill="none" stroke="white" stroke-width="2"/>
          <circle cx="200" cy="150" r="3" fill="white"/>
          
          <!-- Mock players -->
          <circle cx="120" cy="100" r="8" fill="#ef4444"/>
          <circle cx="280" cy="200" r="8" fill="#3b82f6"/>
          <circle cx="150" cy="180" r="8" fill="#ef4444"/>
          <circle cx="250" cy="120" r="8" fill="#3b82f6"/>
          
          <!-- Demo text -->
          <text x="200" y="40" text-anchor="middle" fill="white" font-size="16" font-weight="bold">
            📸 DEMO PHOTO - ${filename}
          </text>
          <text x="200" y="270" text-anchor="middle" fill="white" font-size="12">
            Click on a player to claim identity
          </text>
        </svg>
      `;
      
      const mockImageData = Buffer.from(svgContent);
      
      return new NextResponse(mockImageData, {
        status: 200,
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }
    
    const response = await fetch(`${BACKEND_API_BASE}/photo/thumbnail/${filename}`, {
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