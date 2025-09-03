/**
 * 用户ID管理工具
 * 临时解决方案，用于生成和管理唯一用户标识
 */

interface UserSession {
  userId: string;
  nickname?: string;
  email?: string;
  createdAt: string;
  lastActiveAt: string;
}

const USER_STORAGE_KEY = 'funsoccer_user_session';

/**
 * 生成唯一用户ID
 */
export function generateUserId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `user_${timestamp}_${random}`;
}

/**
 * 获取或创建用户会话
 */
export function getUserSession(): UserSession {
  try {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    if (stored) {
      const session: UserSession = JSON.parse(stored);
      // 更新最后活跃时间
      session.lastActiveAt = new Date().toISOString();
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(session));
      return session;
    }
  } catch (error) {
    console.warn('Failed to load user session from localStorage:', error);
  }

  // 创建新用户会话
  const newSession: UserSession = {
    userId: generateUserId(),
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString()
  };

  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newSession));
  } catch (error) {
    console.warn('Failed to save user session to localStorage:', error);
  }

  return newSession;
}

/**
 * 更新用户信息
 */
export function updateUserSession(updates: Partial<Pick<UserSession, 'nickname' | 'email'>>): UserSession {
  const session = getUserSession();
  const updatedSession = {
    ...session,
    ...updates,
    lastActiveAt: new Date().toISOString()
  };

  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedSession));
  } catch (error) {
    console.warn('Failed to update user session:', error);
  }

  return updatedSession;
}

/**
 * 获取用户ID（向后兼容）
 */
export function getCurrentUserId(): string {
  return getUserSession().userId;
}

/**
 * 清除用户会话（用于测试或重置）
 */
export function clearUserSession(): void {
  try {
    localStorage.removeItem(USER_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear user session:', error);
  }
}

/**
 * 检查是否为新用户
 */
export function isNewUser(): boolean {
  const session = getUserSession();
  const created = new Date(session.createdAt);
  const now = new Date();
  const diffMinutes = (now.getTime() - created.getTime()) / (1000 * 60);
  
  // 如果创建时间在5分钟内，且没有昵称，认为是新用户
  return diffMinutes < 5 && !session.nickname;
}

/**
 * 导出用户数据（用于备份）
 */
export function exportUserData(): string {
  const session = getUserSession();
  return JSON.stringify(session, null, 2);
}

/**
 * 导入用户数据（用于恢复）
 */
export function importUserData(jsonData: string): boolean {
  try {
    const session: UserSession = JSON.parse(jsonData);
    if (session.userId && session.createdAt) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(session));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to import user data:', error);
    return false;
  }
}