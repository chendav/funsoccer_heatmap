import { AuthenticationClient } from 'authing-js-sdk';

// Authing 配置
const authingConfig = {
  domain: process.env.NEXT_PUBLIC_AUTHING_DOMAIN || '',
  appId: process.env.NEXT_PUBLIC_AUTHING_APP_ID || '',
  appSecret: process.env.AUTHING_APP_SECRET || '',
  redirectUri: process.env.NEXTAUTH_URL || 'http://localhost:3000',
};

// Debug logging
if (typeof window !== 'undefined') {
  console.log('[Authing Init] Environment variables:', {
    domain: authingConfig.domain || 'NOT SET',
    appId: authingConfig.appId || 'NOT SET',
    hasAppSecret: !!authingConfig.appSecret,
    redirectUri: authingConfig.redirectUri,
  });
}

// 创建 Authing 客户端
export const authingClient = new AuthenticationClient({
  appId: authingConfig.appId,
  appHost: `https://${authingConfig.domain}`,
  timeout: 30000, // 30 seconds timeout
  onError: (code: number, message: string, data: any) => {
    console.error('[Authing Global Error]:', { code, message, data });
  },
});

// 用户信息类型
export interface AuthingUser {
  id: string;
  username?: string;
  email?: string;
  phone?: string;
  nickname?: string;
  avatar?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  [key: string]: any; // 允许其他属性
}

// 登录响应类型
export interface LoginResponse {
  code: number;
  message: string;
  data?: {
    access_token: string;
    id_token: string;
    refresh_token: string;
    token_type: string;
    expire_in: number;
    user: AuthingUser;
  };
}

// 用户名密码登录
export async function loginWithPassword(username: string, password: string): Promise<LoginResponse> {
  try {
    const response = await authingClient.loginByUsername(username, password);
    return {
      code: 200,
      message: '登录成功',
      data: {
        access_token: (response as any).token || '',
        id_token: (response as any).token || '',
        refresh_token: (response as any).token || '',
        token_type: 'Bearer',
        expire_in: 7200,
        user: response as AuthingUser,
      },
    };
  } catch (error: any) {
    return {
      code: error.code || 500,
      message: error.message || '登录失败',
    };
  }
}

// 邮箱密码登录
export async function loginWithEmail(email: string, password: string): Promise<LoginResponse> {
  try {
    console.log('[Authing] Attempting email login for:', email);
    console.log('[Authing] Config:', {
      appId: authingConfig.appId,
      appHost: `https://${authingConfig.domain}`,
    });
    
    const response = await authingClient.loginByEmail(email, password);
    
    console.log('[Authing] Login response:', response);
    
    return {
      code: 200,
      message: '登录成功',
      data: {
        access_token: (response as any).token || '',
        id_token: (response as any).token || '',
        refresh_token: (response as any).token || '',
        token_type: 'Bearer',
        expire_in: 7200,
        user: response as AuthingUser,
      },
    };
  } catch (error: any) {
    console.error('[Authing] Login error:', {
      code: error.code,
      message: error.message,
      error: error,
    });
    
    return {
      code: error.code || 500,
      message: error.message || '登录失败',
    };
  }
}

// 手机号验证码登录
export async function loginWithPhoneCode(phone: string, code: string): Promise<LoginResponse> {
  try {
    const response = await authingClient.loginByPhoneCode(phone, code);
    return {
      code: 200,
      message: '登录成功',
      data: {
        access_token: (response as any).token || '',
        id_token: (response as any).token || '',
        refresh_token: (response as any).token || '',
        token_type: 'Bearer',
        expire_in: 7200,
        user: response as AuthingUser,
      },
    };
  } catch (error: any) {
    return {
      code: error.code || 500,
      message: error.message || '登录失败',
    };
  }
}

// 发送短信验证码
export async function sendSmsCode(phone: string): Promise<{code: number; message: string}> {
  try {
    const response = await authingClient.sendSmsCode(phone);
    return {
      code: 200,
      message: '验证码发送成功',
    };
  } catch (error: any) {
    return {
      code: error.code || 500,
      message: error.message || '发送失败',
    };
  }
}

// 用户注册
export async function registerWithEmail(email: string, password: string, username?: string): Promise<LoginResponse> {
  try {
    const response = await authingClient.registerByEmail(email, password);
    return {
      code: 200,
      message: '注册成功',
      data: {
        access_token: (response as any).token || '',
        id_token: (response as any).token || '',
        refresh_token: (response as any).token || '',
        token_type: 'Bearer',
        expire_in: 7200,
        user: response as AuthingUser,
      },
    };
  } catch (error: any) {
    return {
      code: error.code || 500,
      message: error.message || '注册失败',
    };
  }
}

// 刷新令牌
export async function refreshToken(refreshToken: string): Promise<LoginResponse> {
  try {
    const response = await authingClient.refreshToken();
    return {
      code: 200,
      message: '刷新成功',
      data: {
        access_token: (response as any).access_token || (response as any).token || '',
        id_token: (response as any).id_token || (response as any).token || '',
        refresh_token: (response as any).refresh_token || refreshToken,
        token_type: 'Bearer',
        expire_in: (response as any).expires_in || 7200,
        user: response as AuthingUser,
      },
    };
  } catch (error: any) {
    return {
      code: error.code || 500,
      message: error.message || '刷新失败',
    };
  }
}

// 获取用户信息
export async function getCurrentUser(accessToken: string): Promise<{code: number; message: string; user?: AuthingUser}> {
  try {
    const response = await authingClient.getCurrentUser();
    return {
      code: 200,
      message: '获取成功',
      user: response as AuthingUser,
    };
  } catch (error: any) {
    return {
      code: error.code || 500,
      message: error.message || '获取用户信息失败',
    };
  }
}

// 登出
export async function logout(accessToken: string): Promise<{code: number; message: string}> {
  try {
    const response = await authingClient.logout();
    return {
      code: 200,
      message: '登出成功',
    };
  } catch (error: any) {
    return {
      code: error.code || 500,
      message: error.message || '登出失败',
    };
  }
}

export default authingClient;