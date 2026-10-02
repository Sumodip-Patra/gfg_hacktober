export function corsHeaders() {
  const headers = {
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  };
  if (process.env.FRONTEND_URL) headers['Access-Control-Allow-Origin'] = process.env.FRONTEND_URL;
  return headers;
}

export const preflight = () => new Response(null, { status: 204, headers: corsHeaders() });
