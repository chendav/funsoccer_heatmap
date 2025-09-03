"use client";

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthingUser, getCurrentUser, logout, refreshToken as refreshAuthingToken } from '@/lib/authing';

// 认证状态类型
interface AuthState {
  isAuthenticated: boolean;
  user: AuthingUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

// 认证操作类型
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: AuthingUser; accessToken: string; refreshToken: string } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: AuthingUser }
  | { type: 'CLEAR_ERROR' };

// 初始状态
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  loading: false,
  error: null,
};

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        loading: false,
        error: null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        accessToken: null,
        refreshToken: null,
        loading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...initialState,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}

// Context类型
interface AuthContextType extends AuthState {
  login: (accessToken: string, refreshToken: string, user: AuthingUser) => void;
  logout: () => void;
  updateUser: (user: AuthingUser) => void;
  clearError: () => void;
}

// 创建Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 本地存储键名
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'authing_access_token',
  REFRESH_TOKEN: 'authing_refresh_token',
  USER: 'authing_user',
};

// AuthProvider组件
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 从本地存储加载认证状态
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        const refreshTokenValue = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        const userStr = localStorage.getItem(STORAGE_KEYS.USER);

        if (accessToken && refreshTokenValue && userStr) {
          const user = JSON.parse(userStr);
          
          // 验证token是否仍然有效
          const result = await getCurrentUser(accessToken);
          if (result.code === 200 && result.user) {
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: {
                user: result.user,
                accessToken,
                refreshToken: refreshTokenValue,
              },
            });
          } else {
            // 尝试刷新token
            const refreshResult = await refreshAuthingToken(refreshTokenValue);
            if (refreshResult.code === 200 && refreshResult.data) {
              const { access_token, refresh_token, user: refreshedUser } = refreshResult.data;
              
              // 更新本地存储
              localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access_token);
              localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh_token);
              localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(refreshedUser));
              
              dispatch({
                type: 'AUTH_SUCCESS',
                payload: {
                  user: refreshedUser,
                  accessToken: access_token,
                  refreshToken: refresh_token,
                },
              });
            } else {
              // 刷新失败，清除本地存储
              clearLocalStorage();
              dispatch({ type: 'LOGOUT' });
            }
          }
        }
      } catch (error) {
        console.error('加载认证状态失败:', error);
        clearLocalStorage();
        dispatch({ type: 'LOGOUT' });
      }
    };

    loadAuthState();
  }, []);

  // 清除本地存储
  const clearLocalStorage = () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  };

  // 登录方法
  const login = (accessToken: string, refreshToken: string, user: AuthingUser) => {
    // 保存到本地存储
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

    // 更新状态
    dispatch({
      type: 'AUTH_SUCCESS',
      payload: {
        user,
        accessToken,
        refreshToken,
      },
    });
  };

  // 登出方法
  const logoutHandler = async () => {
    try {
      if (state.accessToken) {
        await logout(state.accessToken);
      }
    } catch (error) {
      console.error('登出请求失败:', error);
    } finally {
      // 无论API调用是否成功，都清除本地状态
      clearLocalStorage();
      dispatch({ type: 'LOGOUT' });
    }
  };

  // 更新用户信息
  const updateUser = (user: AuthingUser) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    dispatch({ type: 'UPDATE_USER', payload: user });
  };

  // 清除错误
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout: logoutHandler,
    updateUser,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// 使用Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}