import { externalGlobalParser } from '@/lib/build/external-global'
import { Base64 } from 'js-base64'
jest.mock('fs')
import fs from 'fs'

beforeEach(() => {
  ;(fs.readFileSync as jest.Mock).mockImplementation((path) => {
    if (path.includes('vue')) {
      return '{"version": "1.0.0"}'
    }
  })
  ;(fs.existsSync as jest.Mock).mockImplementation((path) => {
    if (path.includes('vue')) {
      return true
    }
  })
})
describe('external globals', () => {
  it('object', () => {
    expect(
      externalGlobalParser({
        vue: 'Vue',
      })
    ).toMatchObject({
      requires: ['https://unpkg.com/vue@1.0.0'],
      external: ['vue'],
      globals: {
        vue: 'Vue',
      },
    })
  })
  it('simple array', () => {
    expect(
      externalGlobalParser([
        'vue',
        'https://unpkg.com/bar@1.0.0',
        ['foo', 'FooName'],
      ])
    ).toMatchObject({
      requires: [
        'https://unpkg.com/vue@1.0.0',
        'https://unpkg.com/bar@1.0.0',
        'https://unpkg.com/foo',
      ],
      external: ['vue', 'foo'],
      globals: {
        vue: 'Vue',
        foo: 'FooName',
      },
    })
  })
  it('object array', () => {
    expect(
      externalGlobalParser([
        'vue',
        {
          pkgName: 'console.log(Vue)',
          type: 'code',
        },
        {
          pkgName: 'bar',
          path: '/dist/barName.min.js',
          varName: 'barName',
        },
      ])
    ).toMatchObject({
      requires: [
        'https://unpkg.com/vue@1.0.0',
        `data:text/javascript;base64,${Base64.encode('console.log(Vue)')}`,
        'https://unpkg.com/bar/dist/barName.min.js',
      ],
      external: ['vue', 'bar'],
      globals: {
        vue: 'Vue',
        bar: 'barName',
      },
    })
  })
})
