"use client"

import { useState } from "react"
import { File, FolderOpen, Plus, Trash2, Edit2, Download } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface FileExplorerProps {
  files: Record<string, string>
  selectedFile: string | null
  onSelectFile: (path: string | null) => void
  onUpdateFile: (path: string, content: string) => void
  onDeleteFile: (path: string) => void
  onRenameFile: (oldPath: string, newPath: string) => void
  onCreateFile: (path: string) => void
}

export function FileExplorer({
  files,
  selectedFile,
  onSelectFile,
  onUpdateFile,
  onDeleteFile,
  onRenameFile,
  onCreateFile,
}: FileExplorerProps) {
  const [showNewFileDialog, setShowNewFileDialog] = useState(false)
  const [showRenameDialog, setShowRenameDialog] = useState(false)
  const [newFileName, setNewFileName] = useState("")
  const [renameTarget, setRenameTarget] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState("")

  const filePaths = Object.keys(files).sort()

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      onCreateFile(newFileName.trim())
      setNewFileName("")
      setShowNewFileDialog(false)
    }
  }

  const handleRenameFile = () => {
    if (renameTarget && renameValue.trim() && renameValue !== renameTarget) {
      onRenameFile(renameTarget, renameValue.trim())
      if (selectedFile === renameTarget) {
        onSelectFile(renameValue.trim())
      }
      setRenameTarget(null)
      setRenameValue("")
      setShowRenameDialog(false)
    }
  }

  const handleDownloadFile = (path: string) => {
    const content = files[path]
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = path.split("/").pop() || "file.txt"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDownloadAll = () => {
    const zip = Object.entries(files)
      .map(([path, content]) => `// ${path}\n${content}`)
      .join("\n\n")
    const blob = new Blob([zip], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "project.txt"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <div className="flex-1 flex flex-col max-w-[280px]">
        <div className="px-4 py-2 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Files</span>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowNewFileDialog(true)}>
              <Plus className="w-4 h-4" />
            </Button>
            {filePaths.length > 0 && (
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleDownloadAll}>
                <Download className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        <ScrollArea className="flex-1">
          {filePaths.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No files generated yet</div>
          ) : (
            <div className="p-2">
              {filePaths.map((path) => (
                <ContextMenu key={path}>
                  <ContextMenuTrigger>
                    <button
                      onClick={() => onSelectFile(path)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 hover:bg-accent transition-colors",
                        selectedFile === path && "bg-accent",
                      )}
                    >
                      <File className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="truncate text-foreground">{path}</span>
                    </button>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem
                      onClick={() => {
                        setRenameTarget(path)
                        setRenameValue(path)
                        setShowRenameDialog(true)
                      }}
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Rename
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => handleDownloadFile(path)}>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </ContextMenuItem>
                    <ContextMenuItem className="text-destructive" onClick={() => onDeleteFile(path)}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* New File Dialog */}
      <Dialog open={showNewFileDialog} onOpenChange={setShowNewFileDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New File</DialogTitle>
          </DialogHeader>
          <Input
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            placeholder="path/to/file.tsx"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateFile()
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewFileDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFile} disabled={!newFileName.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename File Dialog */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename File</DialogTitle>
          </DialogHeader>
          <Input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            placeholder="new/path/to/file.tsx"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRenameFile()
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRenameDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenameFile} disabled={!renameValue.trim()}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
