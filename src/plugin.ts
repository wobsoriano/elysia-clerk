import type { ClerkOptions } from '@clerk/backend';
import type {
	SignedInAuthObject,
	SignedOutAuthObject,
} from '@clerk/backend/internal';
import { deprecated } from '@clerk/shared/deprecated';
import { Elysia } from 'elysia';
import { clerkClient } from './clerkClient';
import * as constants from './constants';

export type ElysiaClerkOptions = Omit<ClerkOptions, "publishableKey" | "secretKey"> & {
	secretKey: ClerkOptions["secretKey"] | (() => string)
	publishableKey: ClerkOptions["publishableKey"] | (() => string)
};

const HandshakeStatus = 'handshake';
const LocationHeader = 'location';

type AuthObject = SignedInAuthObject | SignedOutAuthObject;

export function clerkPlugin(options?: ElysiaClerkOptions) {
	const rawSecretKey = options?.secretKey ?? constants.SECRET_KEY;
	const rawPublishableKey = options?.publishableKey ?? constants.PUBLISHABLE_KEY;

	return new Elysia({
		name: 'elysia-clerk',
		seed: options,
	})
		.decorate('clerk', clerkClient)
		.resolve(async ({ request, set }) => {
			const secretKey = typeof rawSecretKey === 'function' ? rawSecretKey() : rawSecretKey;
			const publishableKey = typeof rawPublishableKey === 'function' ? rawPublishableKey() : rawPublishableKey;
			const requestState = await clerkClient.authenticateRequest(request, {
				...options,
				secretKey,
				publishableKey,
			});

			// Asserting to fix error TS2742 when building
			const authObject = requestState.toAuth() as AuthObject;
			const authHandler = () => authObject;

			const auth = new Proxy(Object.assign(authHandler, authObject), {
				get(target, prop: string, receiver) {
					deprecated(
						'context.auth',
						'Use `context.auth()` as a function instead.',
					);

					return Reflect.get(target, prop, receiver);
				},
			});

			requestState.headers.forEach((value, key) => {
				set.headers[key] = value;
			});

			const locationHeader = requestState.headers.get(LocationHeader);
			if (locationHeader) {
				// Trigger a handshake redirect
				set.status = 307;
				return {
					auth,
				};
			}

			if (requestState.status === HandshakeStatus) {
				throw new Error('Clerk: handshake status without redirect');
			}

			return {
				auth,
			};
		})
		.as('plugin');
}
