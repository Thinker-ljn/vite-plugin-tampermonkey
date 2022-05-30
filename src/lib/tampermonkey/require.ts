import fs from 'fs'
import path from 'path'

const root = process.cwd()
const UNPKG = 'https://unpkg.com'
export const manualRequireReg = /^(https?:\/\/)|(data:text\/javascript;)/

export function isManualRequire(name: string) {
  return manualRequireReg.test(name)
}

export function genRequireFromExternal(pkgName: string, cdnPath: string = '') {
  if (manualRequireReg.test(pkgName)) {
    return pkgName
  }
  const modulePkgPath = path.resolve(
    root,
    `node_modules/${pkgName}/package.json`
  )
  if (cdnPath) {
    cdnPath = `/${cdnPath.replace(/^\//, '')}`
  }
  if (fs.existsSync(modulePkgPath)) {
    const json = JSON.parse(fs.readFileSync(modulePkgPath, 'utf8'))
    const version = json.version || 'latest'
    return `${UNPKG}/${pkgName}@${version}${cdnPath}`
  }
  return `${UNPKG}/${pkgName}${cdnPath}`
}

export function genRequireFromExternals(externals: string[]) {
  return externals.map((n) => genRequireFromExternal(n)).filter(Boolean)
}
