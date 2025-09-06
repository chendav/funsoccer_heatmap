import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { latitude, longitude, user_id, session_id } = body;

    // 获取真实树莓派设备
    const realDevice = {
      device_id: "edge_raspberrypi_bbb576",
      device_name: "树莓派设备 - 科技园",
      device_type: "raspberry_pi",
      latitude: 22.3964,
      longitude: 114.1095,
      city: "香港",
      address: "香港科技园",
      field_name: "科技园足球场",
      field_type: "11人制",
      cameras: [],
      last_online: new Date().toISOString()
    };

    // 计算距离
    const distance = calculateDistance(
      latitude || 22.3964,
      longitude || 114.1095,
      realDevice.latitude,
      realDevice.longitude
    );

    realDevice['distance_km'] = distance;

    // 返回匹配结果
    return NextResponse.json({
      success: true,
      matched_device: realDevice,
      alternative_devices: [],
      user_location: {
        latitude: latitude || 22.3964,
        longitude: longitude || 114.1095,
        address: body.address
      },
      match_info: {
        strategy: "nearest_device",
        distance_km: distance,
        expires_at: new Date(Date.now() + 3600000).toISOString()
      },
      message: `已匹配到距离 ${distance.toFixed(1)}km 的设备`
    });
  } catch (error) {
    console.error('[API] Device match error:', error);
    return NextResponse.json(
      { 
        success: false,
        message: '设备匹配失败',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // 地球半径（公里）
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}