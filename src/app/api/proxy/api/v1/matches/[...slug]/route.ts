import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_BASE || 'http://47.239.73.57:8000';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  try {
    const path = params.slug.join('/');
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    
    const url = `${BACKEND_URL}/api/v1/matches/${path}${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // 返回模拟数据
      if (path.includes('player-stats')) {
        return NextResponse.json({
          success: true,
          data: {
            stats: [],
            summary: {
              total_players: 0,
              total_distance: 0,
              average_speed: 0
            },
            match_id: params.slug[0],
            timestamp: new Date().toISOString()
          }
        });
      }
      
      return NextResponse.json(
        { detail: 'Match data not found' },
        { status: 404 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Matches proxy error:', error);
    
    // 返回模拟数据
    return NextResponse.json({
      success: true,
      data: {
        stats: [],
        summary: {
          total_players: 0,
          total_distance: 0,
          average_speed: 0
        },
        timestamp: new Date().toISOString()
      }
    });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  try {
    const path = params.slug.join('/');
    const body = await request.json();
    
    const response = await fetch(`${BACKEND_URL}/api/v1/matches/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { detail: errorText || 'Backend error' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Matches POST proxy error:', error);
    return NextResponse.json(
      { detail: 'Proxy error' },
      { status: 500 }
    );
  }
}