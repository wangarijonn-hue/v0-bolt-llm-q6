"use client"

import { useEffect, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Code, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CodeEditorProps {
  file: string | null
  content: string
  onContentChange: (content: string) => void
}

export function CodeEditor({ file, content, onContentChange }: CodeEditorProps) {
  const [localContent, setLocalContent] = useState(content)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setLocalContent(content)
  }, [content])

  if (!file) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-4 bg-muted/10">
        <Code className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No File Selected</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Select a file from the explorer to view and edit its contents
        </p>
      </div>
    )
  }

  const getLanguage = (filepath: string) => {
    const ext = filepath.split(".").pop()?.toLowerCase()
    const languageMap: Record<string, string> = {
      ts: "typescript",
      tsx: "typescript",
      js: "javascript",
      jsx: "javascript",
      json: "json",
      css: "css",
      html: "html",
      md: "markdown",
      py: "python",
    }
    return languageMap[ext || ""] || "text"
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(localContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-4 py-2 border-b border-border flex items-center justify-between bg-card">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">{file}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground uppercase px-2 py-1 bg-muted rounded">
            {getLanguage(file)}
          </span>
          <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 gap-1">
            {copied ? (
              <>
                <Check className="w-3 h-3" />
                <span className="text-xs">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span className="text-xs">Copy</span>
              </>
            )}
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="relative">
          <textarea
            value={localContent}
            onChange={(e) => {
              setLocalContent(e.target.value)
              onContentChange(e.target.value)
            }}
            className={cn(
              "w-full min-h-[calc(100vh-200px)] p-4 bg-background text-foreground",
              "font-mono text-[13px] leading-relaxed resize-none focus:outline-none",
              "selection:bg-primary/30",
            )}
            spellCheck={false}
            style={{
              tabSize: 2,
            }}
          />
          {/* Line numbers overlay */}
          <div className="absolute left-0 top-0 p-4 pr-2 pointer-events-none select-none text-muted-foreground/40 font-mono text-[13px] leading-relaxed">
            {localContent.split("\n").map((_, i) => (
              <div key={i} className="text-right">
                {i + 1}
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
