import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_BASE || 'http://47.239.73.57:8000';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    
    const response = await fetch(`${BACKEND_URL}/api/v1/devices/nearby${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Return mock data if backend is unavailable
      return NextResponse.json({
        success: true,
        devices: [],
        total: 0,
        message: 'No devices available'
      });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Devices nearby proxy error:', error);
    // Return empty list instead of error
    return NextResponse.json({
      success: true,
      devices: [],
      total: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}