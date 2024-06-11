import { Elysia } from 'elysia'
import { html } from '@elysiajs/html'
import { clerkPlugin } from '../dist'
import innerRoute from './inner-route'

const file = Bun.file(`${import.meta.dir}/index.html`)
const contents = await file.text()

const appFile = Bun.file(`${import.meta.dir}/app.js`)
const appContents = await appFile.text()

const subset = new Elysia({ prefix: '/api' })
  .use(clerkPlugin({}))
  .get('/auth', async (context) => {
    return context.store.auth
  })

const app = new Elysia()
  .use(html())
  .use(clerkPlugin({}))
  // .get('/', ({ html }) => html(contents))
  .get('/', (context) => {
    return new Response(contents, {
      headers: {
        'content-type': 'text/html',
      },
    })
  })
  .get('/app.js', () => {
    return appContents.replace('REPLACE_ME', process.env.CLERK_PUBLISHABLE_KEY as string)
  })
  .get('/private', async ({ clerk, store, set }) => {
    if (!store.auth?.userId) {
      set.status = 403
      return 'Unauthorized'
    }

    const user = await clerk.users.getUser(store.auth.userId)

    return { user }
  })
  .use(innerRoute)
  // .use(subset)
  .listen(3000)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
)
