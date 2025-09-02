"use client";

import React, { useEffect, useState, useCallback } from "react";

interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
}

interface DeviceInfo {
  device_id: string;
  device_name: string;
  device_type: string;
  latitude?: number;
  longitude?: number;
  distance_km?: number;
  city?: string;
  address?: string;
  field_name?: string;
  field_type?: string;
  cameras: {
    id: string;
    type: string;
    [key: string]: unknown;
  }[];
  last_online?: string;
}

export interface MatchResult {
  success: boolean;
  matched_device?: DeviceInfo;
  alternative_devices?: DeviceInfo[];
  user_location: UserLocation;
  match_info?: {
    strategy: string;
    distance_km: number;
    expires_at: string;
  };
  reason?: string;
  message?: string;
}

/**
 * 地理位置设备选择器组件
 * - 自动获取用户地理位置
 * - 查找附近的在线设备
 * - 为用户匹配最合适的设备
 */
export default function GeographicDeviceSelector({ 
  value, 
  onChange,
  sessionId 
}: {
  value: string | undefined;
  onChange: (deviceId: string, matchResult?: MatchResult) => void;
  sessionId?: string;
}) {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [nearbyDevices, setNearbyDevices] = useState<DeviceInfo[]>([]);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>("正在获取位置...");

  const apiBase = process.env.NEXT_PUBLIC_BACKEND_API_BASE || process.env.NEXT_PUBLIC_API_BASE || "http://47.239.73.57";

  // 获取用户地理位置
  const getUserLocation = async (): Promise<UserLocation> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("您的浏览器不支持地理位置服务"));
        return;
      }

      setLocationStatus("请允许获取您的位置信息...");

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: UserLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          setLocationStatus(`位置获取成功，精度: ${Math.round(position.coords.accuracy)}米`);
          resolve(location);
        },
        (error) => {
          let errorMessage = "";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "用户拒绝了位置访问请求";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "位置信息不可用";
              break;
            case error.TIMEOUT:
              errorMessage = "获取位置超时";
              break;
            default:
              errorMessage = "获取位置时发生未知错误";
              break;
          }
          setLocationStatus(errorMessage);
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5分钟缓存
        }
      );
    });
  };

  // 查找附近设备
  const findNearbyDevices = useCallback(async (location: UserLocation): Promise<DeviceInfo[]> => {
    try {
      const response = await fetch(
        `${apiBase}/api/v1/device-location/devices/nearby?` +
        `latitude=${location.latitude}&longitude=${location.longitude}&` +
        `max_distance_km=10&limit=10`
      );

      if (!response.ok) {
        throw new Error(`查找附近设备失败: ${response.status}`);
      }

      const devices = await response.json();
      return devices as DeviceInfo[];
    } catch (error) {
      console.error("查找附近设备失败:", error);
      throw error;
    }
  }, [apiBase]);

  // 匹配用户到设备
  const matchUserToDevice = useCallback(async (location: UserLocation): Promise<MatchResult> => {
    try {
      const requestData = {
        user_id: "web-user", // 可以根据实际用户系统调整
        session_id: sessionId || `session-${Date.now()}`,
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        address: location.address
      };

      const response = await fetch(`${apiBase}/api/v1/device-location/match`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`设备匹配失败: ${response.status}`);
      }

      const result = await response.json();
      return result as MatchResult;
    } catch (error) {
      console.error("设备匹配失败:", error);
      throw error;
    }
  }, [apiBase, sessionId]);

  // 初始化地理位置和设备匹配
  useEffect(() => {
    const initializeLocationMatching = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. 获取用户位置
        const location = await getUserLocation();
        setUserLocation(location);

        // 2. 查找附近设备
        setLocationStatus("正在查找附近的设备...");
        const devices = await findNearbyDevices(location);
        setNearbyDevices(devices);

        if (devices.length === 0) {
          setError("附近没有找到可用的设备");
          setLocationStatus("附近暂无可用设备");
          return;
        }

        // 3. 进行设备匹配
        setLocationStatus("正在为您匹配最佳设备...");
        const matchResult = await matchUserToDevice(location);
        setMatchResult(matchResult);

        if (matchResult.success && matchResult.matched_device) {
          setLocationStatus(
            `已为您匹配到距离 ${matchResult.matched_device.distance_km?.toFixed(1)}km 的设备`
          );
          onChange(matchResult.matched_device.device_id, matchResult);
        } else {
          setError(matchResult.message || "设备匹配失败");
          setLocationStatus(matchResult.message || "无法匹配合适的设备");
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "位置服务初始化失败";
        setError(errorMessage);
        setLocationStatus(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    initializeLocationMatching();
  }, [sessionId, onChange, apiBase, findNearbyDevices, matchUserToDevice]);

  // 手动选择设备
  const handleManualDeviceSelect = (deviceId: string) => {
    const selectedDevice = nearbyDevices.find(d => d.device_id === deviceId);
    if (selectedDevice) {
      onChange(deviceId);
      setLocationStatus(`已选择设备: ${selectedDevice.device_name || deviceId}`);
    }
  };

  // 重新获取位置
  const handleRefreshLocation = () => {
    window.location.reload(); // 简单的重新加载页面
  };

  return (
    <div className="border border-red-200 rounded-lg p-4 bg-red-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-red-700 font-semibold">智能设备匹配</h3>
        <button
          onClick={handleRefreshLocation}
          className="text-red-600 hover:text-red-800 text-sm underline"
          disabled={loading}
        >
          重新定位
        </button>
      </div>

      {/* 状态信息 */}
      <div className="mb-3">
        <div className="flex items-center gap-2">
          {loading && (
            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          )}
          <span className={`text-sm ${error ? "text-red-600" : "text-red-700"}`}>
            {locationStatus}
          </span>
        </div>
        
        {userLocation && (
          <div className="text-xs text-red-600 mt-1">
            位置: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
            {userLocation.accuracy && ` (精度: ${Math.round(userLocation.accuracy)}m)`}
          </div>
        )}
      </div>

      {/* 匹配结果 */}
      {matchResult?.success && matchResult.matched_device && (
        <div className="bg-white border border-red-200 rounded p-3 mb-3">
          <div className="text-sm text-red-700 font-medium mb-1">推荐设备:</div>
          <div className="text-red-800 font-semibold">
            {matchResult.matched_device.device_name || matchResult.matched_device.device_id}
          </div>
          <div className="text-xs text-red-600 mt-1">
            距离: {matchResult.matched_device.distance_km?.toFixed(1)}km
            {matchResult.matched_device.city && ` • ${matchResult.matched_device.city}`}
            {matchResult.matched_device.field_name && ` • ${matchResult.matched_device.field_name}`}
          </div>
        </div>
      )}

      {/* 备选设备 */}
      {nearbyDevices.length > 1 && (
        <div>
          <label className="block text-red-700 font-medium text-sm mb-2">
            或选择其他附近设备:
          </label>
          <select
            className="w-full border border-red-200 rounded px-3 py-2 text-red-700 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
            value={value || ""}
            onChange={e => handleManualDeviceSelect(e.target.value)}
          >
            <option value="">选择设备...</option>
            {nearbyDevices.map(device => (
              <option key={device.device_id} value={device.device_id}>
                {device.device_name || device.device_id}
                {device.distance_km && ` (${device.distance_km.toFixed(1)}km)`}
                {device.city && ` - ${device.city}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 错误状态 */}
      {error && !loading && (
        <div className="bg-red-100 border border-red-300 rounded p-3 mt-3">
          <div className="text-red-700 text-sm font-medium">无法获取附近设备</div>
          <div className="text-red-600 text-xs mt-1">{error}</div>
          <div className="text-red-600 text-xs mt-2">
            请确保:
            <ul className="list-disc list-inside mt-1">
              <li>允许浏览器访问您的位置</li>
              <li>网络连接正常</li>
              <li>附近有可用的设备</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}