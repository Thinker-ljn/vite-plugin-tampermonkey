import { Base64 } from 'js-base64'
import {
  genRequireFromExternal,
  genRequireFromExternals,
  isManualRequire,
} from '../tampermonkey/require'
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

export function externalGlobalParser(
  input?: ExternalGlobal
): ExternalGlobalOutput {
  const defs: ExternalGlobalOutput = {
    requires: [],
    external: [],
    globals: {},
  }
  if (!input) {
    return defs
  }
  if (objectGuard(input)) {
    const externals = Object.keys(input)
    return {
      external: externals,
      globals: input,
      requires: genRequireFromExternals(externals),
    }
  }

  return input.reduce((prev, curr) => {
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
}
