"use client";

import StatsCards from "@/components/StatsCards";
import Heatmap from "@/components/Heatmap";
import PlayerStatsBars from "@/components/PlayerStatsBars";
import DeviceSelector from "@/components/DeviceSelector";
import { useState, useEffect, useRef } from "react";

// 统一API前缀
const API_BASE = "https://106.14.125.195:3000";

export default function Home() {
  const [deviceId, setDeviceId] = useState<string | undefined>(undefined);
  const [distance, setDistance] = useState<string | undefined>(undefined);
  const [trackIds, setTrackIds] = useState<string[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState<string | undefined>(undefined);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [matches, setMatches] = useState<{ match_id: string; field_name?: string }[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<string | undefined>(undefined);
  const [isCollecting, setIsCollecting] = useState(false);
  const [trajectory, setTrajectory] = useState<{lat: number, lng: number, timestamp: number}[]>([]);
  const [recognizeStatus, setRecognizeStatus] = useState<string | null>(null);
  const [bindInfo, setBindInfo] = useState<{global_id: number, confidence: number} | null>(null);
  const [unbindStatus, setUnbindStatus] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!deviceId) return;
    setDistance(undefined);
    fetch(`${API_BASE}/api/heatmap?device_id=${deviceId}`)
      .then(res => res.json())
      .then(data => {
        const stats = data.distance_stats;
        if (stats && typeof stats === 'object') {
          let total = 0;
          for (const key in stats) {
            total += Number(stats[key]) || 0;
          }
          if (total >= 1000) {
            setDistance((total / 1000).toFixed(2) + 'km');
          } else {
            setDistance(total.toFixed(0) + 'm');
          }
        } else {
          setDistance('--');
        }
        // 处理trackIds
        const heatmapData = data.heatmap || {};
        const ids = Object.keys(heatmapData);
        setTrackIds(ids);
        if (ids.length > 0) {
          setSelectedTrackId(ids[0]);
        } else {
          setSelectedTrackId(undefined);
        }
      })
      .catch(() => {
        setDistance('--');
        setTrackIds([]);
        setSelectedTrackId(undefined);
      });
  }, [deviceId]);

  // 获取地理位置
  useEffect(() => {
    if (!location) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          pos => setLocation({lat: pos.coords.latitude, lng: pos.coords.longitude}),
          () => setLocation(null)
        );
      }
    }
  }, [location]);

  // 拉取比赛列表
  useEffect(() => {
    if (location) {
      fetch(`${API_BASE}/api/matches/today?location=${location.lat},${location.lng}`)
        .then(res => res.json())
        .then(data => setMatches(data.matches || []))
        .catch(() => setMatches([]));
    }
  }, [location]);

  // 轨迹采集逻辑
  const startCollect = () => {
    setIsCollecting(true);
    setTrajectory([]);
    setRecognizeStatus("正在采集轨迹，请围绕中心圈跑一圈...");
    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        pos => {
          setTrajectory(traj => ([...traj, {lat: pos.coords.latitude, lng: pos.coords.longitude, timestamp: Date.now()}]));
        },
        () => setRecognizeStatus("定位失败，请检查权限"),
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
      );
    }
  };
  const stopCollect = () => {
    setIsCollecting(false);
    setRecognizeStatus("轨迹采集完成，正在识别...");
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    // 上传轨迹到后端
    if (selectedMatch && trajectory.length > 5) {
      fetch(`${API_BASE}/api/identity/recognize`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          user_id: 1, // TODO: 替换为真实用户ID
          match_id: selectedMatch,
          trajectory
        })
      })
        .then(res => res.json())
        .then(data => {
          if (data.status === "success") {
            setBindInfo({global_id: data.global_id, confidence: data.confidence});
            setRecognizeStatus("已识别成功，请在摄像头对面边线放下手机，并保持在摄像头视野内。");
          } else {
            setRecognizeStatus(data.message || "识别失败，请重试");
          }
        })
        .catch(() => setRecognizeStatus("识别请求失败"));
    } else {
      setRecognizeStatus("轨迹点过少，采集失败");
    }
  };

  // 解绑逻辑
  const handleUnbind = () => {
    if (!selectedMatch) return;
    fetch(`${API_BASE}/api/identity/unbind`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        user_id: 1, // TODO: 替换为真实用户ID
        match_id: selectedMatch
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === "success") {
          setBindInfo(null);
          setRecognizeStatus(null);
          setUnbindStatus("解绑成功，可重新采集身份");
        } else {
          setUnbindStatus(data.message || "解绑失败");
        }
      })
      .catch(() => setUnbindStatus("解绑请求失败"));
  };

  return (
    <div>
      {/* 新增：比赛选择与身份识别区 */}
      <div className="w-full bg-[#F5F5F5] p-4 rounded mb-4 flex flex-col gap-2">
        <div className="font-bold text-lg text-[#6B6B6B]">比赛选择与身份识别</div>
        {location ? null : <div className="text-red-600">正在获取定位...</div>}
        <div className="flex flex-row gap-2 items-center">
          <select
            className="border rounded px-2 py-1"
            value={selectedMatch || ""}
            onChange={e => setSelectedMatch(e.target.value)}
            disabled={matches.length === 0}
          >
            <option value="">选择比赛</option>
            {matches.map(m => (
              <option key={m.match_id} value={m.match_id}>{m.field_name || m.match_id}</option>
            ))}
          </select>
          <button
            className="bg-blue-600 text-white px-4 py-1 rounded disabled:bg-gray-400"
            disabled={!selectedMatch || isCollecting}
            onClick={startCollect}
          >开始比赛</button>
          {isCollecting && (
            <button className="bg-gray-600 text-white px-3 py-1 rounded" onClick={stopCollect}>结束采集</button>
          )}
          {bindInfo && (
            <button className="bg-red-600 text-white px-3 py-1 rounded" onClick={handleUnbind}>解绑</button>
          )}
        </div>
        {recognizeStatus && <div className="text-blue-700 mt-2">{recognizeStatus}</div>}
        {bindInfo && (
          <div className="text-green-700 mt-2">绑定成功！您的编号为：{bindInfo.global_id}，置信度：{(bindInfo.confidence*100).toFixed(1)}%</div>
        )}
        {unbindStatus && <div className="text-orange-700 mt-2">{unbindStatus}</div>}
      </div>
      {/* 主内容区 */}
      <div
        className="flex flex-row items-stretch justify-end"
        style={{
          width: '100vw',
        }}
      >
        {/* 主内容区靠右，最大宽度430px，右侧24px边距，竖直排列 */}
        <div className="flex flex-col items-end w-full max-w-[430px] pr-6" style={{marginLeft: 'auto'}}>
          {/* 顶部区域：两行字居中，右侧为设备和球员下拉菜单 */}
          <div className="flex flex-row items-center w-full mt-8 mb-4 justify-between">
            {/* 标题区，适度左移 */}
            <div
              className="text-4xl font-bold tracking-widest text-[#E5DED2] leading-tight whitespace-nowrap pl-8"
              style={{ transform: 'translateX(-48px)' }}
            >
              新华厂<br/>博格坎普
            </div>
            {/* 右侧下拉菜单区 */}
            <div className="flex flex-col gap-2 items-end min-w-[220px]">
              <div className="flex flex-row items-center whitespace-nowrap">
                <DeviceSelector value={deviceId} onChange={setDeviceId} />
              </div>
              {/* 绑定后自动展示个人编号 */}
              {bindInfo ? (
                <div className="text-green-700 font-bold">我的编号：{bindInfo.global_id}</div>
              ) : trackIds.length > 0 && (
                <select
                  className="border border-red-200 rounded px-3 py-1 text-red-700 mt-2"
                  value={selectedTrackId}
                  onChange={e => setSelectedTrackId(e.target.value)}
                >
                  {trackIds.map(id => (
                    <option key={id} value={id}>球员 {id}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
          {/* 球员信息卡片 */}
          <div className="flex flex-row gap-4 w-full justify-end mb-6">
            <div className="bg-[#E5DED2] rounded-full px-6 py-2 text-lg text-[#6B6B6B] font-semibold shadow">球队：暂无</div>
            <div className="bg-[#E5DED2] rounded-full px-6 py-2 text-lg text-[#6B6B6B] font-semibold shadow">位置：前腰</div>
          </div>
          {/* 球场SVG热力图区 */}
          <div className="w-full flex flex-row justify-end mb-6">
            <Heatmap deviceId={deviceId} trackId={bindInfo ? String(bindInfo.global_id) : selectedTrackId} />
          </div>
          {/* 属性条形图区 */}
          <div className="w-full flex flex-row justify-end mb-6">
            <PlayerStatsBars />
          </div>
          {/* 底部统计卡片区 */}
          <div className="w-full flex flex-row justify-end mb-8">
            <StatsCards distance={distance} />
          </div>
        </div>
      </div>
    </div>
  );
}
