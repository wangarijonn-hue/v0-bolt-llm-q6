"use client"

import { useState } from "react"
import { ChatInterface } from "@/components/chat-interface"
import { FileExplorer } from "@/components/file-explorer"
import { CodeEditor } from "@/components/code-editor"
import { LivePreview } from "@/components/live-preview"
import { Terminal } from "@/components/terminal"
import { PackageManager } from "@/components/package-manager"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Code2, MessageSquare, Eye, FileCode, TerminalSquare } from "lucide-react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"

export default function Home() {
  const [files, setFiles] = useState<Record<string, string>>({})
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [activeView, setActiveView] = useState<"code" | "preview" | "terminal">("code")
  const [terminalLogs, setTerminalLogs] = useState<Array<{ type: "command" | "output" | "error"; text: string }>>([])
  const [packages, setPackages] = useState<Record<string, string>>({
    react: "^18.3.1",
    next: "^15.1.3",
  })

  const addTerminalLog = (type: "command" | "output" | "error", text: string) => {
    setTerminalLogs((prev) => [...prev, { type, text }])
  }

  const handleInstallPackage = (packageName: string, isDev: boolean) => {
    addTerminalLog("command", `npm install ${isDev ? "-D " : ""}${packageName}`)
    addTerminalLog("output", `✓ Installed ${packageName}`)
    setPackages((prev) => ({ ...prev, [packageName]: "latest" }))
  }

  const handleUninstallPackage = (packageName: string) => {
    addTerminalLog("command", `npm uninstall ${packageName}`)
    addTerminalLog("output", `✓ Removed ${packageName}`)
    setPackages((prev) => {
      const updated = { ...prev }
      delete updated[packageName]
      return updated
    })
  }

  const handleCreateFile = (path: string) => {
    setFiles((prev) => ({ ...prev, [path]: "" }))
    setSelectedFile(path)
    addTerminalLog("output", `Created file: ${path}`)
  }

  const handleDeleteFile = (path: string) => {
    setFiles((prev) => {
      const updated = { ...prev }
      delete updated[path]
      return updated
    })
    if (selectedFile === path) {
      setSelectedFile(null)
    }
    addTerminalLog("output", `Deleted file: ${path}`)
  }

  const handleRenameFile = (oldPath: string, newPath: string) => {
    setFiles((prev) => {
      const updated = { ...prev }
      updated[newPath] = updated[oldPath]
      delete updated[oldPath]
      return updated
    })
    addTerminalLog("output", `Renamed: ${oldPath} → ${newPath}`)
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Code2 className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Bolt LLM</h1>
          </div>
          <span className="text-sm text-muted-foreground">AI-Powered Full-Stack Development</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setShowSettings(!showSettings)}>
          <Settings className="w-5 h-5" />
        </Button>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Chat Panel */}
          <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
            <div className="h-full border-r border-border flex flex-col bg-card">
              <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground">AI Assistant</h2>
              </div>
              <ChatInterface
                onFilesGenerated={setFiles}
                showSettings={showSettings}
                onSettingsClose={() => setShowSettings(false)}
                onCommandExecuted={addTerminalLog}
                onPackageInstalled={(name, version) => {
                  setPackages((prev) => ({ ...prev, [name]: version }))
                }}
              />
            </div>
          </ResizablePanel>

          <ResizableHandle />

          {/* Code/Preview Panel */}
          <ResizablePanel defaultSize={55}>
            <div className="h-full flex flex-col">
              <Tabs
                value={activeView}
                onValueChange={(v) => setActiveView(v as "code" | "preview" | "terminal")}
                className="flex-1 flex flex-col"
              >
                <div className="border-b border-border bg-card px-2">
                  <TabsList className="h-12">
                    <TabsTrigger value="code" className="gap-2">
                      <FileCode className="w-4 h-4" />
                      Code Editor
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="gap-2">
                      <Eye className="w-4 h-4" />
                      Live Preview
                    </TabsTrigger>
                    <TabsTrigger value="terminal" className="gap-2">
                      <TerminalSquare className="w-4 h-4" />
                      Terminal
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="code" className="flex-1 flex flex-col m-0 overflow-hidden">
                  <div className="flex border-b border-border">
                    <FileExplorer
                      files={files}
                      selectedFile={selectedFile}
                      onSelectFile={setSelectedFile}
                      onUpdateFile={(path, content) => {
                        setFiles((prev) => ({ ...prev, [path]: content }))
                      }}
                      onDeleteFile={handleDeleteFile}
                      onRenameFile={handleRenameFile}
                      onCreateFile={handleCreateFile}
                    />
                  </div>
                  <div className="flex-1">
                    <CodeEditor
                      file={selectedFile}
                      content={selectedFile ? files[selectedFile] : ""}
                      onContentChange={(content) => {
                        if (selectedFile) {
                          setFiles((prev) => ({ ...prev, [selectedFile]: content }))
                        }
                      }}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="preview" className="flex-1 m-0 overflow-hidden">
                  <LivePreview files={files} />
                </TabsContent>

                <TabsContent value="terminal" className="flex-1 m-0 overflow-hidden">
                  <Terminal logs={terminalLogs} onClearLogs={() => setTerminalLogs([])} />
                </TabsContent>
              </Tabs>
            </div>
          </ResizablePanel>

          <ResizableHandle />

          {/* Package Manager Sidebar */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <PackageManager packages={packages} onInstall={handleInstallPackage} onUninstall={handleUninstallPackage} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}
