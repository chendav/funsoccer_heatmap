import { NextRequest, NextResponse } from 'next/server';

const EDGE_API_BASE = 'http://10.0.0.118:8000';

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