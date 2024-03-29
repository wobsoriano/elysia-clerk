import { Elysia } from 'elysia';
import { clerkPlugin } from '../../src';
import { edenTreaty } from '@elysiajs/eden';

const privateGroup = new Elysia().group('/group', (app) =>
	app.get('/private', async ({ clerk, store, set }) => {
		if (!store.auth?.userId) {
			set.status = 403;
			return { error: 'Unauthorized' };
		}

		const user = await clerk.users.getUser(store.auth.userId);

		return { user };
	}),
);

const app = new Elysia()
	.use(clerkPlugin())
	.get('/', ({ store }) => {
		const userId = store.auth?.userId ?? null;
		return { data: "I'm a public endpoint", userId };
	})
	.get('/private', async ({ clerk, store, set }) => {
		if (!store.auth?.userId) {
			set.status = 403;
			return { error: 'Unauthorized' };
		}

		const user = await clerk.users.getUser(store.auth.userId);

		return { user };
	})
	.use(privateGroup)
	.listen(3000);

export const api = edenTreaty<typeof app>('http://localhost:3000');
