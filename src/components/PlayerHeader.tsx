import React from "react";

/**
 * 顶部球员信息组件（重构版）
 * 只展示球员姓名（大字）、球队、位置，居中显示，右上角静态菜单图标。
 */
export default function PlayerHeader() {
  return (
    <div className="w-full relative flex flex-col items-center justify-center pt-8 pb-4">
      {/* 顶部菜单图标 */}
      <div className="absolute right-6 top-6 flex flex-col gap-2">
        <svg width="32" height="8" viewBox="0 0 32 8" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect y="0" width="32" height="2" rx="1" fill="#E5DED2"/>
          <rect y="6" width="32" height="2" rx="1" fill="#E5DED2"/>
        </svg>
        <svg width="32" height="8" viewBox="0 0 32 8" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect y="0" width="32" height="2" rx="1" fill="#E5DED2"/>
          <rect y="6" width="32" height="2" rx="1" fill="#E5DED2"/>
        </svg>
      </div>
      {/* 球员姓名 */}
      <div className="text-4xl font-bold tracking-widest text-[#E5DED2] mb-2 text-center leading-tight">
        新华厂<br/>博格坎普
      </div>
      {/* 球队与位置信息卡片 */}
      <div className="flex gap-4 mt-2">
        <div className="bg-[#E5DED2] rounded-full px-6 py-2 text-lg text-[#6B6B6B] font-semibold shadow">球队：暂无</div>
        <div className="bg-[#E5DED2] rounded-full px-6 py-2 text-lg text-[#6B6B6B] font-semibold shadow">位置：前腰</div>
      </div>
    </div>
  );
} 