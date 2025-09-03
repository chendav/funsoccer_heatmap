"use client";

import { Line } from "react-chartjs-2";

interface WeeklyData {
  week: string;
  distance: number;
  matches: number;
  avgSpeed: number;
}

interface WeeklyChartProps {
  data: WeeklyData[];
}

export default function WeeklyChart({ data }: WeeklyChartProps) {
  // 准备图表数据
  const chartData = {
    labels: data.map(d => d.week).reverse(), // 按时间顺序显示
    datasets: [
      {
        label: '跑动距离 (km)',
        data: data.map(d => d.distance).reverse(),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        yAxisID: 'y',
        tension: 0.3,
      },
      {
        label: '平均速度 (km/h)',
        data: data.map(d => d.avgSpeed).reverse(),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        yAxisID: 'y1',
        tension: 0.3,
      }
    ]
  };

  const options = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          afterLabel: function(context: any) {
            const index = context.dataIndex;
            const matches = data[data.length - 1 - index].matches; // 反向索引
            return `比赛场次: ${matches}`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: '周次'
        }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: '跑动距离 (km)',
          color: 'rgb(59, 130, 246)'
        },
        ticks: {
          color: 'rgb(59, 130, 246)'
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: '平均速度 (km/h)',
          color: 'rgb(16, 185, 129)'
        },
        ticks: {
          color: 'rgb(16, 185, 129)'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <p>暂无趋势数据</p>
          <p className="text-sm mt-2">参与更多比赛后将显示趋势图表</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64">
      <Line data={chartData} options={options} />
    </div>
  );
}