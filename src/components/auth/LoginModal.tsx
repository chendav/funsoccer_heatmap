"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { loginWithPassword, loginWithEmail, loginWithPhoneCode, sendSmsCode, registerWithEmail } from '@/lib/authing';
import { useAuth } from '@/contexts/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}

type LoginMode = 'username' | 'email' | 'phone' | 'register';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const { login } = useAuth();
  const [mode, setMode] = useState<LoginMode>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [sendingCode, setSendingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  // 表单数据
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    code: '',
    confirmPassword: '',
  });

  // 重置表单
  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      phone: '',
      password: '',
      code: '',
      confirmPassword: '',
    });
    setError('');
    setSuccess('');
    setCodeSent(false);
  };

  // 切换模式
  const switchMode = (newMode: LoginMode) => {
    setMode(newMode);
    resetForm();
  };

  // 发送验证码
  const handleSendCode = async () => {
    if (!formData.phone) {
      setError('请输入手机号');
      return;
    }
    
    setSendingCode(true);
    setError('');
    
    try {
      const result = await sendSmsCode(formData.phone);
      if (result.code === 200) {
        setCodeSent(true);
        setSuccess('验证码已发送');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('发送验证码失败');
    } finally {
      setSendingCode(false);
    }
  };

  // 处理登录
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let result;
      
      switch (mode) {
        case 'username':
          if (!formData.username || !formData.password) {
            setError('请输入用户名和密码');
            return;
          }
          result = await loginWithPassword(formData.username, formData.password);
          break;
          
        case 'email':
          if (!formData.email || !formData.password) {
            setError('请输入邮箱和密码');
            return;
          }
          result = await loginWithEmail(formData.email, formData.password);
          break;
          
        case 'phone':
          if (!formData.phone || !formData.code) {
            setError('请输入手机号和验证码');
            return;
          }
          result = await loginWithPhoneCode(formData.phone, formData.code);
          break;
          
        case 'register':
          if (!formData.email || !formData.password || !formData.confirmPassword) {
            setError('请填写所有必填字段');
            return;
          }
          if (formData.password !== formData.confirmPassword) {
            setError('两次输入的密码不一致');
            return;
          }
          result = await registerWithEmail(formData.email, formData.password, formData.username);
          break;
          
        default:
          setError('未知的登录模式');
          return;
      }

      if (result.code === 200 && result.data) {
        setSuccess(mode === 'register' ? '注册成功！' : '登录成功！');
        
        // 使用AuthContext的login方法
        login(result.data.access_token, result.data.refresh_token, result.data.user);
        
        onLoginSuccess(result.data);
        setTimeout(() => {
          onClose();
          resetForm();
        }, 1000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'register' ? '注册账号' : '登录账号'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* 模式切换 */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => switchMode('email')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              mode === 'email'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            邮箱登录
          </button>
          <button
            onClick={() => switchMode('phone')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              mode === 'phone'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            手机登录
          </button>
          <button
            onClick={() => switchMode('register')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              mode === 'register'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            注册
          </button>
        </div>

        {/* 错误信息 */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* 成功信息 */}
        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* 用户名登录 */}
          {mode === 'username' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  用户名
                </label>
                <Input
                  type="text"
                  placeholder="请输入用户名"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  密码
                </label>
                <Input
                  type="password"
                  placeholder="请输入密码"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>
            </>
          )}

          {/* 邮箱登录 */}
          {mode === 'email' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  邮箱
                </label>
                <Input
                  type="email"
                  placeholder="请输入邮箱地址"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  密码
                </label>
                <Input
                  type="password"
                  placeholder="请输入密码"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>
            </>
          )}

          {/* 手机号登录 */}
          {mode === 'phone' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  手机号
                </label>
                <Input
                  type="tel"
                  placeholder="请输入手机号"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  验证码
                </label>
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    placeholder="请输入验证码"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    required
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSendCode}
                    disabled={sendingCode || codeSent}
                    className="whitespace-nowrap"
                  >
                    {sendingCode ? '发送中...' : codeSent ? '已发送' : '发送验证码'}
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* 注册表单 */}
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  用户名 (可选)
                </label>
                <Input
                  type="text"
                  placeholder="请输入用户名"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  邮箱 *
                </label>
                <Input
                  type="email"
                  placeholder="请输入邮箱地址"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  密码 *
                </label>
                <Input
                  type="password"
                  placeholder="请输入密码"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  确认密码 *
                </label>
                <Input
                  type="password"
                  placeholder="请再次输入密码"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  required
                />
              </div>
            </>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? '处理中...' : (mode === 'register' ? '注册' : '登录')}
          </Button>
        </form>

        {mode !== 'register' && (
          <div className="mt-4 text-center">
            <span className="text-gray-600">还没有账号？</span>
            <button
              onClick={() => switchMode('register')}
              className="ml-1 text-blue-600 hover:text-blue-800 font-medium"
            >
              立即注册
            </button>
          </div>
        )}

        {mode === 'register' && (
          <div className="mt-4 text-center">
            <span className="text-gray-600">已有账号？</span>
            <button
              onClick={() => switchMode('email')}
              className="ml-1 text-blue-600 hover:text-blue-800 font-medium"
            >
              立即登录
            </button>
          </div>
        )}
      </div>
    </div>
  );
}