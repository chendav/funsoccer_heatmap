import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_BASE = process.env.BACKEND_API_BASE || 'http://47.239.73.57';
// For now, disable mock data to test real backend connection
const USE_MOCK_DATA = false; // process.env.NODE_ENV === 'production' && !process.env.BACKEND_API_BASE;

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
    
    // Use mock data in production if backend is not accessible
    if (USE_MOCK_DATA) {
      console.log('Using mock data for session photos');
      // Generate mock photos
      const mockPhotos = [
        {
          photo_id: `mock_photo_1_${session_id}`,
          session_id,
          camera_id: 'cam_01',
          timestamp: new Date().toISOString(),
          filename: `mock_${session_id}_cam_01.jpg`,
          original_path: `/photos/${session_id}/mock_${session_id}_cam_01.jpg`,
          thumbnail_path: `/photos/${session_id}/thumb_mock_${session_id}_cam_01.jpg`,
          file_size_bytes: 1024000,
          image_width: 1920,
          image_height: 1080,
          status: 'ready'
        },
        {
          photo_id: `mock_photo_2_${session_id}`,
          session_id,
          camera_id: 'cam_02', 
          timestamp: new Date().toISOString(),
          filename: `mock_${session_id}_cam_02.jpg`,
          original_path: `/photos/${session_id}/mock_${session_id}_cam_02.jpg`,
          thumbnail_path: `/photos/${session_id}/thumb_mock_${session_id}_cam_02.jpg`,
          file_size_bytes: 1024000,
          image_width: 1920,
          image_height: 1080,
          status: 'ready'
        }
      ];
      
      return NextResponse.json({
        success: true,
        data: {
          photos: mockPhotos,
          photos_count: mockPhotos.length
        }
      });
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