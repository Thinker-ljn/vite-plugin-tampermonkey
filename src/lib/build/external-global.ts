import { Base64 } from 'js-base64'
import {
  fillCdnOrigin,
  genRequireFromExternal,
  genRequireFromExternals,
  isManualRequire,
} from '../tampermonkey/require'
import { Options } from '../type'
import { buildName } from '../utils'

type AnyObj = Record<string, string>

interface ExternalGlobalItem {
  pkgName: string
  varName?: string
  type?: 'code' | 'package'
  path?: string
}
export type ExternalGlobal =
  | AnyObj
  | (string | ExternalGlobalItem | [pkgName: string, varName: string])[]

interface ExternalGlobalOutput {
  requires: string[]
  external: string[]
  globals: AnyObj
}

function objectGuard(input: ExternalGlobal): input is AnyObj {
  return !Array.isArray(input)
}

function destruct(
  input: ExternalGlobalItem | [string, string]
): ExternalGlobalItem {
  if (Array.isArray(input)) {
    const [pkgName, varName] = input
    return { pkgName, varName }
  }

  return input
}
export function genExternalGlobalParser(options: Options) {
  return function externalGlobalParser(): ExternalGlobalOutput {
    const { externalGlobals, cdn } = options
    const defs: ExternalGlobalOutput = {
      requires: [],
      external: [],
      globals: {},
    }
    if (!externalGlobals) {
      return defs
    }
    if (objectGuard(externalGlobals)) {
      const externals = Object.keys(externalGlobals)
      return {
        external: externals,
        globals: externalGlobals,
        requires: fillCdnOrigin(genRequireFromExternals(externals), cdn),
      }
    }

    const result = externalGlobals.reduce((prev, curr) => {
      if (typeof curr === 'string') {
        if (!isManualRequire(curr)) {
          prev.external.push(curr)
          prev.globals[curr] = buildName(curr)
        }
        prev.requires.push(genRequireFromExternal(curr))
        return prev
      }

      const { type, varName, pkgName, path } = destruct(curr)

      if (type === 'code') {
        const b64 = `data:text/javascript;base64,${Base64.encode(pkgName)}`
        prev.requires.push(b64)
      } else {
        if (varName) {
          prev.globals[pkgName] = varName
        }
        prev.external.push(pkgName)
        prev.requires.push(genRequireFromExternal(pkgName, path))
      }

      return prev
    }, defs)

    result.requires = fillCdnOrigin(result.requires, cdn)
    return result
  }
}
