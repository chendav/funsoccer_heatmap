# HTTP 轮询解决方案 - 替代 WebSocket

由于 Vercel 平台不支持 WebSocket 代理，我们使用 HTTP 轮询机制来实现实时功能。

## 功能对照表

| 原 WebSocket 功能 | HTTP 轮询替代方案 | 轮询间隔 |
|------------------|------------------|----------|
| 设备状态实时更新 | `/api/v1/devices/{id}/status` | 3秒 |
| 比赛进度推送 | `/api/v1/matches/{id}/progress` | 1秒 |
| 跟踪数据流 | `/api/v1/matches/{id}/tracking/latest` | 500ms |
| 球员统计更新 | `/api/v1/matches/{id}/players/{id}/stats` | 5秒 |
| 照片处理进度 | `/api/v1/sessions/{id}/photo-progress` | 2秒 |

## 使用方法

### 1. 使用轮询服务

```typescript
import { pollingService } from '@/services/polling-service';

// 开始轮询设备状态
pollingService.startPolling({
  id: 'device-status',
  url: '/api/v1/devices/rpi_001/status',
  interval: 3000,
  onData: (status) => {
    console.log('Device status updated:', status);
  }
});

// 停止轮询
pollingService.stopPolling('device-status');
```

### 2. 使用 React Hook

```typescript
import { usePolling } from '@/hooks/usePolling';

function MyComponent() {
  const { data, loading, error } = usePolling({
    url: '/api/v1/matches/match_001/progress',
    interval: 1000,
    enabled: true
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>Progress: {data?.progress}%</div>;
}
```

### 3. 使用专用 Hooks

```typescript
import { 
  useDeviceStatus, 
  useMatchProgress, 
  useTrackingData 
} from '@/hooks/usePolling';

function MatchDashboard({ matchId, deviceId }) {
  // 设备状态
  const deviceStatus = useDeviceStatus(deviceId);
  
  // 比赛进度
  const matchProgress = useMatchProgress(matchId);
  
  // 跟踪数据
  const trackingData = useTrackingData(matchId);
  
  return (
    <div>
      <p>Device: {deviceStatus.data?.status}</p>
      <p>Progress: {matchProgress.data?.percent}%</p>
      <p>Tracking: {trackingData.data?.player_count} players</p>
    </div>
  );
}
```

## 后端 API 实现要求

后端需要提供以下轮询端点：

### 1. 设备状态端点
```python
@router.get("/api/v1/devices/{device_id}/status")
async def get_device_status(device_id: str):
    return {
        "device_id": device_id,
        "status": "online",
        "battery": 85,
        "storage": {"used": 2.5, "total": 32},
        "last_seen": datetime.now().isoformat()
    }
```

### 2. 比赛进度端点
```python
@router.get("/api/v1/matches/{match_id}/progress")
async def get_match_progress(match_id: str):
    return {
        "match_id": match_id,
        "status": "ACTIVE",
        "captured_frames": 150,
        "total_frames": 200,
        "percent": 75,
        "devices": {
            "rpi_001": {"captured": 75, "status": "active"},
            "rpi_002": {"captured": 75, "status": "active"}
        }
    }
```

### 3. 最新跟踪数据端点
```python
@router.get("/api/v1/matches/{match_id}/tracking/latest")
async def get_latest_tracking(match_id: str):
    return {
        "timestamp": datetime.now().isoformat(),
        "frame_number": 150,
        "players": [
            {"global_id": 1, "x": 0.5, "y": 0.3, "speed": 5.2},
            {"global_id": 2, "x": 0.7, "y": 0.6, "speed": 3.8}
        ]
    }
```

## 优化建议

### 1. 批量请求
将多个轮询合并为一个请求，减少网络开销：

```typescript
// 批量获取多种数据
const { data } = usePolling({
  url: `/api/v1/matches/${matchId}/dashboard`,
  interval: 2000
});

// 返回包含多种数据的响应
{
  "progress": {...},
  "tracking": {...},
  "stats": {...}
}
```

### 2. 条件轮询
根据状态动态调整轮询频率：

```typescript
const interval = useMemo(() => {
  if (matchStatus === 'ACTIVE') return 1000;      // 比赛中快速轮询
  if (matchStatus === 'PROCESSING') return 2000;  // 处理中正常轮询
  return 5000;                                     // 其他状态慢速轮询
}, [matchStatus]);
```

### 3. 长轮询（可选）
后端实现长轮询，减少无效请求：

```python
@router.get("/api/v1/matches/{match_id}/wait-for-update")
async def wait_for_update(match_id: str, last_update: str):
    # 等待数据更新或超时（最多30秒）
    for i in range(30):
        if has_new_data(match_id, last_update):
            return get_new_data(match_id)
        await asyncio.sleep(1)
    
    return {"status": "no_update"}
```

## 性能对比

| 方面 | WebSocket | HTTP 轮询 |
|------|-----------|-----------|
| 延迟 | 极低（<100ms） | 取决于轮询间隔 |
| 服务器负载 | 低（长连接） | 较高（频繁请求） |
| 网络流量 | 低（仅传输变化） | 较高（完整响应） |
| 兼容性 | 需要代理支持 | 所有环境支持 |
| 实现复杂度 | 中等 | 简单 |

## 迁移步骤

1. **安装依赖**：无需额外依赖

2. **替换 WebSocket 连接**：
```typescript
// 旧代码
const ws = new WebSocket('wss://...');
ws.onmessage = (e) => {...};

// 新代码
const { data } = usePolling({
  url: '/api/...',
  onData: (data) => {...}
});
```

3. **更新组件**：使用 `PlayerBindingWithPolling` 替代原有组件

4. **部署**：正常推送到 GitHub，Vercel 自动部署

## 限制说明

1. **实时性降低**：轮询间隔决定了数据更新延迟
2. **流量增加**：每次轮询都是完整的 HTTP 请求
3. **服务器压力**：需要处理更多请求

## 后续优化

当后端服务器配置 SSL 证书后，可以：
1. 恢复使用 WebSocket（wss://）
2. 实现 Server-Sent Events (SSE)
3. 使用 WebRTC 进行点对点通信

## 总结

虽然 HTTP 轮询不如 WebSocket 高效，但它：
- ✅ 完全兼容 HTTPS 环境
- ✅ 不需要特殊代理配置
- ✅ 实现简单，易于维护
- ✅ 可以实现文档中描述的所有功能

对于当前的足球场数据采集和分析需求，轮询方案完全可以满足。