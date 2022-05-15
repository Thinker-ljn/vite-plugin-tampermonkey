import { Plugin } from 'vite'
import { full as walkFull } from 'acorn-walk'
import { genDevTampermonkeyClientUrl } from '../client'

export const grants = [
  'unsafeWindow',
  'GM_addStyle',
  'GM_addElement',
  'GM_deleteValue',
  'GM_listValues',
  'GM_addValueChangeListener',
  'GM_removeValueChangeListener',
  'GM_setValue',
  'GM_getValue',
  'GM_log',
  'GM_getResourceText',
  'GM_getResourceURL',
  'GM_registerMenuCommand',
  'GM_unregisterMenuCommand',
  'GM_openInTab',
  'GM_xmlhttpRequest',
  'GM_download',
  'GM_getTab',
  'GM_saveTab',
  'GM_getTabs',
  'GM_notification',
  'GM_setClipboard',
  'GM_info',
]

const tampermonkeyGrantSet = new Set(grants)

const usedGrants: Set<string> = new Set()
export const parserGrant: Plugin = {
  name: 'tampermonkey-grant',
  moduleParsed(moduleInfo) {
    if (/\.(ts|js|vue)$/.test(moduleInfo.id)) {
      if (moduleInfo.ast) {
        walkFull(moduleInfo.ast, (node: any) => {
          if (node.type === 'CallExpression') {
            const calleeName = node.callee.name
            if (calleeName && tampermonkeyGrantSet.has(calleeName)) {
              usedGrants.add(calleeName)
            }
          }
          if (
            node.type === 'Identifier' &&
            tampermonkeyGrantSet.has(node.name)
          ) {
            usedGrants.add(node.name)
          }
        })
      }
    }
  },
}

export function addUsedGrants(tmConfig: Record<string, any>, isDev = false) {
  if (isDev) {
    // 开发模式下，注入所有 grant
    tmConfig.grant = grants
  } else {
    tmConfig.grant = [...new Set([...(tmConfig.grant || []), ...usedGrants])]
  }
}

export function patchDdevTmConfig(
  tmConfig: Record<string, any>,
  origin: string
) {
  tmConfig.grant = grants
  tmConfig.require = [
    ...(tmConfig.require || []),
    genDevTampermonkeyClientUrl(origin),
  ]
}
