import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_BASE = process.env.BACKEND_API_BASE || 'http://47.239.73.57:8000';
// For now, disable mock data to test real backend connection
const USE_MOCK_DATA = false; // process.env.NODE_ENV === 'production' && !process.env.BACKEND_API_BASE;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Proxying claim-player request:', body);
    
    // Use mock data in production if backend is not accessible
    if (USE_MOCK_DATA) {
      console.log('Using mock data for claim-player');
      // Simulate successful player claim
      await new Promise(resolve => setTimeout(resolve, 1500));
      return NextResponse.json({
        success: true,
        data: {
          success: true,
          session_id: body.session_id,
          user_id: body.user_id,
          photo_id: body.photo_id,
          global_id: Math.floor(Math.random() * 100) + 1,
          click_coordinates: body.click_coordinates,
          message: "球员身份认领成功！您已绑定到全局ID。",
          binding_score: 0.95
        },
        timestamp: new Date().toISOString()
      });
    }
    
    const response = await fetch(`${BACKEND_API_BASE}/match-session/claim-player`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log('Backend claim-player response:', { status: response.status, data });
    
    if (!response.ok) {
      console.error('Backend claim-player error:', data);
      return NextResponse.json(
        { error: data.message || data.detail || 'Failed to claim player' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Claim player error:', error);
    return NextResponse.json(
      { error: `Proxy error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}