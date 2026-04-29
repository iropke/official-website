import { draftMode, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Admin Preview entry — enables Next.js draftMode and redirects to the
 * requested public path. Used by `Posts.admin.preview` to allow editors
 * to preview Draft posts that the public list/detail queries would
 * otherwise filter out.
 *
 * Auth model:
 *   - The admin Preview button opens this endpoint in a new tab. The
 *     authenticated Payload session cookie is sent automatically.
 *   - We validate `payload.auth(headers)` returns a non-null `user` before
 *     enabling draftMode. Anonymous visitors who hit this URL get 401.
 *   - draftMode cookie is HttpOnly (Next.js default).
 *
 * Path validation:
 *   - Must start with `/` (relative path only — no protocol-relative,
 *     no absolute URLs).
 *   - Must not contain `..` (path traversal guard).
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const path = url.searchParams.get('path')

  if (!path || !path.startsWith('/') || path.includes('..')) {
    return new Response('Invalid path', { status: 400 })
  }

  const payload = await getPayload({ config })
  const reqHeaders = await headers()
  const { user } = await payload.auth({ headers: reqHeaders })
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const dm = await draftMode()
  dm.enable()
  redirect(path)
}
