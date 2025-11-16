# elysia-clerk

Elysia plugin to integrate with [Clerk](https://clerk.com/).

> [!NOTE]
> This unofficial package isn't connected to Clerk.com. It's a project designed to smoothly incorporate Clerk features to your Elysia applications.

## Install

```bash
bun add elysia-clerk
```

## Usage

Retrieve your Backend API key from the [API Keys](https://dashboard.clerk.com/last-active?path=api-keys) screen in your Clerk dashboard and set it as an environment variable in a .env file:

```sh
CLERK_PUBLISHABLE_KEY=pk_*******
CLERK_SECRET_KEY=sk_******
```

Configure `clerkPlugin` in your Elysia application

```ts
import { Elysia } from 'elysia'
import { clerkPlugin } from 'elysia-clerk'

new Elysia()
  .use(clerkPlugin())
  .get('/private', async ({ auth, clerk }) => {
    const { userId } = ctx.auth()

    /**
     * Access the auth state in the context.
     * See the AuthObject here https://clerk.com/docs/references/nextjs/auth-object#auth-object
     */
    if (!userId) {
      return ctx.error(401)
    }

    /**
     * For other resource operations, you can use the clerk client from the context.
     * See what other utilities Clerk exposes here https://clerk.com/docs/references/backend/overview
     */
    const user = await ctx.clerk.users.getUser(userId)

    return { user }
  })
  .listen(3000)
```

To see the available options you can pass to the `clerkPlugin` function, see [`AuthenticateRequestOptions`](https://clerk.com/docs/references/backend/authenticate-request#authenticate-request-options).

## License

MIT
