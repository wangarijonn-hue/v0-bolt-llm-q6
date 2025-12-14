"use client"

import { useEffect, useRef } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Trash2, TerminalSquare } from "lucide-react"
import { cn } from "@/lib/utils"

interface TerminalProps {
  logs: Array<{ type: "command" | "output" | "error"; text: string }>
  onClearLogs: () => void
}

export function Terminal({ logs, onClearLogs }: TerminalProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs])

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/20 bg-[#252526]">
        <div className="flex items-center gap-2">
          <TerminalSquare className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium text-gray-200">Terminal</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onClearLogs} className="h-8 text-gray-400 hover:text-gray-200">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Terminal Content */}
      <ScrollArea className="flex-1">
        <div ref={scrollRef} className="p-4 space-y-1 font-mono text-sm">
          {logs.length === 0 ? (
            <div className="text-gray-500 italic">No commands executed yet. The AI will run commands here.</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className={cn("whitespace-pre-wrap", log.type === "command" && "text-green-400")}>
                {log.type === "command" && <span className="text-blue-400">$ </span>}
                <span
                  className={cn(
                    log.type === "output" && "text-gray-300",
                    log.type === "error" && "text-red-400",
                    log.type === "command" && "text-green-400",
                  )}
                >
                  {log.text}
                </span>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
