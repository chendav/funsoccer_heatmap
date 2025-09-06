// Script to register a test user in Authing
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

// Create Authing client
const authingClient = new AuthenticationClient({
  appId: authingConfig.appId,
  appHost: `https://${authingConfig.domain}`,
  timeout: 30000,
  onError: (code, message, data) => {
    console.error('Authing Error:', { code, message, data });
  }
});

// Test user credentials
const testUser = {
  email: 'test@funsoccer.com',
  password: 'TestUser123!',
  username: 'testuser'
};

async function registerTestUser() {
  try {
    console.log('\n📝 Registering test user...');
    console.log('Email:', testUser.email);
    console.log('Username:', testUser.username);
    
    const result = await authingClient.registerByEmail(
      testUser.email, 
      testUser.password
    );
    
    console.log('\n✅ User registered successfully!');
    console.log('User ID:', result.id);
    console.log('Email:', result.email);
    console.log('Token:', result.token);
    
    console.log('\n📋 Test credentials:');
    console.log('Email:', testUser.email);
    console.log('Password:', testUser.password);
    
    return result;
  } catch (error) {
    if (error.message && error.message.includes('用户已存在')) {
      console.log('\n⚠️ User already exists, trying to login...');
      
      try {
        const loginResult = await authingClient.loginByEmail(
          testUser.email,
          testUser.password
        );
        
        console.log('\n✅ Login successful!');
        console.log('User ID:', loginResult.id);
        console.log('Token:', loginResult.token);
        
        console.log('\n📋 Test credentials:');
        console.log('Email:', testUser.email);
        console.log('Password:', testUser.password);
        
        return loginResult;
      } catch (loginError) {
        console.error('\n❌ Login failed:', loginError.message);
        console.log('\nThe user exists but login failed. The password might be different.');
        console.log('Try logging in with the original password you used when registering.');
      }
    } else {
      console.error('\n❌ Registration failed:', error.message);
      console.error('Error details:', error);
    }
  }
}

// Run the registration
registerTestUser()
  .then(() => {
    console.log('\n✅ Process completed');
    console.log('\nYou can now test login in the web app with:');
    console.log('Email:', testUser.email);
    console.log('Password:', testUser.password);
  })
  .catch(console.error);