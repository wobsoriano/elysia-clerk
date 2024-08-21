---
"elysia-clerk": patch
---

Move auth object to resolved properties

Usage:

```ts
import { Elysia } from 'elysia'
import { clerkPlugin } from 'elysia-clerk'

new Elysia()
  .use(clerkPlugin())
  .get('/api/me', async ({ clerk, auth, set }) => {
    if (!auth?.userId) {
      set.status = 403
      return 'Unauthorized'
    }
    
    const user = await clerk.users.getUser(auth.userId)

    return { user }
  })
  .listen(3000)
```
