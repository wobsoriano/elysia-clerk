import { describe, test, expect } from 'bun:test';
import { api } from './utils/example-app';
import { CLERK_LONG_LIVED_TOKEN } from './constants/api-clerk';

describe('ClerkPlugin', () => {
	describe('public routes', () => {
		test('public route should access clerk API when token is valid', async () => {
			const { data } = await api.index.get({
				$headers: {
					Authorization: `Bearer ${CLERK_LONG_LIVED_TOKEN}`,
				},
			});

			expect(data).toHaveProperty('data');
			expect(data).toHaveProperty('userId');
			expect(data?.userId).not.toEqual(null);
		});

		test('public route should not have access to clerk API when token is invalid', async () => {
			const { data } = await api.index.get({
				$headers: {
					Authorization: `Bearer invalid token`,
				},
			});

			expect(data).toHaveProperty('data');
			expect(data).toHaveProperty('userId');
			expect(data?.userId).toEqual(null);
		});
	});

	describe('private routes', () => {
		test('private route should access clerk API', async () => {
			const { data } = await api.private.get({
				$headers: {
					Authorization: `Bearer ${CLERK_LONG_LIVED_TOKEN}`,
				},
			});

			expect(data).toHaveProperty('user');
			expect(data).toHaveProperty('user.id');
			expect(data).not.toHaveProperty('error');
		});

		test('private route should not have access clerk API when token is invalid', async () => {
			const { data } = await api.private.get({
				$headers: {
					Authorization: `Bearer invalid token`,
				},
			});

			expect(data).not.toHaveProperty('user');
			expect(data).not.toHaveProperty('user.id');
			expect(data).toHaveProperty('error');
			expect(data?.error).toEqual('Unauthorized');
		});
	});

	describe('group private routes', () => {
		test('group private routes should access clerk API', async () => {
			const { data } = await api.group.private.get({
				$headers: {
					Authorization: `Bearer ${CLERK_LONG_LIVED_TOKEN}`,
				},
			});

			expect(data).toHaveProperty('user');
			expect(data).toHaveProperty('user.id');
			expect(data).not.toHaveProperty('error');
		});

		test('group private routes should not have access clerk API when token is invalid', async () => {
			const { data } = await api.group.private.get({
				$headers: {
					Authorization: `Bearer invalid token`,
				},
			});

			expect(data).not.toHaveProperty('user');
			expect(data).not.toHaveProperty('user.id');
			expect(data).toHaveProperty('error');
			expect(data?.error).toEqual('Unauthorized');
		});
	});
});
