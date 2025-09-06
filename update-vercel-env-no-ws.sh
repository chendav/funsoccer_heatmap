#!/bin/bash

# Update Vercel environment variables to disable WebSocket for HTTPS
# Since Vercel doesn't support WebSocket proxying, we need to disable it

echo "Updating Vercel environment variables to disable WebSocket..."

# Remove WebSocket URLs since they can't work through HTTPS
vercel env rm NEXT_PUBLIC_WS_URL production --yes 2>/dev/null
vercel env rm NEXT_PUBLIC_WS_BASE production --yes 2>/dev/null

echo "WebSocket environment variables removed."
echo "WebSocket will be disabled on HTTPS production site."
echo "Note: WebSocket requires a server with SSL certificate for secure connections."