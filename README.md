# elysia-clerk

Unofficial [Clerk](https://clerk.com/) plugin for [Elysia.js](https://elysiajs.com/).

## Install

```bash
bun install elysia-clerk
```

## Usage

Retrieve your Backend API key from the [API Keys](https://dashboard.clerk.com/last-active?path=api-keys) screen in your Clerk dashboard and set it as an environment variable in a .env file:

```sh
CLERK_PUBLISHABLE_KEY=pk_*******
CLERK_SECRET_KEY=sk_******
```

```ts
import { Elysia } from 'elysia'
import { clerkClient, clerkPlugin } from 'elysia-clerk'

new Elysia()
  .use(clerkPlugin())
  .get('/private', async ({ store: { auth }, set }) => {
    if (!auth?.userId) {
      set.status = 403
      return 'Unauthorized'
    }

    const user = await clerkClient.users.getUser(auth.userId)

    return { user }
  })
  .listen(3000)
```

Instead of using Clerk globally, you can use Clerk for a subset of routes via Elysia plugins:

```ts
import { Elysia } from 'elysia'
import { clerkClient, clerkPlugin } from 'elysia-clerk'

const privateRoutes = new Elysia({ prefix: '/api' })
  .use(clerkPlugin())
  .get('/user', async ({ store: { auth }, set }) => {
    if (!auth?.userId) {
      set.status = 403
      return 'Unauthorized'
    }

    const user = await clerkClient.users.getUser(auth.userId)

    return { user }
  })

new Elysia()
  .use(privateRoutes)
  .get('/', () => 'Hello world!')
  .listen(3000)
```

## License

MIT
