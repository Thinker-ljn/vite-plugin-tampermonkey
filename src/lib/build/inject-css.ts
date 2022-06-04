import { Plugin } from 'vite'

const INTRO_FOR_PLACEHOLDER =
  'console.warn("__TEMPLATE_INJECT_CSS_PLACEHOLDER_NOT_WORK__")'
const genIntro = (input?: string) =>
  INTRO_FOR_PLACEHOLDER + (input ? '\n' + input : '')
export function genRollupIntro(
  userDefine?: string | (() => string | Promise<string>)
) {
  return () => {
    if (!userDefine) return genIntro()
    if (typeof userDefine === 'string') {
      return genIntro(userDefine)
    }
    const res = userDefine()
    if (typeof res === 'string') {
      return genIntro(res)
    }
    return res.then((final) => genIntro(final))
  }
}

const GM_ADD_STYLE = 'GM_addStyle'
export const addExtraTmGrant = (tmConfig: Record<string, any>) => {
  if (!tmConfig.grant) {
    tmConfig.grant = []
  }
  if (!tmConfig.grant.find((grant: string) => grant === GM_ADD_STYLE)) {
    tmConfig.grant.push(GM_ADD_STYLE)
  }
  return tmConfig
}

export const tampermonkeyCssPlugin: Plugin = {
  name: 'tampermonkeyCssPlugin',
  apply: 'build',
  enforce: 'post',
  generateBundle(_, bundle) {
    const cssFiles = Object.keys(bundle).filter((i) => i.endsWith('.css'))
    const jsFiles = Object.keys(bundle).filter((i) => i.endsWith('.js'))
    const cssContent = cssFiles
      .map((cssFile) => {
        const chunk = bundle[cssFile]
        if (chunk.type === 'asset' && typeof chunk.source === 'string') {
          delete bundle[cssFile]
          return chunk.source
        }
        return ''
      })
      .join('\n')
    for (const jsFile of jsFiles) {
      const chunk = bundle[jsFile]
      if (chunk.type === 'chunk') {
        chunk.code = chunk.code.replace(
          INTRO_FOR_PLACEHOLDER,
          `${GM_ADD_STYLE}(${JSON.stringify(cssContent)})`
        )
      }
    }
  },
}
