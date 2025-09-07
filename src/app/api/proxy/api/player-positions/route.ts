import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_BASE || 'http://47.239.73.57:8000';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    
    const response = await fetch(`${BACKEND_URL}/api/player-positions${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // 返回模拟数据
      return NextResponse.json({
        success: true,
        data: {
          positions: [],
          count: 0,
          device_id: searchParams.get('device_id'),
          timestamp: new Date().toISOString()
        }
      });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Player positions proxy error:', error);
    // 返回空数据而不是错误
    return NextResponse.json({
      success: true,
      data: {
        positions: [],
        count: 0,
        timestamp: new Date().toISOString()
      }
    });
  }
}