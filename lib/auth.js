import GitHubProvider from 'next-auth/providers/github';
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

export const authOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      authorization: { params: { scope: 'read:user' } },
    }),
  ],
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        token.githubId = String(profile.id);
        token.username = profile.login;
        token.avatarUrl = profile.avatar_url;
      }
      return token;
    },
    redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return baseUrl + url;
      const allowed = [baseUrl, process.env.FRONTEND_URL].filter(Boolean).map((u) => new URL(u).origin);
      try {
        return allowed.includes(new URL(url).origin) ? url : baseUrl;
      } catch {
        return baseUrl;
      }
    },
  },
};
