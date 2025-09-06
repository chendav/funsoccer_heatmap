// Test script to debug Authing SDK connection
const { AuthenticationClient } = require('authing-js-sdk');

// Read environment variables
require('dotenv').config({ path: '.env.local' });

const authingConfig = {
  domain: process.env.NEXT_PUBLIC_AUTHING_DOMAIN || '',
  appId: process.env.NEXT_PUBLIC_AUTHING_APP_ID || '',
};

console.log('Authing Config:', {
  domain: authingConfig.domain,
  appId: authingConfig.appId,
  appHost: `https://${authingConfig.domain}`,
});

if (!authingConfig.domain || !authingConfig.appId) {
  console.error('❌ Missing Authing configuration!');
  console.log('Please ensure NEXT_PUBLIC_AUTHING_DOMAIN and NEXT_PUBLIC_AUTHING_APP_ID are set in .env.local');
  process.exit(1);
}

// Create Authing client
const authingClient = new AuthenticationClient({
  appId: authingConfig.appId,
  appHost: `https://${authingConfig.domain}`,
  timeout: 30000, // 30 seconds timeout
  onError: (code, message, data) => {
    console.error('Authing Error:', { code, message, data });
  }
});

// Test basic connection
console.log('\n📡 Testing Authing connection...');

// Test login with dummy credentials
async function testLogin() {
  try {
    console.log('\n🔐 Testing login with test credentials...');
    const result = await authingClient.loginByEmail('test@example.com', 'TestPassword123');
    console.log('✅ Login successful:', result);
  } catch (error) {
    console.log('❌ Login failed (expected for invalid credentials)');
    console.log('Error details:', {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      data: error.data
    });
    
    // Check if it's a network error or authentication error
    if (error.message && error.message.includes('Network')) {
      console.error('\n🚨 Network Error: Cannot connect to Authing server');
      console.log('Possible causes:');
      console.log('1. Invalid domain: Check if NEXT_PUBLIC_AUTHING_DOMAIN is correct');
      console.log('2. Network issues: Check internet connection');
      console.log('3. CORS issues: Check Authing app settings');
    } else if (error.code === 2003 || error.message?.includes('用户不存在')) {
      console.log('\n✅ Connection successful! (User not found is expected)');
    } else {
      console.log('\n⚠️ Unexpected error type');
    }
  }
}

// Test getting application details
async function testAppDetails() {
  try {
    console.log('\n📋 Getting application details...');
    // This doesn't require authentication
    const result = await authingClient.checkLoginStatus();
    console.log('Login status:', result);
  } catch (error) {
    console.log('Check status error:', error.message);
  }
}

// Run tests
async function runTests() {
  await testLogin();
  await testAppDetails();
  
  console.log('\n✅ Test completed');
  console.log('\nIf you see network errors, please check:');
  console.log('1. Your .env.local file has correct NEXT_PUBLIC_AUTHING_DOMAIN and NEXT_PUBLIC_AUTHING_APP_ID');
  console.log('2. The Authing app is properly configured');
  console.log('3. Your network can reach the Authing servers');
}

runTests().catch(console.error);