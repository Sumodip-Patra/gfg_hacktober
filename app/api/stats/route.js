import { getUser } from '../../../lib/auth.js';
import { getPullRequests } from '../../../lib/github.js';
import { respond, oneOf } from '../../../lib/errors.js';
import { preflight } from '../../../lib/cors.js';
import { filterScope, computeStats } from '../../../lib/stats.js';

export const GET = respond(async (request) => {
  const params = new URL(request.url).searchParams;
  const scope = oneOf(params.get('scope'), ['external', 'all'], 'external', 'scope');
  const user = await getUser(request);
  const prs = filterScope(await getPullRequests(user), scope, user.username);
  return computeStats(prs, new Date().toISOString().slice(0, 10));
});

export const OPTIONS = preflight;
