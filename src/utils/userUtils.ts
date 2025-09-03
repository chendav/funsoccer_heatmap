import { AuthingUser } from '@/lib/authing';

/**
 * 用户信息工具函数
 */

// 获取用户ID
export function getUserId(user: AuthingUser | null): string | null {
  return user?.id || null;
}

// 获取用户显示名称（优先级：nickname > username > email）
export function getUserDisplayName(user: AuthingUser | null): string {
  if (!user) return '用户';
  return user.nickname || user.username || user.email || '用户';
}

// 获取用户头像（如果没有则返回默认头像）
export function getUserAvatar(user: AuthingUser | null): string {
  return user?.avatar || '/default-avatar.png';
}

// 检查用户是否已认证
export function isUserAuthenticated(user: AuthingUser | null): boolean {
  return user !== null && !!user.id;
}

// 获取用户邮箱
export function getUserEmail(user: AuthingUser | null): string | null {
  return user?.email || null;
}

// 获取用户手机号
export function getUserPhone(user: AuthingUser | null): string | null {
  return user?.phone || null;
}

// 获取用户注册时间
export function getUserCreatedAt(user: AuthingUser | null): Date | null {
  if (!user?.createdAt) return null;
  return typeof user.createdAt === 'string' ? new Date(user.createdAt) : user.createdAt;
}

// 格式化用户信息用于API请求
export function formatUserForAPI(user: AuthingUser | null) {
  if (!user) return null;
  
  return {
    userId: user.id,
    username: user.username,
    email: user.email,
    phone: user.phone,
    nickname: user.nickname,
    avatar: user.avatar,
  };
}

// 用户信息调试工具
export function debugUserInfo(user: AuthingUser | null) {
  if (!user) {
    console.log('🔒 User not authenticated');
    return;
  }
  
  console.log('👤 User Info:', {
    id: user.id,
    username: user.username,
    email: user.email,
    phone: user.phone,
    nickname: user.nickname,
    avatar: user.avatar,
    createdAt: user.createdAt,
  });
}