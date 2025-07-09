---
"elysia-clerk": minor
---

Re-export webhook verification helper

Usage:

*Required*: Set your `CLERK_WEBHOOK_SIGNING_SECRET` environment variable to protect your webhook signing secret. It is automatically read by `verifyWebhook()`.

```ts
import { clerkPlugin } from 'elysia-clerk'
import { verifyWebhook } from 'elysia-clerk/webhooks'

new Elysia()
    .use(clerkPlugin())
    .get('/webhook', ({ request }) => {
      const result = await verifyWebhook(request)
      // do something with the result
    })
    .listen(3000)
```
