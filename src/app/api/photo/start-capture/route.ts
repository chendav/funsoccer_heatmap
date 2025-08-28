import { NextRequest, NextResponse } from 'next/server';

const EDGE_API_BASE = process.env.EDGE_API_BASE || 'http://10.0.0.118:8000';
const USE_MOCK_DATA = process.env.NODE_ENV === 'production' && !process.env.EDGE_API_BASE;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Proxying photo start-capture request:', { body, targetUrl: `${EDGE_API_BASE}/photo/start-capture`, useMock: USE_MOCK_DATA });
    
    // Use mock data in production if edge device is not accessible
    if (USE_MOCK_DATA) {
      console.log('Using mock data for photo start-capture');
      // Simulate successful response
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      return NextResponse.json({
        success: true,
        data: {
          success: true,
          task_id: body.task_id,
          session_id: body.session_id,
          message: "拍照任务已启动，将在30秒内拍摄6张照片",
          expected_photos: 12,
          photo_schedule: [0, 5, 10, 15, 20, 25]
        },
        timestamp: new Date().toISOString()
      });
    }
    
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(`${EDGE_API_BASE}/photo/start-capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    const data = await response.json();
    console.log('Edge device response:', { status: response.status, data });
    
    if (!response.ok) {
      console.error('Edge device error:', data);
      return NextResponse.json(
        { error: data.message || 'Failed to start photo capture' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Start photo capture error:', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timeout - edge device not accessible' },
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      { error: `Proxy error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}