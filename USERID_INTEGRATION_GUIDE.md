# 🆔 用户ID集成使用指南

现在FunSoccer已经有了完整的用户认证系统，可以获取用户的唯一标识符和相关信息。

## 🔑 可用的用户信息

### 主要字段
```typescript
interface AuthingUser {
  id: string;           // 🆔 唯一用户ID (主键)
  username?: string;    // 👤 用户名
  email?: string;       // 📧 邮箱地址
  phone?: string;       // 📱 手机号
  nickname?: string;    // 🏷️ 显示名称
  avatar?: string;      // 🖼️ 头像URL
  createdAt?: Date;     // ⏰ 注册时间
  updatedAt?: Date;     // 🔄 最后更新时间
}
```

## 📝 使用方法

### 1. 在React组件中获取用户信息
```typescript
import { useAuth } from '@/contexts/AuthContext';
import { getUserId, getUserDisplayName } from '@/utils/userUtils';

function MyComponent() {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <div>请先登录</div>;
  }
  
  const userId = getUserId(user);           // 获取用户ID
  const displayName = getUserDisplayName(user); // 获取显示名称
  
  return (
    <div>
      <p>用户ID: {userId}</p>
      <p>欢迎: {displayName}</p>
    </div>
  );
}
```

### 2. 在API请求中使用用户ID
```typescript
import { useAuth } from '@/contexts/AuthContext';
import { getUserId } from '@/utils/userUtils';

function useUserData() {
  const { user } = useAuth();
  const userId = getUserId(user);
  
  const saveUserData = async (data: any) => {
    if (!userId) {
      throw new Error('用户未登录');
    }
    
    const response = await fetch('/api/user-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,        // 用户ID
        ...data               // 其他数据
      })
    });
    
    return response.json();
  };
  
  return { saveUserData };
}
```

### 3. 替换硬编码的用户ID
在现有代码中，有很多地方使用了硬编码的用户ID，现在可以替换：

**之前（硬编码）:**
```typescript
// ❌ 硬编码用户ID
const response = await fetch('/api/data', {
  body: JSON.stringify({
    user_id: 1,  // 硬编码
    // ...
  })
});
```

**现在（动态用户ID）:**
```typescript
// ✅ 使用真实用户ID
import { useAuth } from '@/contexts/AuthContext';
import { getUserId } from '@/utils/userUtils';

const { user } = useAuth();
const userId = getUserId(user);

const response = await fetch('/api/data', {
  body: JSON.stringify({
    user_id: userId,  // 真实用户ID
    // ...
  })
});
```

## 🎯 具体应用场景

### 1. 足球数据关联
```typescript
// 保存用户的比赛数据
const saveMatchData = async (matchData: any) => {
  const userId = getUserId(user);
  
  return fetch('/api/matches', {
    method: 'POST',
    body: JSON.stringify({
      userId: userId,
      matchId: matchData.matchId,
      playerStats: matchData.stats,
      timestamp: Date.now()
    })
  });
};
```

### 2. 个人统计查询
```typescript
// 获取用户的历史统计
const getUserStats = async () => {
  const userId = getUserId(user);
  
  const response = await fetch(`/api/stats?userId=${userId}`);
  return response.json();
};
```

### 3. 球员绑定功能更新
在现有的球员绑定代码中使用真实用户ID：

```typescript
// src/app/page.tsx 中的球员绑定逻辑
import { useAuth } from '@/contexts/AuthContext';
import { getUserId } from '@/utils/userUtils';

function Home() {
  const { user } = useAuth();
  
  const handlePlayerBinding = async () => {
    const userId = getUserId(user);
    
    if (!userId) {
      alert('请先登录');
      return;
    }
    
    const response = await fetch('/api/identity/recognize', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,  // 使用真实用户ID
        match_id: selectedMatch,
        trajectory: trajectory
      })
    });
  };
}
```

## 🔧 工具函数

已创建了 `src/utils/userUtils.ts` 提供便利函数：

```typescript
import { 
  getUserId,           // 获取用户ID
  getUserDisplayName,  // 获取显示名称
  getUserAvatar,       // 获取头像
  isUserAuthenticated, // 检查登录状态
  formatUserForAPI,    // 格式化用于API
  debugUserInfo        // 调试用户信息
} from '@/utils/userUtils';
```

## 🎨 用户信息展示组件

已创建 `src/components/UserProfile.tsx` 用于展示用户信息：

```typescript
import UserProfile from '@/components/UserProfile';

// 在任何页面中使用
<UserProfile />
```

## 📊 数据库设计建议

### 后端数据库表结构更新
```sql
-- 用户相关表应该使用 Authing 用户ID
CREATE TABLE user_match_sessions (
  id SERIAL PRIMARY KEY,
  authing_user_id VARCHAR(50) NOT NULL,  -- Authing用户ID
  match_id VARCHAR(100) NOT NULL,
  global_id INTEGER,
  confidence DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_statistics (
  id SERIAL PRIMARY KEY,
  authing_user_id VARCHAR(50) NOT NULL,  -- Authing用户ID
  match_date DATE NOT NULL,
  distance_km DECIMAL(5,2),
  max_speed_kmh DECIMAL(4,1),
  avg_speed_kmh DECIMAL(4,1),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔄 迁移现有数据

如果有现有的用户数据需要迁移：

1. **添加新字段**: 在现有表中添加 `authing_user_id` 字段
2. **数据映射**: 建立老用户ID与Authing用户ID的映射关系
3. **渐进式迁移**: 新用户使用Authing ID，老用户逐步迁移

## 🎉 现在可以做的事情

✅ **个性化体验**: 根据用户ID提供个性化数据
✅ **数据持久化**: 保存用户的比赛历史和统计信息  
✅ **社交功能**: 用户之间的互动和排行榜
✅ **权限控制**: 基于用户身份的功能访问控制
✅ **数据分析**: 用户行为分析和使用统计

---

**🎯 总结**: 现在FunSoccer拥有了完整的用户身份系统，每个用户都有唯一的ID，可以用于关联所有个人数据，为构建更丰富的功能奠定了基础！