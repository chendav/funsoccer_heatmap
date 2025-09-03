"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import LoginModal from './LoginModal';

interface LoginButtonProps {
  className?: string;
}

export default function LoginButton({ className }: LoginButtonProps) {
  const { isAuthenticated, user, logout } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleLoginSuccess = (loginData: any) => {
    // LoginModal 会处理登录逻辑
    console.log('登录成功:', loginData);
  };

  const handleLogout = () => {
    logout();
  };

  if (isAuthenticated && user) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <div className="flex items-center space-x-2">
          {user.avatar && (
            <img
              src={user.avatar}
              alt={user.nickname || user.username || '用户头像'}
              className="w-8 h-8 rounded-full object-cover"
            />
          )}
          <span className="text-sm font-medium text-gray-700">
            {user.nickname || user.username || user.email}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="text-gray-600 hover:text-gray-800"
        >
          登出
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button
        onClick={() => setShowLoginModal(true)}
        className={className}
      >
        登录
      </Button>
      
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}