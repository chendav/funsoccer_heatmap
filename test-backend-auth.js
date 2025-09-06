// 测试前端到后端的认证流程
const { AuthenticationClient } = require('authing-js-sdk');
require('dotenv').config({ path: '.env.local' });

const authingConfig = {
  domain: process.env.NEXT_PUBLIC_AUTHING_DOMAIN || '',
  appId: process.env.NEXT_PUBLIC_AUTHING_APP_ID || '',
};

const authingClient = new AuthenticationClient({
  appId: authingConfig.appId,
  appHost: `https://${authingConfig.domain}`,
  timeout: 30000,
});

// 使用实际的后端地址
const API_BASE = 'http://47.239.73.57:8000';

// 测试账号
const testUser = {
  email: 'test@funsoccer.com',
  password: 'TestUser123!'
};

async function testAuthFlow() {
  try {
    console.log('🔐 1. 登录到 Authing...');
    const loginResult = await authingClient.loginByEmail(testUser.email, testUser.password);
    
    console.log('✅ 登录成功');
    console.log('User ID:', loginResult.id);
    console.log('Token:', loginResult.token);
    
    if (!loginResult.token) {
      console.error('❌ 没有获取到 token');
      return;
    }
    
    // 测试调用后端 API
    console.log('\n📡 2. 测试调用后端 API...');
    console.log('API Base:', API_BASE);
    
    // 测试获取用户统计数据
    const testEndpoints = [
      {
        name: '用户统计',
        url: `${API_BASE}/api/user/stats?days=30`,
        method: 'GET'
      },
      {
        name: '用户隐私设置',
        url: `${API_BASE}/api/user/privacy`,
        method: 'GET'
      },
      {
        name: '用户比赛记录',
        url: `${API_BASE}/api/identity/matches?limit=10&offset=0`,
        method: 'GET'
      }
    ];
    
    for (const endpoint of testEndpoints) {
      console.log(`\n📍 测试 ${endpoint.name}...`);
      console.log(`URL: ${endpoint.url}`);
      
      try {
        const response = await fetch(endpoint.url, {
          method: endpoint.method,
          headers: {
            'Authorization': `Bearer ${loginResult.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`状态码: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ 成功获取数据');
          console.log('响应预览:', JSON.stringify(data).substring(0, 200) + '...');
        } else {
          const errorText = await response.text();
          console.log(`❌ 请求失败: ${response.status} ${response.statusText}`);
          console.log('错误详情:', errorText.substring(0, 200));
        }
      } catch (error) {
        console.error(`❌ 网络错误:`, error.message);
      }
    }
    
    // 测试同步用户到后端
    console.log('\n📤 3. 同步用户信息到后端...');
    try {
      const syncResponse = await fetch(`${API_BASE}/api/user/sync-authing-user`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${loginResult.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: loginResult.id,
          username: loginResult.username,
          email: loginResult.email,
          nickname: loginResult.nickname,
          avatar: loginResult.photo,
          phone: loginResult.phone,
          created_at: loginResult.createdAt,
          updated_at: loginResult.updatedAt
        })
      });
      
      console.log(`同步状态码: ${syncResponse.status}`);
      
      if (syncResponse.ok) {
        const syncData = await syncResponse.json();
        console.log('✅ 用户信息同步成功');
        console.log('同步结果:', syncData);
      } else {
        const errorText = await syncResponse.text();
        console.log(`❌ 同步失败: ${syncResponse.status}`);
        console.log('错误:', errorText);
      }
    } catch (error) {
      console.error('❌ 同步请求失败:', error.message);
    }
    
    console.log('\n✅ 测试完成');
    console.log('\n📋 总结:');
    console.log('1. Authing 登录: ✅ 正常');
    console.log('2. Token 获取: ' + (loginResult.token ? '✅ 成功' : '❌ 失败'));
    console.log('3. 后端 API 调用: 查看上方结果');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 运行测试
testAuthFlow();