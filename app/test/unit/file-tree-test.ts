import { describe, it } from 'node:test'
import assert from 'node:assert'
import {
  buildFileTreeRows,
  getNestedFolderPaths,
} from '../../src/lib/file-tree'

const files = [
  'README.md',
  'src/a.ts',
  'src/lib/deep/b.ts',
  'src/lib/deep/c.ts',
].map(path => ({ path }))

const describeRows = (collapsed: ReadonlySet<string>) =>
  buildFileTreeRows(files, collapsed).map(r =>
    r.kind === 'folder'
      ? `${r.depth}:${r.name}/(${r.files.length})`
      : `${r.depth}:${r.file.path}`
  )

describe('buildFileTreeRows', () => {
  it('lists folders before files and compacts single-child chains', () => {
    assert.deepStrictEqual(describeRows(new Set()), [
      '0:src/(3)',
      '1:lib/deep/(2)',
      '2:src/lib/deep/b.ts',
      '2:src/lib/deep/c.ts',
      '1:src/a.ts',
      '0:README.md',
    ])
  })

  it('hides contents of collapsed folders', () => {
    assert.deepStrictEqual(describeRows(new Set(['src/lib/deep'])), [
      '0:src/(3)',
      '1:lib/deep/(2)',
      '1:src/a.ts',
      '0:README.md',
    ])
  })
})

describe('getNestedFolderPaths', () => {
  it('returns the folder and its descendants', () => {
    assert.deepStrictEqual(getNestedFolderPaths(files, 'src'), [
      'src',
      'src/lib/deep',
    ])
  })
})
