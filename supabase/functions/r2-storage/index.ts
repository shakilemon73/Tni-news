import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// R2 Configuration from environment
const R2_ACCOUNT_ID = Deno.env.get('R2_ACCOUNT_ID') || '';
const R2_ACCESS_KEY_ID = Deno.env.get('R2_ACCESS_KEY_ID') || '';
const R2_SECRET_ACCESS_KEY = Deno.env.get('R2_SECRET_ACCESS_KEY') || '';
const R2_BUCKET_NAME = Deno.env.get('R2_BUCKET_NAME') || '';
const R2_PUBLIC_URL = Deno.env.get('R2_PUBLIC_URL') || '';

// AWS4 Signature helpers
async function hmacSha256(key: Uint8Array, message: string): Promise<Uint8Array> {
  const keyBuffer = key.buffer.slice(key.byteOffset, key.byteOffset + key.byteLength) as ArrayBuffer;
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(message));
  return new Uint8Array(sig);
}

async function sha256(message: string | Uint8Array): Promise<string> {
  const data = typeof message === 'string' ? new TextEncoder().encode(message) : message;
  const dataBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
  const hash = await crypto.subtle.digest('SHA-256', dataBuffer);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function toHex(buffer: Uint8Array): string {
  return Array.from(buffer).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function getSignatureKey(key: string, dateStamp: string, region: string, service: string): Promise<Uint8Array> {
  const kDate = await hmacSha256(new TextEncoder().encode('AWS4' + key), dateStamp);
  const kRegion = await hmacSha256(kDate, region);
  const kService = await hmacSha256(kRegion, service);
  const kSigning = await hmacSha256(kService, 'aws4_request');
  return kSigning;
}

interface SignedRequestParams {
  method: string;
  path: string;
  body?: Uint8Array;
  contentType?: string;
}

async function createSignedRequest({ method, path, body, contentType }: SignedRequestParams): Promise<Request> {
  const host = `${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  const endpoint = `https://${host}`;
  const region = 'auto';
  const service = 's3';
  
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);
  
  const payloadHash = body ? await sha256(body) : await sha256('');
  
  const headers: Record<string, string> = {
    'host': host,
    'x-amz-date': amzDate,
    'x-amz-content-sha256': payloadHash,
  };
  
  if (contentType) {
    headers['content-type'] = contentType;
  }
  
  const signedHeaders = Object.keys(headers).sort().join(';');
  const canonicalHeaders = Object.keys(headers).sort()
    .map(k => `${k}:${headers[k]}\n`).join('');
  
  const canonicalRequest = [
    method,
    `/${R2_BUCKET_NAME}${path}`,
    '',
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join('\n');
  
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    await sha256(canonicalRequest)
  ].join('\n');
  
  const signingKey = await getSignatureKey(R2_SECRET_ACCESS_KEY, dateStamp, region, service);
  const signature = toHex(await hmacSha256(signingKey, stringToSign));
  
  const authHeader = `AWS4-HMAC-SHA256 Credential=${R2_ACCESS_KEY_ID}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  
  const requestHeaders = new Headers();
  Object.entries(headers).forEach(([k, v]) => requestHeaders.set(k, v));
  requestHeaders.set('Authorization', authHeader);
  
  const bodyData = body ? body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength) as ArrayBuffer : undefined;
  return new Request(`${endpoint}/${R2_BUCKET_NAME}${path}`, {
    method,
    headers: requestHeaders,
    body: bodyData,
  });
}

// Verify user is admin or editor
async function verifyAdminOrEditor(authHeader: string | null): Promise<boolean> {
  if (!authHeader) return false;
  
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase URL or key not configured');
    return false;
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: authHeader } }
  });
  
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    console.log('Auth error:', error?.message);
    return false;
  }
  
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .in('role', ['admin', 'editor'])
    .single();
  
  return !!roleData;
}

Deno.serve(async (req) => {
  console.log('R2 Storage function called:', req.method, new URL(req.url).pathname);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Check R2 configuration
    if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME || !R2_PUBLIC_URL) {
      console.error('R2 configuration missing:', {
        hasAccountId: !!R2_ACCOUNT_ID,
        hasAccessKey: !!R2_ACCESS_KEY_ID,
        hasSecretKey: !!R2_SECRET_ACCESS_KEY,
        hasBucket: !!R2_BUCKET_NAME,
        hasPublicUrl: !!R2_PUBLIC_URL,
      });
      return new Response(
        JSON.stringify({ error: 'R2 storage not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const authHeader = req.headers.get('Authorization');
    console.log('Checking authorization...');
    const isAuthorized = await verifyAdminOrEditor(authHeader);
    
    if (!isAuthorized) {
      console.log('Authorization failed');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Admin or Editor access required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('Authorization passed');
    
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    console.log('Action:', action);
    
    // UPLOAD action
    if (req.method === 'POST' && action === 'upload') {
      const formData = await req.formData();
      const file = formData.get('file') as File;
      const folder = formData.get('folder') as string || 'articles';
      
      if (!file) {
        return new Response(
          JSON.stringify({ error: 'No file provided' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log('Uploading file:', file.name, 'size:', file.size, 'type:', file.type);
      
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const uniqueId = crypto.randomUUID();
      const filePath = `/${folder}/${uniqueId}.${fileExt}`;
      
      // Read file as bytes
      const fileBytes = new Uint8Array(await file.arrayBuffer());
      
      // Upload to R2
      const signedRequest = await createSignedRequest({
        method: 'PUT',
        path: filePath,
        body: fileBytes,
        contentType: file.type,
      });
      
      console.log('Sending request to R2...');
      const r2Response = await fetch(signedRequest);
      
      if (!r2Response.ok) {
        const errorText = await r2Response.text();
        console.error('R2 upload error:', r2Response.status, errorText);
        return new Response(
          JSON.stringify({ error: 'Failed to upload to R2', details: errorText }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Construct public URL
      const publicUrl = `${R2_PUBLIC_URL}${filePath}`;
      console.log('Upload successful:', publicUrl);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          url: publicUrl,
          path: filePath,
          filename: file.name,
          size: file.size,
          type: file.type
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // DELETE action
    if (req.method === 'DELETE' && action === 'delete') {
      const { path } = await req.json();
      
      if (!path) {
        return new Response(
          JSON.stringify({ error: 'No path provided' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Ensure path starts with /
      const filePath = path.startsWith('/') ? path : `/${path}`;
      console.log('Deleting file:', filePath);
      
      const signedRequest = await createSignedRequest({
        method: 'DELETE',
        path: filePath,
      });
      
      const r2Response = await fetch(signedRequest);
      
      if (!r2Response.ok && r2Response.status !== 404) {
        const errorText = await r2Response.text();
        console.error('R2 delete error:', r2Response.status, errorText);
        return new Response(
          JSON.stringify({ error: 'Failed to delete from R2', details: errorText }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log('Delete successful:', filePath);
      return new Response(
        JSON.stringify({ success: true, deleted: filePath }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // LIST action (optional - for future use)
    if (req.method === 'GET' && action === 'list') {
      const prefix = url.searchParams.get('prefix') || '';
      
      const signedRequest = await createSignedRequest({
        method: 'GET',
        path: `?list-type=2&prefix=${encodeURIComponent(prefix)}`,
      });
      
      const r2Response = await fetch(signedRequest);
      const xmlText = await r2Response.text();
      
      return new Response(
        JSON.stringify({ success: true, data: xmlText }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: 'Invalid action. Use ?action=upload, ?action=delete, or ?action=list' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('R2 Storage Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
