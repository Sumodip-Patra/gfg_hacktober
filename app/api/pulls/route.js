import { getUser } from '../../../lib/auth.js';
import { getPullRequests } from '../../../lib/github.js';
import { respond, oneOf } from '../../../lib/errors.js';
import { preflight } from '../../../lib/cors.js';
import { filterScope, filterPulls } from '../../../lib/stats.js';

export const GET = respond(async (request) => {
  const params = new URL(request.url).searchParams;
  const scope = oneOf(params.get('scope'), ['external', 'all'], 'external', 'scope');
  const state = oneOf(params.get('state'), ['open', 'merged', 'closed', 'all'], 'all', 'state');
  const repo = params.get('repo') ?? undefined;
  const user = await getUser(request);
  const prs = await getPullRequests(user);
  return filterPulls(filterScope(prs, scope, user.username), { state, repo }).map(({ owner, ...pull }) => pull);
});

export const OPTIONS = preflight;
