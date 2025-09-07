import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_BASE || 'http://47.239.73.57:8000';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    
    const response = await fetch(`${BACKEND_URL}/api/heatmap/optimized${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // 返回模拟热力图数据
      return NextResponse.json({
        success: true,
        data: {
          heatmap_data: [],
          metadata: {
            device_id: searchParams.get('device_id'),
            total_points: 0,
            generated_at: new Date().toISOString()
          }
        }
      });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Heatmap proxy error:', error);
    // 返回空热力图数据
    return NextResponse.json({
      success: true,
      data: {
        heatmap_data: [],
        metadata: {
          total_points: 0,
          generated_at: new Date().toISOString()
        }
      }
    });
  }
}