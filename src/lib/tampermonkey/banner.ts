import fs from 'fs'
import path from 'path'

type TampermonkeyValue = string | string[]
interface PackageJSON {
  [key: string]: any
  tampermonkey?: Record<string, TampermonkeyValue>
}

const tampermonkeyKey = [
  'name',
  'version',
  'description',
  'author',
  'namespace',
  'include',
  'require',
  'homepage',
  'homepageURL',
  'website',
  'source',
  'icon',
  'iconURL',
  'defaulticon',
  'icon64',
  'icon64URL',
  'updateURL',
  'downloadURL',
  'supportURL',
  'match',
  'exclude',
  'resource',
  'connect',
  'run-at',
  'grant',
  'noframes',
  'unwrap',
  'nocompat',
]
const DEV_MODE = 'development'

export default function bannerGen(
  mode: string = DEV_MODE,
  patchConfig?: (tampermonkey: Record<string, TampermonkeyValue>) => void
): string {
  const packageJson: PackageJSON = JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf-8')
  )
  const identity = '// ==UserScript=='
  const tampermonkeyConfig = packageJson.tampermonkey || {}

  if (patchConfig) patchConfig(tampermonkeyConfig)

  const banners = tampermonkeyKey.reduce((result, key) => {
    const value: TampermonkeyValue = tampermonkeyConfig[key] || packageJson[key]
    if (value) {
      result[key] = value
    }
    return result
  }, {} as Record<string, TampermonkeyValue>)

  banners.name += mode === DEV_MODE ? '-dev-vite' : ''

  const headerKeys = Object.keys(banners)
  const maxKeyLen = Math.max.apply(
    null,
    headerKeys.map((k) => k.length)
  )
  const headers = headerKeys
    .map((key) => {
      const value = banners[key]
      const spaces = Array(maxKeyLen - key.length + 8).join(' ')
      const b = (v: any): any =>
        Array.isArray(v) ? v.map(b) : `// @${key}${spaces}${v}`
      return b(value)
    })
    .flat()

  return `/*!
${[identity, ...headers, identity.replace('U', '/U')].join('\n')}
*/
`
}
