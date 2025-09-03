#!/usr/bin/env node

// Pre-deployment check script for FunSoccer with Authing integration

const fs = require('fs');
const path = require('path');

console.log('🚀 FunSoccer Pre-deployment Check');
console.log('=====================================');

// Check required files
const requiredFiles = [
  'src/lib/authing.ts',
  'src/contexts/AuthContext.tsx',
  'src/components/auth/LoginModal.tsx',
  'src/components/auth/LoginButton.tsx',
  'vercel.json',
  '.env.example'
];

console.log('\n📁 Checking required files...');
let missingFiles = [];

requiredFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    missingFiles.push(file);
  }
});

// Check environment variables template
console.log('\n🔐 Checking environment variables template...');
const envExamplePath = path.join(process.cwd(), '.env.example');
if (fs.existsSync(envExamplePath)) {
  const envContent = fs.readFileSync(envExamplePath, 'utf8');
  
  const requiredEnvVars = [
    'NEXT_PUBLIC_AUTHING_DOMAIN',
    'NEXT_PUBLIC_AUTHING_APP_ID',
    'AUTHING_APP_SECRET',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'NEXT_PUBLIC_API_BASE'
  ];
  
  requiredEnvVars.forEach(envVar => {
    if (envContent.includes(envVar)) {
      console.log(`✅ ${envVar} template exists`);
    } else {
      console.log(`❌ ${envVar} template missing`);
    }
  });
} else {
  console.log('❌ .env.example file not found');
}

// Check package.json dependencies
console.log('\n📦 Checking dependencies...');
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const requiredDeps = [
    'authing-js-sdk',
    '@authing/web',
    'next',
    'react',
    'typescript'
  ];
  
  requiredDeps.forEach(dep => {
    if (deps[dep]) {
      console.log(`✅ ${dep} (${deps[dep]})`);
    } else {
      console.log(`❌ ${dep} - MISSING`);
    }
  });
}

// Check TypeScript configuration
console.log('\n🔧 Checking TypeScript configuration...');
const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
if (fs.existsSync(tsconfigPath)) {
  console.log('✅ tsconfig.json exists');
} else {
  console.log('❌ tsconfig.json missing');
}

// Check Next.js configuration
console.log('\n⚙️ Checking Next.js configuration...');
const nextConfigPath = path.join(process.cwd(), 'next.config.ts');
if (fs.existsSync(nextConfigPath)) {
  console.log('✅ next.config.ts exists');
} else {
  console.log('❌ next.config.ts missing');
}

// Check Vercel configuration
console.log('\n🔗 Checking Vercel configuration...');
const vercelConfigPath = path.join(process.cwd(), 'vercel.json');
if (fs.existsSync(vercelConfigPath)) {
  const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
  console.log('✅ vercel.json exists');
  
  if (vercelConfig.rewrites && vercelConfig.rewrites.length > 0) {
    console.log('✅ API rewrites configured');
  } else {
    console.log('⚠️ No API rewrites found');
  }
  
  if (vercelConfig.headers && vercelConfig.headers.length > 0) {
    console.log('✅ CORS headers configured');
  } else {
    console.log('⚠️ No CORS headers found');
  }
} else {
  console.log('❌ vercel.json missing');
}

// Final summary
console.log('\n📊 Pre-deployment Summary');
console.log('==========================');

if (missingFiles.length === 0) {
  console.log('🎉 All required files are present!');
} else {
  console.log(`⚠️ Missing ${missingFiles.length} required files`);
}

console.log('\n📋 Pre-deployment Checklist:');
console.log('□ Create Authing application at https://console.authing.cn/');
console.log('□ Configure Authing app settings (callback URLs, login methods)');
console.log('□ Set up Vercel environment variables');
console.log('□ Test login functionality locally');
console.log('□ Update NEXTAUTH_URL to production domain');
console.log('□ Generate secure NEXTAUTH_SECRET');
console.log('□ Deploy to Vercel');
console.log('□ Test login functionality in production');

console.log('\n🔧 Quick Commands:');
console.log('# Setup Vercel environment variables:');
console.log('./setup-vercel-env-with-auth.sh');
console.log('');
console.log('# Deploy to Vercel:');
console.log('vercel --prod');
console.log('');
console.log('# Test build locally:');
console.log('bun run build');

console.log('\n✅ Pre-deployment check complete!');