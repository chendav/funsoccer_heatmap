import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_BASE = process.env.BACKEND_API_BASE || 'http://47.239.73.57';
// For now, disable mock data to test real backend connection
const USE_MOCK_DATA = false; // process.env.NODE_ENV === 'production' && !process.env.BACKEND_API_BASE;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Proxying match-session start request:', body);
    
    // Use mock data in production if backend is not accessible
    if (USE_MOCK_DATA) {
      console.log('Using mock data for match-session start');
      // Generate a mock session ID
      const sessionId = `mock_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await new Promise(resolve => setTimeout(resolve, 800));
      return NextResponse.json({
        success: true,
        data: {
          success: true,
          session_id: sessionId,
          match_id: `mock_match_${Date.now()}`,
          user_id: body.user_id,
          status: "active",
          message: "比赛会话已创建，准备开始拍照",
          created_at: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      });
    }
    
    const response = await fetch(`${BACKEND_API_BASE}/match-session/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log('Backend match-session response:', { status: response.status, data });
    
    if (!response.ok) {
      console.error('Backend match-session error:', data);
      return NextResponse.json(
        { error: data.message || data.detail || 'Failed to start match session' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Start match session error:', error);
    return NextResponse.json(
      { error: `Proxy error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}