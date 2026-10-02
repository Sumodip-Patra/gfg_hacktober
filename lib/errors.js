import { corsHeaders } from './cors.js';

export class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const errorResponse = (status, code, message) =>
  Response.json({ error: { code, message } }, { status, headers: corsHeaders() });

export const respond = (handler) => async (request) => {
  try {
    return Response.json(await handler(request), { headers: corsHeaders() });
  } catch (err) {
    if (err instanceof ApiError) return errorResponse(err.status, err.code, err.message);
    console.error(err);
    return errorResponse(500, 'INTERNAL_ERROR', 'Unexpected error.');
  }
};

export function oneOf(value, allowed, fallback, name) {
  if (value === null) return fallback;
  if (!allowed.includes(value)) throw new ApiError(400, 'BAD_REQUEST', `Invalid ${name}`);
  return value;
}
