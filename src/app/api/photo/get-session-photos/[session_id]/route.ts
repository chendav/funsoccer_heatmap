import { NextRequest, NextResponse } from 'next/server';

const EDGE_API_BASE = process.env.EDGE_API_BASE || 'http://10.0.0.118:8000';
const USE_MOCK_DATA = process.env.NODE_ENV === 'production' && !process.env.EDGE_API_BASE;

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
    
    // Use mock data in production if edge device is not accessible
    if (USE_MOCK_DATA) {
      console.log('Using mock data for get-session-photos');
      // Simulate photo data
      await new Promise(resolve => setTimeout(resolve, 500));
      return NextResponse.json({
        success: true,
        data: {
          session_id: session_id,
          photos_count: 4,
          photos: [
            {
              photo_id: `mock_photo_1_${session_id}`,
              session_id: session_id,
              camera_id: "cam1",
              timestamp: new Date(Date.now() - 300000).toISOString(),
              filename: "mock_photo_1.jpg"
            },
            {
              photo_id: `mock_photo_2_${session_id}`,
              session_id: session_id,
              camera_id: "cam2", 
              timestamp: new Date(Date.now() - 250000).toISOString(),
              filename: "mock_photo_2.jpg"
            },
            {
              photo_id: `mock_photo_3_${session_id}`,
              session_id: session_id,
              camera_id: "cam1",
              timestamp: new Date(Date.now() - 200000).toISOString(), 
              filename: "mock_photo_3.jpg"
            },
            {
              photo_id: `mock_photo_4_${session_id}`,
              session_id: session_id,
              camera_id: "cam2",
              timestamp: new Date(Date.now() - 150000).toISOString(),
              filename: "mock_photo_4.jpg"
            }
          ]
        },
        timestamp: new Date().toISOString()
      });
    }
    
    const response = await fetch(`${EDGE_API_BASE}/photo/get-session-photos/${session_id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Failed to get session photos' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Get session photos error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}