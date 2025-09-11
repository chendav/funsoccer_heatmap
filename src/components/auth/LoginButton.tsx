"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface LoginButtonProps {
  className?: string;
}

export default function LoginButton({ className }: LoginButtonProps) {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();

  const handleLogin = () => {
    // Redirect to Authing hosted login page
    const authingDomain = process.env.NEXT_PUBLIC_AUTHING_DOMAIN;
    const appId = process.env.NEXT_PUBLIC_AUTHING_APP_ID;
    
    // Check if required config is present
    if (!authingDomain || !appId) {
      console.error('Authing configuration missing:', { authingDomain, appId });
      alert('Authentication configuration is missing. Please check environment variables.');
      return;
    }
    
    // Determine redirect URI based on environment
    let redirectUri = '';
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname === 'localhost') {
        redirectUri = 'http://localhost:3000/api/auth/callback';
      } else if (hostname === 'funsoccer.app' || hostname === 'www.funsoccer.app') {
        // Production domain
        redirectUri = 'https://funsoccer.app/api/auth/callback';
      } else if (hostname.includes('vercel.app')) {
        // Always use the main Vercel alias for consistency
        redirectUri = 'https://soccer-heatmap-next.vercel.app/api/auth/callback';
      } else {
        // Fallback to current origin
        redirectUri = `${window.location.origin}/api/auth/callback`;
      }
    }
    
    // Build OIDC URL with correct parameters
    const state = Math.random().toString(36).substring(7);
    const nonce = Math.random().toString(36).substring(7);
    
    // Use space-separated scope as per OIDC spec
    const scope = 'openid profile email phone';
    
    // Debug output
    console.log('=== Authing OIDC Debug ===');
    console.log('Redirect URI:', redirectUri);
    console.log('App ID:', appId);
    
    // Build OIDC authorization URL
    // Important: The order and format must match OIDC spec exactly
    const params = new URLSearchParams();
    params.append('client_id', appId);
    params.append('redirect_uri', redirectUri);
    params.append('scope', scope);
    params.append('response_type', 'code');
    params.append('state', state);
    params.append('nonce', nonce);
    params.append('prompt', 'login');
    
    const authingLoginUrl = `https://${authingDomain}/oidc/auth?${params.toString()}`;
    
    console.log('OIDC URL:', authingLoginUrl);
    
    window.location.href = authingLoginUrl;
  };

  const handleLogout = async () => {
    await logout();
    // Optionally redirect to Authing logout
    const authingDomain = process.env.NEXT_PUBLIC_AUTHING_DOMAIN;
    const redirectUri = encodeURIComponent(window.location.origin);
    window.location.href = `https://${authingDomain}/oidc/session/end?post_logout_redirect_uri=${redirectUri}`;
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
          onClick={() => router.push('/dashboard')}
          className="text-blue-600 hover:text-blue-800"
        >
          仪表板
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/leaderboard')}
          className="text-green-600 hover:text-green-800"
        >
          排行榜
        </Button>
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
    <Button
      onClick={handleLogin}
      className={className}
    >
      登录
    </Button>
  );
}