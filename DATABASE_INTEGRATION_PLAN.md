# 🔗 数据库整合方案

基于完整系统流程分析，优化现有数据库设计以更好地支持用户认证和数据处理流程。

## 📊 当前数据流程分析

### **现有数据模型**（核心系统）：
```
RawData → ProcessedData → PlayerStats
    ↓
MatchSession → MatchFrame → PlayerTrajectory
```

### **新增用户模型**（认证系统）：
```
AuthingUser → UserMatchSession → UserStatistics
    ↓
UserPrivacySettings → LeaderboardData
```

## 🔧 关键整合问题

### **问题1: 数据关联缺失**
- 现有的 `PlayerStats` 使用 `global_id` 标识球员
- 新的 `UserStatistics` 使用 `authing_user_id` 标识用户
- **缺少两者之间的关联桥梁**

### **问题2: 数据重复**
- `PlayerStats` 和 `UserStatistics` 存储类似的统计数据
- 可能导致数据不一致和存储浪费

### **问题3: 匹配流程断层**
- 用户点击匹配 → `global_id` 绑定 → 但缺少持久化的用户-球员映射

## 🚀 优化解决方案

### **方案1: 添加用户-球员映射表**

```sql
CREATE TABLE user_player_bindings (
    id SERIAL PRIMARY KEY,
    authing_user_id VARCHAR(50) NOT NULL,
    match_id VARCHAR(100) NOT NULL,
    global_id INTEGER NOT NULL,
    
    -- 绑定元数据
    binding_timestamp TIMESTAMP DEFAULT NOW(),
    confidence DECIMAL(3,2), -- 匹配置信度
    binding_method VARCHAR(20) DEFAULT 'click', -- click, auto, manual
    
    -- 状态控制
    is_active BOOLEAN DEFAULT TRUE,
    verified BOOLEAN DEFAULT FALSE, -- 是否已验证绑定
    
    -- 审计信息
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- 约束
    UNIQUE(authing_user_id, match_id), -- 一个用户在一场比赛中只能绑定一个球员
    UNIQUE(match_id, global_id), -- 一个球员在一场比赛中只能被一个用户绑定
    
    -- 外键关联
    FOREIGN KEY (authing_user_id) REFERENCES authing_users(id),
    FOREIGN KEY (match_id, global_id) REFERENCES player_stats(match_id, global_id)
);
```

### **方案2: 重构统计数据关系**

#### **2.1 保留现有 PlayerStats（系统级统计）**
```sql
-- 现有表，包含所有球员的客观统计数据
-- 数据来源：ByteTrack跟踪结果 + 轨迹分析
PlayerStats: match_id + global_id → 系统计算的客观数据
```

#### **2.2 简化 UserStatistics（用户级视图）**
```sql
CREATE TABLE user_match_summaries (
    id SERIAL PRIMARY KEY,
    authing_user_id VARCHAR(50) NOT NULL,
    match_id VARCHAR(100) NOT NULL,
    
    -- 关联绑定
    binding_id INTEGER REFERENCES user_player_bindings(id),
    
    -- 用户个性化数据（非统计数据）
    user_notes TEXT, -- 用户自己的比赛笔记
    user_rating INTEGER CHECK(user_rating >= 1 AND user_rating <= 5), -- 自评分
    highlights JSON, -- 用户标记的精彩时刻
    
    -- 隐私控制
    is_private BOOLEAN DEFAULT TRUE,
    share_with_team BOOLEAN DEFAULT FALSE,
    
    -- 时间戳
    match_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- 外键约束
    FOREIGN KEY (authing_user_id) REFERENCES authing_users(id),
    FOREIGN KEY (match_id) REFERENCES matches(match_id),
    
    -- 唯一约束
    UNIQUE(authing_user_id, match_id)
);
```

### **方案3: 创建统计数据视图**

