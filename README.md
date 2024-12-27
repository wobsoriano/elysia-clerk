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
  .get('/private', async ({ clerk, auth, error }) => {
    /**
     * Access the auth state in the context.
     * See the AuthObject here https://clerk.com/docs/references/nextjs/auth-object#auth-object
     */
    if (!auth?.userId) {
      return error(401)
    }

    /**
     * For other resource operations, you can use the clerk client from the context.
     * See what other utilities Clerk exposes here https://clerk.com/docs/references/backend/overview
     */
    const user = await clerk.users.getUser(auth.userId)

    return { user }
  })
  .listen(3000)
```

Instead of using Clerk globally, you can use Clerk for a subset of routes via Elysia plugins:

```ts
import { Elysia } from 'elysia'
import { clerkPlugin } from 'elysia-clerk'

const privateRoutes = new Elysia({ prefix: '/api' })
  .use(clerkPlugin())
  .get('/user', async ({ clerk, auth, error }) => {

    if (!auth?.userId) {
      return error(401)
    }

    const user = await clerk.users.getUser(auth.userId)

    return { user }
  })

new Elysia()
  .use(privateRoutes)
  .get('/', () => 'Hello world!')
  .listen(3000)
```

To see the available options you can pass to the `clerkPlugin` function, see [`AuthenticateRequestOptions`](https://clerk.com/docs/references/backend/authenticate-request#authenticate-request-options).

### Macros

#### `currentUser`

Add `currentUser` macro to get the [Backend User](https://clerk.com/docs/references/backend/types/backend-user) object of the currently active user.

```ts
new Elysia()
  .use(clerkPlugin())
  .get('/api/current-user', ({ currentUser, error }) => {
    if (!currentUser) {
      return error(401)
    }

    return { currentUser }
  }, {
    currentUser: true
  })
  .listen(3000)
```

## License

MIT
