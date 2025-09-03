"use client";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  totalDistance: number;
  averageSpeed: number;
  maxSpeed: number;
  matchCount: number;
  totalActiveTime: number;
  isAnonymous: boolean;
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  category: "distance" | "speed" | "activity";
  currentUserRank?: number;
}

export default function LeaderboardTable({ entries, category, currentUserRank }: LeaderboardTableProps) {
  const getRankingValue = (entry: LeaderboardEntry) => {
    switch (category) {
      case "distance":
        return `${entry.totalDistance.toFixed(1)} km`;
      case "speed":
        return `${entry.averageSpeed.toFixed(1)} km/h`;
      case "activity":
        return `${entry.totalActiveTime} 分钟`;
      default:
        return "--";
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return null;
    }
  };

  const getDisplayName = (entry: LeaderboardEntry) => {
    if (entry.isAnonymous) {
      return `匿名球员 #${entry.userId.slice(-4)}`;
    }
    return entry.displayName;
  };

  const isCurrentUser = (entry: LeaderboardEntry) => {
    return currentUserRank && entry.rank === currentUserRank;
  };

  if (!entries || entries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="text-gray-400 text-4xl mb-4">📊</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">暂无排行榜数据</h3>
        <p className="text-gray-600">
          当前时间段内还没有足够的数据生成排行榜，请稍后再试。
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          排行榜 - {category === "distance" ? "跑动距离" : category === "speed" ? "速度表现" : "活跃度"}
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                排名
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                球员
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {category === "distance" ? "跑动距离" : category === "speed" ? "平均速度" : "活跃时间"}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                比赛场次
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                最高速度
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {entries.map((entry) => (
              <tr
                key={`${entry.rank}-${entry.userId}`}
                className={`${
                  isCurrentUser(entry)
                    ? "bg-blue-50 border-l-4 border-blue-500"
                    : "hover:bg-gray-50"
                } transition-colors duration-150`}
              >
                {/* Rank */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">{getRankIcon(entry.rank)}</span>
                    <span className={`text-sm font-bold ${
                      entry.rank <= 3 ? "text-yellow-600" : "text-gray-900"
                    }`}>
                      #{entry.rank}
                    </span>
                    {isCurrentUser(entry) && (
                      <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        您的排名
                      </span>
                    )}
                  </div>
                </td>

                {/* Player Name */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                      <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {entry.isAnonymous ? "?" : getDisplayName(entry).charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {getDisplayName(entry)}
                      </div>
                      {entry.isAnonymous && (
                        <div className="text-xs text-gray-500">匿名用户</div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Primary Metric */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-gray-900">
                    {getRankingValue(entry)}
                  </div>
                </td>

                {/* Match Count */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {entry.matchCount} 场
                </td>

                {/* Max Speed */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {entry.maxSpeed.toFixed(1)} km/h
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <p className="text-sm text-gray-600 text-center">
          显示前 {entries.length} 名 • 数据每小时更新一次
        </p>
      </div>
    </div>
  );
}