import fs from 'fs'
import path from 'path'
import { LibraryOptions, BuildOptions } from 'vite'
import bannerGen from './gen-banner'
import { addExtraTmGrant, genRollupIntro } from './inject-css'
import { addUsedGrants } from './tampermonkey-grant'
const root = process.cwd()
const UNPKG = 'https://unpkg.com'

type AnyObj = Record<string, string>
export type ExternalGlobal = AnyObj | string[]

type RollupOptions = Exclude<BuildOptions['rollupOptions'], undefined>

function buildName(name: string) {
  return name.replace(/(^|-)([a-zA-Z])/g, (m) =>
    m.replace('-', '').toUpperCase()
  )
}

function buildGlobalName(names: string[]) {
  return names.reduce((result, name) => {
    result[name] = buildName(name)
    return result
  }, {} as AnyObj)
}

export function genRollupOptionsGenerator(genBanner: typeof bannerGen) {
  function rollupOptionsGenerator(input?: AnyObj | string[]): RollupOptions {
    const external = Array.isArray(input) ? input : Object.keys(input || {})
    const globals = Array.isArray(input) ? buildGlobalName(input) : input

    const tmRequire = external
      .map((pkgName) => {
        const modulePkgPath = path.resolve(
          root,
          `node_modules/${pkgName}/package.json`
        )
        if (fs.existsSync(modulePkgPath)) {
          const json = JSON.parse(fs.readFileSync(modulePkgPath, 'utf8'))
          const version = json.version || 'latest'
          return `${UNPKG}/${pkgName}@${version}`
        }
        return ''
      })
      .filter(Boolean)
    const banner = () =>
      genBanner('production', (tmConfig) => {
        tmConfig.require = [...(tmConfig.require || []), ...tmRequire]
        addExtraTmGrant(tmConfig)
        addUsedGrants(tmConfig)
      })
    return {
      external,
      output: {
        globals,
        banner,
        intro: genRollupIntro(),
        inlineDynamicImports: true,
      },
    }
  }

  return rollupOptionsGenerator
}

function entryExt() {
  const tsconfigFile = path.resolve(root, 'vite.config.ts')
  return fs.existsSync(tsconfigFile) ? 'ts' : 'js'
}

export function gendefaultBuildOptions(): LibraryOptions {
  const pkgPath = path.resolve(root, './package.json')

  const json = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))

  if (!json.name) {
    const error = 'props `name` in package.json is required!'
    console.error(error)
    throw new Error(error)
  }
  const name = buildName(json.name)

  return {
    entry: path.resolve(root, `src/main.${entryExt()}`),
    name,
    formats: ['iife'],
    fileName: (format) => `${json.name}.${format}.user.js`,
  }
}
