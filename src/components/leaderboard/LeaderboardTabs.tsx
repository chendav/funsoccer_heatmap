"use client";

interface LeaderboardTabsProps {
  activeCategory: "distance" | "speed" | "activity";
  onCategoryChange: (category: "distance" | "speed" | "activity") => void;
}

export default function LeaderboardTabs({ activeCategory, onCategoryChange }: LeaderboardTabsProps) {
  const tabs = [
    {
      id: "distance" as const,
      name: "跑动距离",
      icon: "🏃‍♂️",
      description: "总跑动距离排行榜"
    },
    {
      id: "speed" as const,
      name: "速度表现",
      icon: "⚡",
      description: "平均速度排行榜"
    },
    {
      id: "activity" as const,
      name: "活跃度",
      icon: "🔥",
      description: "活跃时间排行榜"
    }
  ];

  return (
    <div className="mt-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onCategoryChange(tab.id)}
              className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeCategory === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="mr-2 text-lg">{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Category Description */}
      <div className="mt-4 pb-4">
        {tabs.map((tab) => (
          activeCategory === tab.id && (
            <p key={tab.id} className="text-sm text-gray-600">
              {tab.description}
            </p>
          )
        ))}
      </div>
    </div>
  );
}