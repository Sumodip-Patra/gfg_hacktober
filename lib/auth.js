import { getToken } from 'next-auth/jwt';
import { ApiError } from './errors.js';
import { mockUser } from './mock.js';

export async function getUser(request) {
  if (process.env.MOCK === 'true') return mockUser;
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.accessToken) throw new ApiError(401, 'UNAUTHENTICATED', 'Please sign in.');
  return {
    githubId: token.githubId,
    username: token.username,
    avatarUrl: token.avatarUrl,
    accessToken: token.accessToken,
  };
}
