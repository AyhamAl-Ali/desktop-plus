import * as React from 'react'
import { Octicon } from '../octicons'
import * as octicons from '../octicons/octicons.generated'
import { Checkbox, CheckboxValue } from './checkbox'
import { Button } from './button'
import { getBoolean, setBoolean } from '../../lib/local-storage'
import { AppFileStatus, AppFileStatusKind } from '../../models/status'

const fileTreeViewKey = 'file-list-tree-view'

/** Whether changed files should be shown as a tree (persisted per machine) */
export const getFileTreeView = () => getBoolean(fileTreeViewKey, false)

export const setFileTreeView = (treeView: boolean) =>
  setBoolean(fileTreeViewKey, treeView)

/** Horizontal indentation per tree level, in pixels */
const FileTreeIndent = 16

/** Inline style indenting a tree row to the given depth */
export const fileTreeRowStyle = (depth: number): React.CSSProperties => ({
  paddingLeft: `calc(var(--spacing) + ${depth * FileTreeIndent}px)`,
})

/** Width taken by the indentation of a tree row at the given depth */
export const fileTreeIndentWidth = (depth: number) => depth * FileTreeIndent

const fileName = (path: string) => path.substring(path.lastIndexOf('/') + 1)
const dirName = (path: string) => path.substring(0, path.lastIndexOf('/'))

/**
 * The path and status to show for a file row in a tree. Only the file name is
 * shown, and for renames the old name is shortened when the folder is the same.
 */
export function getTreeFileLabel(
  path: string,
  status: AppFileStatus
): { path: string; status: AppFileStatus } {
  if (
    (status.kind === AppFileStatusKind.Renamed ||
      status.kind === AppFileStatusKind.Copied) &&
    dirName(status.oldPath) === dirName(path)
  ) {
    return {
      path: fileName(path),
      status: { ...status, oldPath: fileName(status.oldPath) },
    }
  }
  return { path: fileName(path), status }
}

/** Thin vertical lines connecting a tree row to its ancestor folders */
export const FileTreeGuides: React.FunctionComponent<{
  readonly depth: number
}> = ({ depth }) => (
  <>
    {Array.from({ length: depth }, (_, i) => (
      <span
        key={i}
        className="file-tree-guide"
        style={{ left: `calc(var(--spacing) + ${i * FileTreeIndent + 7}px)` }}
      />
    ))}
  </>
)

interface IFileTreeFolderProps {
  readonly path: string
  readonly name: string
  readonly depth: number
  readonly collapsed: boolean
  /** Number of changed files in the folder, including nested ones */
  readonly fileCount: number
  readonly onToggleCollapsed: (path: string) => void
  readonly onContextMenu?: (
    path: string,
    event: React.MouseEvent<HTMLDivElement>
  ) => void

  /** When set, render a checkbox for including all files in the folder */
  readonly include?: CheckboxValue
  readonly disableInclude?: boolean
  readonly onIncludeChanged?: (path: string, include: boolean) => void
}

/** A collapsible folder row in a file tree view */
export class FileTreeFolder extends React.Component<IFileTreeFolderProps> {
  private onToggle = () => {
    this.props.onToggleCollapsed(this.props.path)
  }

  private onIncludeChanged = (event: React.FormEvent<HTMLInputElement>) => {
    this.props.onIncludeChanged?.(this.props.path, event.currentTarget.checked)
  }

  private onContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    this.props.onContextMenu?.(this.props.path, event)
  }

  public render() {
    const { path, name, depth, collapsed, fileCount, include, disableInclude } =
      this.props
    const prefixEnd = name.lastIndexOf('/') + 1

    return (
      <div
        className="file file-tree-folder"
        style={fileTreeRowStyle(depth)}
        onContextMenu={this.onContextMenu}
      >
        <FileTreeGuides depth={depth} />
        {include !== undefined && (
          <Checkbox
            tabIndex={-1}
            value={include}
            onChange={this.onIncludeChanged}
            disabled={disableInclude}
          />
        )}
        <button
          className="file-tree-toggle"
          aria-expanded={!collapsed}
          aria-label={`${path} folder, ${fileCount} changed`}
          onClick={this.onToggle}
        >
          <Octicon
            className="file-tree-chevron"
            symbol={collapsed ? octicons.chevronRight : octicons.chevronDown}
          />
          <span className="folder-name">
            <span className="folder-name-prefix">
              {name.substring(0, prefixEnd)}
            </span>
            {name.substring(prefixEnd)}
          </span>
        </button>
        <span className="folder-count" aria-hidden={true}>
          {fileCount}
        </span>
      </div>
    )
  }
}

interface IFileTreeViewToggleProps {
  readonly treeView: boolean
  readonly onChange: (treeView: boolean) => void
}

/** Pair of header buttons switching a file list between path and tree view */
export class FileTreeViewToggle extends React.Component<IFileTreeViewToggleProps> {
  private onPathView = () => this.props.onChange(false)
  private onTreeView = () => this.props.onChange(true)

  public render() {
    const { treeView } = this.props
    return (
      <div className="file-tree-view-toggle" role="group" aria-label="View as">
        <Button
          size="small"
          className={treeView ? undefined : 'active'}
          onClick={this.onPathView}
          ariaLabel="Path view"
          ariaPressed={!treeView}
          tooltip="Path view"
        >
          <Octicon symbol={octicons.listUnordered} />
        </Button>
        <Button
          size="small"
          className={treeView ? 'active' : undefined}
          onClick={this.onTreeView}
          ariaLabel="Tree view"
          ariaPressed={treeView}
          tooltip="Tree view"
        >
          <Octicon symbol={octicons.fileDirectory} />
        </Button>
      </div>
    )
  }
}
