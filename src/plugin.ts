import type { ClerkClient, ClerkOptions } from '@clerk/backend';
import type { AuthObject } from '@clerk/backend';
import { AuthStatus } from '@clerk/backend/internal';
import { Elysia } from 'elysia';
import { clerkClient } from './clerkClient';
import * as constants from './constants';

export function clerkPlugin(options?: ClerkOptions) {
	const secretKey = options?.secretKey ?? constants.SECRET_KEY;
	const publishableKey = options?.publishableKey ?? constants.PUBLISHABLE_KEY;

	return (
		new Elysia({
			name: 'clerk',
			seed: options,
		}) as InternalClerkElysia
	)
		.decorate('clerk', clerkClient)
		.resolve({ as: 'scoped' }, async ({ set, request }) => {
			const requestState = await clerkClient.authenticateRequest(request, {
				...options,
				secretKey,
				publishableKey,
			});

			requestState.headers.forEach((value, key) => {
				set.headers[key] = value;
			});

			const hasLocationHeader = requestState.headers.get(
				constants.Headers.Location,
			);
			if (hasLocationHeader) {
				// Trigger a handshake redirect
				set.status = 307;
				return;
			}

			if (requestState.status === AuthStatus.Handshake) {
				throw new Error('Clerk: handshake status without redirect');
			}

			return {
				auth: requestState.toAuth(),
			};
		});
}

type InternalClerkElysia = Elysia<
	'',
	false,
	{
		decorator: {
			clerk: ClerkClient;
		};
		store: {};
		derive: {};
		resolve: {
			readonly auth: AuthObject;
		};
	}
>;
