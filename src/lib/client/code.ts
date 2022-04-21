declare const __ORIGIN__: string
declare const __GRANTS__: Record<string, any>
declare const unsafeWindow: any
;(function () {
  const grants = __GRANTS__ || {}
  const origin = __ORIGIN__ || ''

  // force vite ping to localhost
  const originFetch = unsafeWindow.fetch
  const ping = '/__vite_ping'
  unsafeWindow.fetch = function (input: string, init: any) {
    if (input === ping) {
      input = `${origin}${ping}`
    }
    return originFetch(input, init)
  }

  Object.entries(grants).forEach(([key, fn]) => {
    unsafeWindow[key] = fn
  })

  function createModuleScript(path: string) {
    const script = document.createElement('script')
    script.type = 'module'
    script.src = `${origin}/${path}`
    document.body.appendChild(script)
    return script
  }

  createModuleScript('@vite/client')
  createModuleScript('src/main.ts')
})()
