const WORKER_URL = 'https://pulse-api.caduleitenet.workers.dev'

export async function onRequest(context) {
  const { request } = context
  const url = new URL(request.url)

  // Build target URL on the Worker
  const targetUrl = `${WORKER_URL}${url.pathname}${url.search}`

  const workerRequest = new Request(targetUrl, {
    method: request.method,
    headers: request.headers,
    body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
    redirect: 'manual',
  })

  const response = await fetch(workerRequest)

  // Forward redirects (OAuth callbacks)
  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get('Location')
    if (location) {
      return Response.redirect(location, response.status)
    }
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  })
}
