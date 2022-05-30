import { ExternalGlobal } from './build/external-global'

export interface Options {
  externalGlobals?: ExternalGlobal
  autoGrant?: boolean
  cdn?: string
}
