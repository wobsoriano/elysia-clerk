import type { ClerkOptions } from '@clerk/backend';
import { Elysia } from 'elysia';
import { clerkClient } from './clerkClient';
import * as constants from './constants';
import { AuthStatus, SignedInAuthObject, SignedOutAuthObject } from '@clerk/backend/internal';

function clerkPlugin(options?: ClerkOptions) {
	const secretKey = options?.secretKey ?? constants.SECRET_KEY;
	const publishableKey = options?.publishableKey ?? constants.PUBLISHABLE_KEY;

	const app = new Elysia({
		name: 'clerk',
		seed: options,
	});

	return app
		.decorate('clerk', clerkClient)
		.state('auth', null as null | SignedInAuthObject | SignedOutAuthObject)
		.onBeforeHandle({ as: 'scoped' }, async ({ request, set, store }) => {
			const requestState = await clerkClient.authenticateRequest(request, {
				...options,
				secretKey,
        publishableKey,
			});

			requestState.headers.forEach((value, key) => {
			  set.headers[key] = value;
			})

			const locationHeader = requestState.headers.get(constants.Headers.Location);

			if (locationHeader) {
			  set.status = 307;
        return '';
			}

			if (requestState.status === AuthStatus.Handshake) {
			 throw new Error('Clerk: handshake status without redirect');
			}

			store.auth = requestState.toAuth();
		});
}

export { clerkPlugin, type ClerkOptions };

export { clerkClient } from './clerkClient';
