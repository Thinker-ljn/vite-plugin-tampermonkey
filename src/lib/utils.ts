import type { AddressInfo } from 'net'
import path from 'path'
import os from 'os'
import type { ViteDevServer } from 'vite'

export function buildLocalOrigin({ address, port }: AddressInfo) {
  return `http://${address}:${port}`
}

function getAddress(
  address: string | AddressInfo | null | undefined
): AddressInfo | null {
  return address && typeof address === 'object' ? address : null
}

export function getLocalOrigin(server: ViteDevServer) {
  const origin = getAddress(server.httpServer?.address())
  if (!origin) return ''

  return buildLocalOrigin(origin)
}

const cyanColor = '\x1B[36m%s\x1B[0m'
export function cyanLog(msg: string) {
  setTimeout(() => {
    console.log(cyanColor, msg)
  })
}

export function slash(p: string): string {
  return p.replace(/\\/g, '/')
}

export const isWindows = os.platform() === 'win32'
export function normalizePath(id: string) {
  return path.posix.normalize(isWindows ? slash(id) : id)
}

export function buildName(name: string) {
  return name.replace(/(^|-|\/|@)([a-zA-Z])/g, (m) =>
    m.replace(/[-@/]/, '').toUpperCase()
  )
}
