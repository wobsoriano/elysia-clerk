import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import Elysia from 'elysia';

const EnvVariables = {
  CLERK_SECRET_KEY: 'TEST_SECRET_KEY',
  CLERK_PUBLISHABLE_KEY: 'TEST_PUBLISHABLE_KEY',
};

vi.hoisted(() => {
  process.env.CLERK_SECRET_KEY = 'TEST_SECRET_KEY';
  process.env.CLERK_PUBLISHABLE_KEY = 'TEST_PUBLISHABLE_KEY';
});

const createMockSessionAuth = () => ({
  tokenType: 'session_token' as const,
  userId: 'user_123',
  sessionId: 'sess_456',
  orgId: null,
  orgRole: null,
  orgSlug: null,
});

const authenticateRequestMock = vi.fn();
const createClerkClientSpy = vi.fn();

vi.mock(import('@clerk/backend'), async (importOriginal) => {
  const original = await importOriginal();

  return {
    ...original,
    createClerkClient(options: Parameters<typeof original.createClerkClient>[0]) {
      createClerkClientSpy(options);
      const client = original.createClerkClient(options);
      vi.spyOn(client, 'authenticateRequest').mockImplementation(authenticateRequestMock);
      return client;
    },
  };
});

// Must be imported after vi.mock and vi.hoisted
const { clerkClient, clerkPlugin } = await import('../index');

describe('plugin(options)', () => {
  beforeEach(() => {
    authenticateRequestMock.mockReset();
    createClerkClientSpy.mockReset();
  });

  it('handles signin with Authorization Bearer', async () => {
    authenticateRequestMock.mockResolvedValueOnce({
      headers: new Headers(),
      toAuth: createMockSessionAuth,
    });

    const app = new Elysia().use(clerkPlugin()).get('/', (c) => ({ auth: c.auth() }));

    const response = await app.handle(
      new Request('http://localhost/', {
        headers: {
          Authorization: 'Bearer deadbeef',
          Origin: 'http://origin.com',
          Host: 'host.com',
          'X-Forwarded-Port': '1234',
          'X-Forwarded-Host': 'forwarded-host.com',
          Referer: 'referer.com',
          'User-Agent':
            'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
        },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ auth: createMockSessionAuth() });
    expect(authenticateRequestMock).toHaveBeenCalledWith(
      expect.any(Request),
      expect.objectContaining({
        secretKey: EnvVariables.CLERK_SECRET_KEY,
      }),
    );
  });

  it('handles signin with cookie', async () => {
    authenticateRequestMock.mockResolvedValueOnce({
      headers: new Headers(),
      toAuth: createMockSessionAuth,
    });

    const app = new Elysia().use(clerkPlugin()).get('/', (c) => ({ auth: c.auth() }));

    const response = await app.handle(
      new Request('http://localhost/', {
        headers: {
          Cookie: '_gcl_au=value1; ko_id=value2; __session=deadbeef; __client_uat=1675692233',
          Origin: 'http://origin.com',
          Host: 'host.com',
          'X-Forwarded-Port': '1234',
          'X-Forwarded-Host': 'forwarded-host.com',
          Referer: 'referer.com',
          'User-Agent':
            'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
        },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ auth: createMockSessionAuth() });
    expect(authenticateRequestMock).toHaveBeenCalledWith(
      expect.any(Request),
      expect.objectContaining({
        secretKey: EnvVariables.CLERK_SECRET_KEY,
      }),
    );
  });

  it('handles handshake case by redirecting the request to fapi', async () => {
    authenticateRequestMock.mockResolvedValueOnce({
      status: 'handshake',
      reason: 'auth-reason',
      message: 'auth-message',
      headers: new Headers({
        location: 'https://fapi.example.com/v1/clients/handshake',
        'x-clerk-auth-message': 'auth-message',
        'x-clerk-auth-reason': 'auth-reason',
        'x-clerk-auth-status': 'handshake',
      }),
      toAuth: createMockSessionAuth,
    });

    const app = new Elysia().use(clerkPlugin()).get('/', (c) => ({ auth: c.auth() }));

    const response = await app.handle(
      new Request('http://localhost/', {
        headers: {
          Cookie: '_gcl_au=value1; ko_id=value2; __session=deadbeef; __client_uat=1675692233',
        },
      }),
    );
    const headers = Object.fromEntries(response.headers.entries());
    expect(response.status).toBe(307);
    expect(headers).toMatchObject({
      location: 'https://fapi.example.com/v1/clients/handshake',
      'x-clerk-auth-status': 'handshake',
      'x-clerk-auth-reason': 'auth-reason',
      'x-clerk-auth-message': 'auth-message',
    });
  });

  it('builds the plugin clerk client from resolved plugin options', async () => {
    authenticateRequestMock.mockResolvedValueOnce({
      headers: new Headers(),
      toAuth: () => ({ userId: 'user_123' }),
      status: 'signed-in',
    });

    const app = new Elysia()
      .use(
        clerkPlugin({
          secretKey: 'sk_runtime',
          publishableKey: 'pk_runtime',
          apiUrl: 'https://api.example.com',
          apiVersion: 'v2',
        }),
      )
      .get('/', () => ({ ok: true }));

    const response = await app.handle(new Request('http://localhost/'));

    expect(response.status).toBe(200);
    expect(createClerkClientSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        secretKey: 'sk_runtime',
        publishableKey: 'pk_runtime',
        apiUrl: 'https://api.example.com',
        apiVersion: 'v2',
      }),
    );
  });
});

describe('clerkClient()', () => {
  beforeEach(() => {
    createClerkClientSpy.mockReset();
  });

  it('uses default constants when called without overrides', () => {
    clerkClient();

    expect(createClerkClientSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        secretKey: EnvVariables.CLERK_SECRET_KEY,
        machineSecretKey: '',
      }),
    );
  });

  it('applies overrides on top of defaults', () => {
    clerkClient({
      secretKey: 'sk_override',
      apiVersion: 'v2',
      telemetry: {
        debug: false,
      },
    });

    expect(createClerkClientSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        secretKey: 'sk_override',
        apiVersion: 'v2',
        machineSecretKey: '',
      }),
    );
    expect(createClerkClientSpy.mock.calls[0]?.[0].telemetry).toEqual(
      expect.objectContaining({
        debug: false,
      }),
    );
  });
});
