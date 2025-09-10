import { NextRequest } from 'next/server';

// Server-side backend URL (HTTPS)
const BACKEND_URL = process.env.BACKEND_API_BASE || process.env.NEXT_PUBLIC_API_BASE || 'https://47.239.73.57';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const client_id = searchParams.get('client_id') || 'unknown';
  
  console.log('[SSE Proxy] Connecting to backend:', BACKEND_URL);
  console.log('[SSE Proxy] Client ID:', client_id);
  
  const encoder = new TextEncoder();
  
  // Create a TransformStream for SSE
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  
  // Start the SSE connection in the background
  (async () => {
    try {
      const url = `${BACKEND_URL}/api/v1/events/stream?client_id=${encodeURIComponent(client_id)}`;
      console.log('[SSE Proxy] Fetching from:', url);
      
      // For development/self-signed certificates - in production, use proper certificates
      const fetchOptions: RequestInit = {
        headers: {
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
        // Important: don't set signal to allow long-running connection
      };

      // In Node.js environment (server-side), we can bypass certificate validation for self-signed certs
      if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
        const https = await import('https');
        const agent = new https.Agent({
          rejectUnauthorized: false
        });
        (fetchOptions as any).agent = agent;
      }

      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        console.error('[SSE Proxy] Backend error:', response.status, response.statusText);
        await writer.write(encoder.encode(`event: error\ndata: ${JSON.stringify({ error: 'Backend connection failed', status: response.status })}\n\n`));
        await writer.close();
        return;
      }

      if (!response.body) {
        console.error('[SSE Proxy] No response body');
        await writer.write(encoder.encode(`event: error\ndata: ${JSON.stringify({ error: 'No response body' })}\n\n`));
        await writer.close();
        return;
      }

      // Forward the SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('[SSE Proxy] Stream ended');
          break;
        }
        
        // Forward the chunk directly
        await writer.write(value);
      }
      
    } catch (error) {
      console.error('[SSE Proxy] Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await writer.write(encoder.encode(`event: error\ndata: ${JSON.stringify({ error: errorMessage })}\n\n`));
    } finally {
      try {
        await writer.close();
      } catch (e) {
        // Writer might already be closed
      }
    }
  })();
  
  // Return the readable stream with SSE headers
  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable buffering for nginx
      'Access-Control-Allow-Origin': '*',
    },
  });
}

// Handle OPTIONS for CORS
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}