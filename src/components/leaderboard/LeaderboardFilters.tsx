"use client";

interface LeaderboardFiltersProps {
  timeFilter: "week" | "month" | "season";
  onTimeFilterChange: (filter: "week" | "month" | "season") => void;
}

export default function LeaderboardFilters({ timeFilter, onTimeFilterChange }: LeaderboardFiltersProps) {
  const timeOptions = [
    {
      value: "week" as const,
      label: "本周",
      description: "过去7天的数据"
    },
    {
      value: "month" as const,
      label: "本月",
      description: "过去30天的数据"
    },
    {
      value: "season" as const,
      label: "本赛季",
      description: "当前赛季的数据"
    }
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-lg font-medium text-gray-900">时间范围</h2>
        <p className="text-sm text-gray-600 mt-1">选择要查看的排行榜时间范围</p>
      </div>

      <div className="mt-4 sm:mt-0">
        <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
          {timeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onTimeFilterChange(option.value)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                timeFilter === option.value
                  ? "bg-white text-blue-700 shadow-sm border border-blue-200"
                  : "text-gray-500 hover:text-gray-700 hover:bg-white"
              }`}
              title={option.description}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}