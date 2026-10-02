import { getUser } from '../../../lib/auth.js';
import { respond } from '../../../lib/errors.js';
import { preflight } from '../../../lib/cors.js';

export const GET = respond(async (request) => {
  const { username, avatarUrl } = await getUser(request);
  return { username, avatarUrl, profileUrl: `https://github.com/${username}` };
});

export const OPTIONS = preflight;
