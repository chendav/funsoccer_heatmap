"use client";

import StatsCards from "@/components/StatsCards";
import Heatmap from "@/components/Heatmap";
import PlayerStatsBars from "@/components/PlayerStatsBars";
import PlayerRankings from "@/components/PlayerRankings";
import DeviceSelector from "@/components/DeviceSelector";
import GeographicDeviceSelector, { MatchResult } from "@/components/GeographicDeviceSelector";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

// Landing page components
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowToUse from "@/components/landing/HowToUse";
import Testimonials from "@/components/landing/Testimonials";
import Pricing from "@/components/landing/Pricing";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";
import LanguageToggle from "@/components/landing/LanguageToggle";
import PlayerBinding from "@/components/PlayerBinding";
import LoginButton from "@/components/auth/LoginButton";
import { type Language, translations } from "@/lib/translations";

// 统一API前缀
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

// 获取翻译内容的辅助函数
const t = (key: keyof typeof translations.zh, language: Language) => {
  return translations[language][key]
}

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
  const [useGeographicSelector, setUseGeographicSelector] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);

  // Language toggle function
  const toggleLanguage = () => {
    setLanguage(prev => prev === "zh" ? "en" : "zh");
  };

  // Geographic device selection handler
  const handleGeographicDeviceSelect = (deviceId: string, matchResult?: MatchResult) => {
    setDeviceId(deviceId);
    if (matchResult) {
      setMatchResult(matchResult);
      // 如果有匹配结果，可以自动设置比赛信息
      if (matchResult.matched_device && matchResult.matched_device.field_name) {
        const newMatch = {
          match_id: `geographic_match_${Date.now()}`,
          field_name: matchResult.matched_device.field_name
        };
        setMatches(prev => [...prev, newMatch]);
        setSelectedMatch(newMatch.match_id);
      }
    }
  };

  useEffect(() => {
    if (!deviceId) return;
    setDistance(undefined);
    
    // 先获取位置数据来确定可用的球员ID
    fetch(`${API_BASE}/api/player-positions?device_id=${deviceId}&limit=100`)
      .then(res => res.json())
      .then(data => {
        // 处理trackIds - 使用位置数据中的球员ID
        const positionDataObj = data.position_data || {};
        const ids = Object.keys(positionDataObj);
        setTrackIds(ids);
        if (ids.length > 0) {
          setSelectedTrackId(ids[0]);
        } else {
          setSelectedTrackId(undefined);
        }
      })
      .catch(() => {
        setTrackIds([]);
        setSelectedTrackId(undefined);
      });
    
    // 获取距离统计
    fetch(`${API_BASE}/api/heatmap/optimized?device_id=${deviceId}`)
      .then(res => res.json())
      .then(data => {
        // 使用原来的distance_stats字段
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
      })
      .catch(() => {
        setDistance('--');
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

  // 拉取比赛列表（临时使用测试数据）
  useEffect(() => {
    if (location) {
      // 临时注释掉不存在的API调用
      // fetch(`${API_BASE}/api/matches/today?location=${location.lat},${location.lng}`)
      //   .then(res => res.json())
      //   .then(data => setMatches(data.matches || []))
      //   .catch(() => setMatches([]));
      
      // 临时设置测试比赛数据
      setMatches([
        { 
          match_id: 'test_match_001', 
          field_name: '测试球场'
        }
      ]);
      
      // 自动选择第一个比赛
      setSelectedMatch('test_match_001');
      
      // 注释掉自动绑定，让用户可以选择球员
      // setBindInfo({ global_id: 1, confidence: 0.95 });
    }
  }, [location]);


  return (
    <div className="min-h-screen">
      {/* Header with language toggle */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Image src="/logo_funsoccer.png" alt="趣踢 FunSoccer" width={32} height={32} className="w-8 h-8" />
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">趣踢 FunSoccer</h1>
          </div>
          <div className="flex items-center gap-4">
            <LoginButton />
            <LanguageToggle language={language} onToggle={toggleLanguage} />
          </div>
        </div>
      </header>

      {/* Landing page sections */}
      <Hero language={language} />
      <Features language={language} />
      
      {/* Mobile App Showcase */}
      <section className="py-20 px-4 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {language === 'zh' ? '强大的移动端体验' : 'Powerful Mobile Experience'}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {language === 'zh' 
                ? '全功能手机应用，随时随地查看您的足球数据分析，包括热力图、统计数据、球员排名等完整功能'
                : 'Full-featured mobile app with complete football data analysis on the go, including heatmaps, statistics, player rankings and more'}
            </p>
          </div>
          
          <div className="relative">
            {/* Mobile screens showcase */}
            <div className="flex justify-center">
              <div className="relative max-w-5xl w-full">
                <Image 
                  src="/app_pages.png" 
                  alt={language === 'zh' ? '趣踢移动应用界面展示' : 'FunSoccer Mobile App Interface'} 
                  width={1200}
                  height={400}
                  className="w-full h-auto rounded-2xl shadow-2xl border border-gray-200"
                  priority
                />
                {/* Overlay with gradient for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-2xl pointer-events-none"></div>
              </div>
            </div>
            
            {/* Feature highlights below the image */}
            <div className="grid md:grid-cols-3 gap-8 mt-16">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {language === 'zh' ? '实时数据分析' : 'Real-time Analytics'}
                </h3>
                <p className="text-gray-600">
                  {language === 'zh' 
                    ? '查看详细的跑动距离、速度分析和体能消耗数据'
                    : 'View detailed running distance, speed analysis and fitness consumption data'}
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {language === 'zh' ? '热力图可视化' : 'Heatmap Visualization'}
                </h3>
                <p className="text-gray-600">
                  {language === 'zh'
                    ? '直观的场地热力图显示，清晰展示球员活动区域'
                    : 'Intuitive field heatmap display showing player activity areas clearly'}
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {language === 'zh' ? '球员排名对比' : 'Player Rankings'}
                </h3>
                <p className="text-gray-600">
                  {language === 'zh'
                    ? '与队友进行数据对比，激励自己不断提升表现'
                    : 'Compare data with teammates and motivate yourself to improve performance'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <HowToUse language={language} />
      <Testimonials language={language} />
      <Pricing language={language} />
      <CTA language={language} />

      {/* Player Binding Section */}
      <PlayerBinding language={language} />

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
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{t("heatmapTitle", language)}</h2>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">{t("heatmapDescription", language)}</p>
          </div>
          

          {/* 主内容区 */}
          <div className="flex flex-col xl:flex-row items-center xl:items-start justify-center gap-6 lg:gap-8">
            {/* 左侧信息区域 */}
            <div className="flex flex-col items-center xl:items-start w-full xl:w-auto xl:min-w-[280px] order-2 xl:order-1">
              {/* 标题区域 */}
              <div className="text-center xl:text-left mb-4 lg:mb-6">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-widest text-white leading-tight mb-4 drop-shadow-lg">
                  {t("teamName", language)}<br/>{t("playerName", language)}
                </div>
                {/* 设备选择区域 */}
                <div className="flex flex-col gap-3 items-center xl:items-start">
                  {/* 选择器类型切换 */}
                  <div className="flex gap-2 mb-2">
                    <button
                      className={`px-3 py-1 text-sm rounded ${
                        useGeographicSelector 
                          ? "bg-white text-red-700 font-semibold" 
                          : "bg-white/20 text-white/80"
                      }`}
                      onClick={() => setUseGeographicSelector(true)}
                    >
                      智能匹配
                    </button>
                    <button
                      className={`px-3 py-1 text-sm rounded ${
                        !useGeographicSelector 
                          ? "bg-white text-red-700 font-semibold" 
                          : "bg-white/20 text-white/80"
                      }`}
                      onClick={() => setUseGeographicSelector(false)}
                    >
                      手动选择
                    </button>
                  </div>
                  
                  {/* 条件渲染设备选择器 */}
                  {useGeographicSelector ? (
                    <GeographicDeviceSelector 
                      value={deviceId} 
                      onChange={handleGeographicDeviceSelect}
                      sessionId={selectedMatch}
                    />
                  ) : (
                    <DeviceSelector value={deviceId} onChange={setDeviceId} />
                  )}
                  {/* 球员选择下拉菜单 */}
                  {trackIds.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <select
                        className="border border-white/30 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-white/50 focus:border-white/50"
                        value={selectedTrackId}
                        onChange={e => setSelectedTrackId(e.target.value)}
                      >
                        <option value="" className="text-gray-900">选择球员</option>
                        {trackIds.map(id => (
                          <option key={id} value={id} className="text-gray-900">{t("player", language)} {id}</option>
                        ))}
                      </select>
                      
                    </div>
                  )}
                </div>
              </div>
              
              {/* 球员信息卡片 */}
              <div className="flex flex-row gap-2 sm:gap-3 mb-4 lg:mb-6 flex-wrap justify-center xl:justify-start">
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-lg text-white font-semibold shadow-lg border border-white/30">
                  {t("team", language)}
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-lg text-white font-semibold shadow-lg border border-white/30">
                  {t("position", language)}
                </div>
              </div>

            </div>

            {/* 右侧热力图和统计区域 */}
            <div className="flex flex-col items-center w-full xl:w-auto order-1 xl:order-2">
              {/* 球场SVG热力图区 */}
              <div className="mb-4 lg:mb-6 w-full max-w-lg">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
                  <Heatmap deviceId={deviceId} trackId={selectedTrackId} />
                </div>
              </div>
              
              {/* 桌面端统计区域 */}
              <div className="hidden xl:block w-full max-w-md">
                {/* 属性条形图区 */}
                <div className="mb-6">
                  <PlayerStatsBars 
                    language={language} 
                    matchId={selectedMatch}
                    globalId={undefined}
                  />
                </div>
                
                {/* 底部统计卡片区 */}
                <div>
                  <StatsCards 
                    matchId={selectedMatch}
                    globalId={undefined}
                    language={language}
                    fallbackDistance={distance} // 保持向后兼容
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 移动端统计区域 */}
          <div className="xl:hidden w-full mt-8">
            <div className="max-w-2xl mx-auto">
              {/* 属性条形图区 */}
              <div className="mb-8 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <h4 className="text-white font-semibold mb-4 text-center">运动数据</h4>
                <PlayerStatsBars 
                  language={language} 
                  matchId={selectedMatch}
                  globalId={undefined}
                />
              </div>
              
              {/* 底部统计卡片区 */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <h4 className="text-white font-semibold mb-4 text-center">统计概览</h4>
                <StatsCards 
                  matchId={selectedMatch}
                  globalId={undefined}
                  language={language}
                  fallbackDistance={distance} // 保持向后兼容
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 球员排行榜区域 */}
      {selectedMatch && (
        <section className="py-12 sm:py-16 px-4 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                实时球员统计
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
                查看比赛中所有球员的跑动数据和表现排行
              </p>
            </div>
            
            <PlayerRankings 
              matchId={selectedMatch}
              language={language}
              className="max-w-3xl mx-auto"
            />
          </div>
        </section>
      )}

      {/* Footer */}
      <Footer language={language} />
    </div>
  );
}
