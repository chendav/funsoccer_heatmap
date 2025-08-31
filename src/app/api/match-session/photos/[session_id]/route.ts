import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_BASE = process.env.BACKEND_API_BASE || 'http://47.239.73.57:8000';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ session_id: string }> }
) {
  try {
    const { session_id } = await context.params;
    
    if (!session_id) {
      return NextResponse.json(
        { error: 'session_id parameter is required' },
        { status: 400 }
      );
    }
    
    console.log('Proxying get session photos request:', { session_id, targetUrl: `${BACKEND_API_BASE}/photo/session/${session_id}` });
    
    const response = await fetch(`${BACKEND_API_BASE}/photo/session/${session_id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    console.log('Backend photos response:', { status: response.status, photoCount: data?.data?.photos_count });
    
    if (!response.ok) {
      console.error('Backend photos error:', data);
      return NextResponse.json(
        { error: data.message || data.detail || 'Failed to get session photos' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Get session photos error:', error);
    return NextResponse.json(
      { error: `Proxy error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}