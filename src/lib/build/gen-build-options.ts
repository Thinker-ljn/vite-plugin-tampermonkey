import fs from 'fs'
import path from 'path'
import { LibraryOptions, BuildOptions } from 'vite'
import bannerGen from '../tampermonkey/banner'
import { addExtraTmGrant, genRollupIntro } from './inject-css'
import { addUsedGrants } from '../tampermonkey/grant'
import { externalGlobalParser } from './external-global'
import type { ExternalGlobal } from './external-global'
import { buildName } from '../utils'
const root = process.cwd()

type RollupOptions = Exclude<BuildOptions['rollupOptions'], undefined>

export function genRollupOptionsGenerator(genBanner: typeof bannerGen) {
  function rollupOptionsGenerator(input?: ExternalGlobal): RollupOptions {
    const { requires, external, globals } = externalGlobalParser(input)

    const banner = () =>
      genBanner('production', (tmConfig) => {
        tmConfig.require = [...(tmConfig.require || []), ...requires]
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
