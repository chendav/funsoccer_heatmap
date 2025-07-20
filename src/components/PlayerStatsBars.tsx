import React from "react";
import { translations, type Language } from "@/lib/translations";

interface PlayerStatsBarsProps {
  language: Language;
}

/**
 * 属性条形图区组件
 * 展示速度、体力、进攻、防守四项数据，竖直排列，风格贴合设计图。
 */
export default function PlayerStatsBars({ language }: PlayerStatsBarsProps) {
  const t = translations[language];
  
  // 示例数据，可后续通过props传递
  const stats = [
    { label: t.speed, value: 10 },
    { label: t.stamina, value: 12 },
    { label: t.attack, value: 12 },
    { label: t.defense, value: 8 },
  ];
  // 计算最大值用于归一化高度
  const maxVal = Math.max(...stats.map(s => s.value));
  return (
    <div className="flex items-end gap-4 mt-8 mb-4">
      {stats.map((stat, idx) => (
        <div key={idx} className="flex flex-col items-center">
          <div
            className="bg-[#F5EFE2] rounded-t-lg rounded-b-md flex items-end justify-center"
            style={{
              width: "48px",
              height: `${stat.value / maxVal * 120 + 40}px`, // 最小高度40，最大160
              transition: "height 0.3s"
            }}
          >
            <span className="text-xl font-bold text-[#A6A29A] mb-2 mt-2">{stat.value}</span>
          </div>
          <div className="text-base text-[#A6A29A] mt-2 tracking-widest">{stat.label}</div>
        </div>
      ))}
    </div>
  );
} 