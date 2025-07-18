"use client";

import StatsCards from "@/components/StatsCards";
import Heatmap from "@/components/Heatmap";
import PlayerStatsBars from "@/components/PlayerStatsBars";
import DeviceSelector from "@/components/DeviceSelector";
import { useState, useEffect, useRef } from "react";

// Landing page components
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowToUse from "@/components/landing/HowToUse";
import Testimonials from "@/components/landing/Testimonials";
import Pricing from "@/components/landing/Pricing";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";
import LanguageToggle from "@/components/landing/LanguageToggle";
import { type Language } from "@/lib/translations";

// 统一API前缀
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

export default function Home() {
  // Language state
  const [language, setLanguage] = useState<Language>("zh");
  
  // Existing states
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

  // Language toggle function
  const toggleLanguage = () => {
    setLanguage(prev => prev === "zh" ? "en" : "zh");
  };

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
    <div className="min-h-screen">
      {/* Header with language toggle */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo_funsoccer.png" alt="趣踢 FunSoccer" className="w-8 h-8" />
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">趣踢 FunSoccer</h1>
          </div>
          <LanguageToggle language={language} onToggle={toggleLanguage} />
        </div>
      </header>

      {/* Landing page sections */}
      <Hero language={language} />
      <Features language={language} />
      <HowToUse language={language} />
      <Testimonials language={language} />
      <Pricing language={language} />
      <CTA language={language} />

      {/* Original heatmap section */}
      <section className="py-20 px-4 relative overflow-hidden" style={{
        backgroundImage: 'url(/player_backgroud.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        {/* Background overlay for better readability */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">实时热力图分析</h2>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">查看你的运动数据和热力图分析，了解你的表现</p>
          </div>
          
          {/* 比赛选择与身份识别区 */}
          <div className="w-full bg-white/95 backdrop-blur-sm p-6 rounded-xl shadow-lg mb-8 border border-white/20">
            <div className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              比赛选择与身份识别
            </div>
            {location ? null : <div className="text-red-600 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              正在获取定位...
            </div>}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center mb-4">
              <select
                className="border border-gray-300 rounded-lg px-4 py-2 flex-1 min-w-[200px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedMatch || ""}
                onChange={e => setSelectedMatch(e.target.value)}
                disabled={matches.length === 0}
              >
                <option value="">选择比赛</option>
                {matches.map(m => (
                  <option key={m.match_id} value={m.match_id}>{m.field_name || m.match_id}</option>
                ))}
              </select>
              <div className="flex gap-2 flex-wrap">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  disabled={!selectedMatch || isCollecting}
                  onClick={startCollect}
                >开始比赛</button>
                {isCollecting && (
                  <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors" onClick={stopCollect}>结束采集</button>
                )}
                {bindInfo && (
                  <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors" onClick={handleUnbind}>解绑</button>
                )}
              </div>
            </div>
            {recognizeStatus && <div className="text-blue-700 mb-2 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              {recognizeStatus}
            </div>}
            {bindInfo && (
              <div className="text-green-700 mb-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                绑定成功！您的编号为：{bindInfo.global_id}，置信度：{(bindInfo.confidence*100).toFixed(1)}%
              </div>
            )}
            {unbindStatus && <div className="text-orange-700 mb-2 flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              {unbindStatus}
            </div>}
          </div>

          {/* 主内容区 */}
          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8">
            {/* 左侧信息区域 */}
            <div className="flex flex-col items-center lg:items-start w-full lg:w-auto lg:min-w-[300px]">
              {/* 标题区域 */}
              <div className="text-center lg:text-left mb-6">
                <div className="text-3xl md:text-4xl font-bold tracking-widest text-white leading-tight mb-4 drop-shadow-lg">
                  新华厂<br/>博格坎普
                </div>
                {/* 设备选择区域 */}
                <div className="flex flex-col gap-3 items-center lg:items-start">
                  <DeviceSelector value={deviceId} onChange={setDeviceId} />
                  {/* 绑定后自动展示个人编号 */}
                  {bindInfo ? (
                    <div className="text-green-700 font-bold text-lg">我的编号：{bindInfo.global_id}</div>
                  ) : trackIds.length > 0 && (
                    <select
                      className="border border-red-200 rounded-lg px-4 py-2 text-red-700 focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 text-lg text-white font-semibold shadow-lg border border-white/30">球队：暂无</div>
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 text-lg text-white font-semibold shadow-lg border border-white/30">位置：前腰</div>
              </div>
            </div>

            {/* 右侧热力图和统计区域 */}
            <div className="flex flex-col items-center w-full lg:w-auto">
              {/* 球场SVG热力图区 */}
              <div className="mb-6">
                <Heatmap deviceId={deviceId} trackId={bindInfo ? String(bindInfo.global_id) : selectedTrackId} />
              </div>
              
              {/* 属性条形图区 */}
              <div className="mb-6 w-full max-w-md">
                <PlayerStatsBars />
              </div>
              
              {/* 底部统计卡片区 */}
              <div className="w-full max-w-md">
                <StatsCards distance={distance} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer language={language} />
    </div>
  );
}
