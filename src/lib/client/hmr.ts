import type { UserConfig } from 'vite'

export function forceDevelopmentHmr(config: UserConfig) {
  if (process.env.NODE_ENV === 'production') {
    return
  }
  // development
  let hmr = config.server?.hmr
  if (typeof hmr === 'boolean' || !hmr) {
    hmr = {}
  }
  // 强制 hrm 指向 ws://127.0.0.1
  hmr.protocol = 'ws'
  hmr.host = '127.0.0.1'
  config.server = {
    ...(config.server || {}),
    hmr,
  }
}