```sql
-- 创建用户统计视图，结合系统数据和用户数据
CREATE VIEW user_statistics_view AS
SELECT 
    ums.authing_user_id,
    ums.match_id,
    ums.match_date,
    
    -- 从 PlayerStats 获取客观统计数据
    ps.total_distance,
    ps.average_speed,
    ps.max_speed,
    ps.active_time,
    ps.data_points,
    
    -- 从绑定表获取匹配信息
    upb.global_id,
    upb.confidence,
    upb.binding_method,
    
    -- 从用户摘要获取主观数据
    ums.user_rating,
    ums.user_notes,
    ums.highlights,
    
    -- 隐私控制
    ums.is_private,
    ums.share_with_team,
    
    -- 计算字段
    CASE 
        WHEN ps.total_distance > 10 THEN 'high'
        WHEN ps.total_distance > 5 THEN 'medium'
        ELSE 'low'
    END as activity_level
    
FROM user_match_summaries ums
JOIN user_player_bindings upb ON ums.binding_id = upb.id
LEFT JOIN player_stats ps ON upb.match_id = ps.match_id AND upb.global_id = ps.global_id;
```

## 🔄 API层调整

### **更新用户统计API**：
```python
# backend/app/api/user_privacy.py
@router.get("/stats", response_model=UserStatsResponse)
async def get_user_stats(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user_from_authing)
):
    """获取用户统计数据 - 使用视图查询"""
    
    # 使用统计视图查询
    stats_query = text("""
        SELECT * FROM user_statistics_view 
        WHERE authing_user_id = :user_id 
        AND match_date >= :start_date
        ORDER BY match_date DESC
    """)
    
    result = db.execute(stats_query, {
        "user_id": current_user,
        "start_date": datetime.utcnow() - timedelta(days=days)
    }).fetchall()
    
    # 聚合统计
    total_distance = sum(row.total_distance or 0 for row in result)
    avg_speed = sum(row.average_speed or 0 for row in result) / max(len(result), 1)
    # ... 其他聚合计算
```

### **更新球员绑定API**：
```python
# backend/app/api/identity.py
@router.post("/recognize")
async def recognize_player(
    request: RecognizeRequest,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user_from_authing)
):
    """球员识别 - 创建持久化绑定"""
    
    # 执行识别算法（现有逻辑）
    recognition_result = await perform_recognition(request)
    
    if recognition_result["success"]:
        # 创建用户-球员绑定记录
        binding = UserPlayerBinding(
            authing_user_id=current_user,
            match_id=request.match_id,
            global_id=recognition_result["global_id"],
            confidence=recognition_result["confidence"],
            binding_method="click"
        )
        db.add(binding)
        
        # 创建用户比赛摘要
        summary = UserMatchSummary(
            authing_user_id=current_user,
            match_id=request.match_id,
            binding_id=binding.id,
            match_date=datetime.utcnow().date()
        )
        db.add(summary)
        
        db.commit()
        
    return recognition_result
```

## 🎯 迁移策略

### **阶段1: 渐进式迁移**
1. **保留现有数据结构** - 确保系统正常运行
2. **添加新的映射表** - `user_player_bindings`, `user_match_summaries`
3. **创建数据视图** - `user_statistics_view`
4. **更新API层** - 使用新的数据关系

### **阶段2: 数据清理**
1. **迁移历史数据** - 将现有绑定关系迁移到新表
2. **验证数据一致性** - 确保统计数据准确
3. **移除冗余表** - 删除 `UserStatistics` 表（如果确认不需要）

### **阶段3: 性能优化**
1. **创建索引** - 优化查询性能
2. **缓存策略** - 对频繁查询的统计数据进行缓存
3. **监控调优** - 监控系统性能并优化

## 📋 总结

### **优化后的优势**：
1. **数据一致性** - 统计数据来源唯一，避免不一致
2. **关系清晰** - 用户-球员-统计数据的关系明确
3. **扩展性强** - 支持复杂的查询和分析需求
4. **隐私可控** - 细粒度的隐私控制机制
5. **性能优化** - 通过视图和索引优化查询性能

### **核心改进**：
- ✅ 解决了用户-球员映射的持久化问题
- ✅ 避免了统计数据的重复存储
- ✅ 保持了现有系统的完整性
- ✅ 提供了清晰的数据访问接口