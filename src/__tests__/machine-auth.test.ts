import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import Elysia from 'elysia';

vi.hoisted(() => {
  process.env.CLERK_SECRET_KEY = 'TEST_SECRET_KEY';
  process.env.CLERK_PUBLISHABLE_KEY = 'TEST_PUBLISHABLE_KEY';
});

const authenticateRequestMock = vi.fn();

vi.mock(import('@clerk/backend'), async (importOriginal) => {
  const original = await importOriginal();

  return {
    ...original,
    createClerkClient(options: Parameters<typeof original.createClerkClient>[0]) {
      const client = original.createClerkClient(options);
      vi.spyOn(client, 'authenticateRequest').mockImplementation(authenticateRequestMock);
      return client;
    },
  };
});

const { clerkPlugin } = await import('../index');

const createMockApiKeyAuth = () => ({
  tokenType: 'api_key' as const,
  id: 'ak_ey966f1b1xf93586b2debdcadb0b3bd1',
  name: 'my-api-key',
  subject: 'user_2vYVtestTESTtestTESTtestTESTtest',
  userId: 'user_2vYVtestTESTtestTESTtestTESTtest',
  orgId: null,
  claims: { foo: 'bar' },
  scopes: ['read:foo', 'write:bar'],
  isAuthenticated: true,
});

const createMockM2MAuth = () => ({
  tokenType: 'm2m_token' as const,
  id: 'mt_ey966f1b1xf93586b2debdcadb0b3bd1',
  subject: 'mch_2vYVtestTESTtestTESTtestTESTtest',
  machineId: 'mch_2vYVtestTESTtestTESTtestTESTtest',
  claims: { foo: 'bar' },
  scopes: ['mch_1xxxxx', 'mch_2xxxxx'],
  isAuthenticated: true,
});

const createMockOAuthAuth = () => ({
  tokenType: 'oauth_token' as const,
  id: 'oat_2VTWUzvGC5UhdJCNx6xG1D98edc',
  clientId: 'client_2VTWUzvGC5UhdJCNx6xG1D98edc',
  subject: 'user_2vYVtestTESTtestTESTtestTESTtest',
  userId: 'user_2vYVtestTESTtestTESTtestTESTtest',
  scopes: ['read:foo', 'write:bar'],
  isAuthenticated: true,
});

describe('machine authentication', () => {
  beforeEach(() => {
    authenticateRequestMock.mockReset();
  });

  describe('API key authentication', () => {
    it('handles API key token via auth({ acceptsToken: "api_key" })', async () => {
      authenticateRequestMock.mockResolvedValueOnce({
        headers: new Headers(),
        toAuth: createMockApiKeyAuth,
      });

      const app = new Elysia()
        .use(clerkPlugin())
        .get('/', (c) => ({ auth: c.auth({ acceptsToken: 'api_key' }) }));

      const response = await app.handle(
        new Request('http://localhost/', {
          headers: {
            Authorization: 'Bearer ak_deadbeef',
          },
        }),
      );

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ auth: createMockApiKeyAuth() });
    });

    it('passes acceptsToken: "any" to authenticateRequest', async () => {
      authenticateRequestMock.mockResolvedValueOnce({
        headers: new Headers(),
        toAuth: createMockApiKeyAuth,
      });

      const app = new Elysia()
        .use(clerkPlugin())
        .get('/', (c) => ({ auth: c.auth({ acceptsToken: 'api_key' }) }));

      await app.handle(
        new Request('http://localhost/', {
          headers: {
            Authorization: 'Bearer ak_deadbeef',
          },
        }),
      );

      expect(authenticateRequestMock).toHaveBeenCalledWith(
        expect.any(Request),
        expect.objectContaining({
          acceptsToken: 'any',
        }),
      );
    });
  });

  describe('M2M token authentication', () => {
    it('handles M2M token via auth({ acceptsToken: "m2m_token" })', async () => {
      authenticateRequestMock.mockResolvedValueOnce({
        headers: new Headers(),
        toAuth: createMockM2MAuth,
      });

      const app = new Elysia()
        .use(clerkPlugin())
        .get('/', (c) => ({ auth: c.auth({ acceptsToken: 'm2m_token' }) }));

      const response = await app.handle(
        new Request('http://localhost/', {
          headers: {
            Authorization: 'Bearer mt_deadbeef',
          },
        }),
      );

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ auth: createMockM2MAuth() });
    });
  });

  describe('OAuth token authentication', () => {
    it('handles OAuth token via auth({ acceptsToken: "oauth_token" })', async () => {
      authenticateRequestMock.mockResolvedValueOnce({
        headers: new Headers(),
        toAuth: createMockOAuthAuth,
      });

      const app = new Elysia()
        .use(clerkPlugin())
        .get('/', (c) => ({ auth: c.auth({ acceptsToken: 'oauth_token' }) }));

      const response = await app.handle(
        new Request('http://localhost/', {
          headers: {
            Authorization: 'Bearer oat_deadbeef',
          },
        }),
      );

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ auth: createMockOAuthAuth() });
    });
  });

  describe('acceptsToken with multiple types', () => {
    it('handles acceptsToken as array', async () => {
      authenticateRequestMock.mockResolvedValueOnce({
        headers: new Headers(),
        toAuth: createMockApiKeyAuth,
      });

      const app = new Elysia()
        .use(clerkPlugin())
        .get('/', (c) => ({ auth: c.auth({ acceptsToken: ['api_key', 'session_token'] }) }));

      const response = await app.handle(
        new Request('http://localhost/', {
          headers: {
            Authorization: 'Bearer ak_deadbeef',
          },
        }),
      );

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ auth: createMockApiKeyAuth() });
    });

    it('handles acceptsToken: "any" to accept all token types', async () => {
      authenticateRequestMock.mockResolvedValueOnce({
        headers: new Headers(),
        toAuth: createMockM2MAuth,
      });

      const app = new Elysia()
        .use(clerkPlugin())
        .get('/', (c) => ({ auth: c.auth({ acceptsToken: 'any' }) }));

      const response = await app.handle(
        new Request('http://localhost/', {
          headers: {
            Authorization: 'Bearer mt_deadbeef',
          },
        }),
      );

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ auth: createMockM2MAuth() });
    });
  });

  describe('auth() default behavior', () => {
    it('defaults to session_token when called without options', async () => {
      const mockSessionAuth = () => ({
        tokenType: 'session_token' as const,
        userId: 'user_123',
        sessionId: 'sess_456',
        orgId: null,
        orgRole: null,
        orgSlug: null,
      });

      authenticateRequestMock.mockResolvedValueOnce({
        headers: new Headers(),
        toAuth: mockSessionAuth,
      });

      const app = new Elysia().use(clerkPlugin()).get('/', (c) => ({ auth: c.auth() }));

      const response = await app.handle(
        new Request('http://localhost/', {
          headers: {
            Authorization: 'Bearer deadbeef',
          },
        }),
      );

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ auth: mockSessionAuth() });
    });
  });
});
