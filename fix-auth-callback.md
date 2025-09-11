# Fix Authentication Callback Issue

## Problem Identified
The authentication is failing because the Authing callback URLs are not properly configured for your production domain.

## Solution Steps

### 1. Configure Authing Callback URLs
Login to [Authing Console](https://console.authing.cn/) and add these callback URLs to your application:

**Production URLs:**
- `https://funsoccer.app/api/auth/callback`
- `https://www.funsoccer.app/api/auth/callback`
- `https://soccer-heatmap-next.vercel.app/api/auth/callback`

**Development URL:**
- `http://localhost:3000/api/auth/callback`

### 2. Update Backend API Base URL
The frontend is currently trying to reach the backend at port 8001, but the backend runs on port 8000.

Run this command to update the API base URL on Vercel:
```bash
cd funsoccer/soccer-heatmap-next
echo "http://47.239.73.57:8000" | vercel env add NEXT_PUBLIC_API_BASE production --force
```

### 3. Verify Backend Auth Endpoint
The backend `/api/auth/callback` endpoint exists but needs the Authing App Secret configured properly.

SSH into your server and check:
```bash
ssh -i C:\Users\chen0\Downloads\funsoccerhongkong.pem root@47.239.73.57
cd /root/funsoccer
cat .env | grep AUTHING
```

Make sure these are set:
```
AUTHING_APP_ID=68b7cbae2816014ddfcbba17
AUTHING_APP_SECRET=[Your App Secret from Authing Console]
AUTHING_DOMAIN=funsoccer.authing.cn
```

### 4. Restart Backend Services
After updating the .env file:
```bash
pm2 restart all
```

### 5. Redeploy Frontend
Trigger a new deployment on Vercel:
```bash
cd funsoccer/soccer-heatmap-next
git add .
git commit -m "Fix authentication callback configuration"
git push
```

## Testing

After completing these steps:

1. Visit https://funsoccer.app
2. Click the Login button
3. You should be redirected to Authing login page
4. After login, you should be redirected back to the app

## Current Configuration Status

✅ Authing environment variables are set on Vercel
✅ Backend auth endpoint exists at `/api/auth/callback`
❌ Callback URLs need to be added in Authing Console
❌ Backend needs Authing App Secret configured
❌ API base URL needs to be corrected (8000 not 8001)