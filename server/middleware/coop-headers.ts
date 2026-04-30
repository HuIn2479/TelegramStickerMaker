export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname
  // Only set COOP/COEP on HTML page requests (not API, not static files)
  if (!path.startsWith('/api/') && !path.includes('.')) {
    setResponseHeaders(event, {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'credentialless'
    })
  }
})
