import { beforeEach, describe, expect, it, jest } from 'bun:test';
import Elysia from 'elysia';
import { clerkPlugin } from '../plugin';

describe('plugin(options)', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		jest.restoreAllMocks();
	});

	it('handles signin with Authorization Bearer', async () => {
		globalThis.authenticateRequestMock.mockResolvedValueOnce({
			headers: new Headers(),
			toAuth: () => 'mockedAuth',
		});

		const app = new Elysia()
			.use(clerkPlugin())
			.get('/', (c) => ({ auth: c.auth() }));

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
		expect(body).toEqual({ auth: 'mockedAuth' });
		expect(globalThis.authenticateRequestMock).toBeCalledWith(
			expect.any(Request),
			expect.objectContaining({
				secretKey: 'TEST_SECRET_KEY',
			}),
		);
	});

	it('handles signin with cookie', async () => {
		globalThis.authenticateRequestMock.mockResolvedValueOnce({
			headers: new Headers(),
			toAuth: () => 'mockedAuth',
		});

		const app = new Elysia()
			.use(clerkPlugin())
			.get('/', (c) => ({ auth: c.auth() }));

		const response = await app.handle(
			new Request('http://localhost/', {
				headers: {
					Cookie:
						'_gcl_au=value1; ko_id=value2; __session=deadbeef; __client_uat=1675692233',
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
		expect(body).toEqual({ auth: 'mockedAuth' });
		expect(globalThis.authenticateRequestMock).toBeCalledWith(
			expect.any(Request),
			expect.objectContaining({
				secretKey: 'TEST_SECRET_KEY',
			}),
		);
	});

	it('handles handshake case by redirecting the request to fapi', async () => {
		globalThis.authenticateRequestMock.mockResolvedValueOnce({
			status: 'handshake',
			reason: 'auth-reason',
			message: 'auth-message',
			headers: new Headers({
				location: 'https://fapi.example.com/v1/clients/handshake',
				'x-clerk-auth-message': 'auth-message',
				'x-clerk-auth-reason': 'auth-reason',
				'x-clerk-auth-status': 'handshake',
			}),
			toAuth: () => 'mockedAuth',
		});

		const app = new Elysia()
			.use(clerkPlugin())
			.get('/', (c) => ({ auth: c.auth() }));

		const response = await app.handle(
			new Request('http://localhost/', {
				headers: {
					Cookie:
						'_gcl_au=value1; ko_id=value2; __session=deadbeef; __client_uat=1675692233',
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
});
