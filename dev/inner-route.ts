import Elysia from 'elysia';

/**
 * @description There is a known error for properties 'clerk' and 'store.auth'
 * when used on child Elysia apps, where the type is not being shared/passed,
 * but the properties are working as expected
 *
 * Error:
 *  - Property 'clerk' does not exist on type ...
 *  - Property 'auth' does not exist on type '{}'
 * Issue: https://github.com/elysiajs/elysia/issues/566
 */
const innerRoute = new Elysia()
  // @ts-expect-error: See above
  .get('/inner', async ({ set, auth, clerk }) => {
    if (!auth().userId) {
      set.status = 403;
      return 'Unauthorized';
    }

    const user = await clerk.users.getUser(auth().userId);

    return { user };
  });

export default innerRoute;
