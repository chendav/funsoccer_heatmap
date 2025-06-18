import React, { useEffect, useState } from "react";

/**
 * 设备下拉菜单组件
 * - 加载时自动请求 /api/device_ids 获取设备列表
 * - 支持选择设备，切换时回调 onChange
 * - 加载中、无设备、错误等状态友好提示
 * - 红白配色，风格统一
 */
export default function DeviceSelector({ value, onChange }: {
  value: string | undefined;
  onChange: (deviceId: string) => void;
}) {
  const [deviceIds, setDeviceIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch("http://106.14.125.195:8000/api/device_ids")
      .then(res => {
        if (!res.ok) throw new Error("网络错误");
        return res.json();
      })
      .then(data => {
        setDeviceIds(data.device_ids || []);
        setLoading(false);
        if (data.device_ids && data.device_ids.length > 0 && !value) {
          onChange(data.device_ids[0]);
        }
      })
      .catch(() => {
        setError("设备列表加载失败");
        setLoading(false);
      });
    // eslint-disable-next-line
  }, []);

  return (
    <div className="flex items-center gap-4 my-4">
      <label className="text-red-700 font-semibold" htmlFor="device-select">采集设备：</label>
      {loading ? (
        <span className="text-red-400">加载中...</span>
      ) : error ? (
        <span className="text-red-400">{error}</span>
      ) : deviceIds.length === 0 ? (
        <span className="text-red-400">暂无设备</span>
      ) : (
        <select
          id="device-select"
          className="border border-red-200 rounded px-3 py-1 text-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
          value={value}
          onChange={e => onChange(e.target.value)}
        >
          {deviceIds.map(id => (
            <option key={id} value={id}>{id}</option>
          ))}
        </select>
      )}
    </div>
  );
} 