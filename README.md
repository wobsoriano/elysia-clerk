# elysia-clerk

Unofficial [Clerk](https://clerk.com/) plugin for [Elysia.js](https://elysiajs.com/).

## Install

```bash
bun install elysia-clerk
```

## Usage

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

## License

MIT
