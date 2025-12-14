"use client"

import type React from "react"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Loader2, Sparkles, AlertCircle } from "lucide-react"
import { ModelSelector } from "@/components/model-selector"
import { APIKeyManager } from "@/components/api-key-manager"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

interface ChatInterfaceProps {
  onFilesGenerated: (files: Record<string, string>) => void
  showSettings: boolean
  onSettingsClose: () => void
  onCommandExecuted: (type: "command" | "output" | "error", text: string) => void
  onPackageInstalled: (name: string, version: string) => void
}

export function ChatInterface({
  onFilesGenerated,
  showSettings,
  onSettingsClose,
  onCommandExecuted,
  onPackageInstalled,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("")
  const [selectedModel, setSelectedModel] = useState("groq/llama-3.3-70b-versatile")
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({
    openai: "",
    anthropic: "",
    xai: "",
    google: "",
    groq: "",
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stored = localStorage.getItem("bolt-llm-api-keys")
    if (stored) {
      try {
        setApiKeys(JSON.parse(stored))
      } catch (e) {
        console.error("Failed to load API keys")
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("bolt-llm-api-keys", JSON.stringify(apiKeys))
  }, [apiKeys])

  const getCurrentApiKey = () => {
    if (selectedModel.startsWith("openai")) return apiKeys.openai
    if (selectedModel.startsWith("anthropic")) return apiKeys.anthropic
    if (selectedModel.startsWith("xai")) return apiKeys.xai
    if (selectedModel.startsWith("google")) return apiKeys.google
    if (selectedModel.startsWith("groq")) return apiKeys.groq
    return ""
  }

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { model: selectedModel, apiKey: getCurrentApiKey() },
    }),
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    messages.forEach((message) => {
      if (message.role === "assistant") {
        message.parts.forEach((part) => {
          if (part.type === "tool-generateCode" && part.state === "output-available") {
            const generatedFiles: Record<string, string> = {}
            part.output.files.forEach((file: any) => {
              generatedFiles[file.path] = file.content
            })
            onFilesGenerated(generatedFiles)
          }
          if (part.type === "tool-updateCode" && part.state === "output-available") {
            onFilesGenerated((prev) => ({
              ...prev,
              [part.output.path]: part.output.content,
            }))
          }
          if (part.type === "tool-installPackage" && part.state === "output-available") {
            const cmd = `npm install ${part.output.dev ? "-D " : ""}${part.output.packages.join(" ")}`
            onCommandExecuted("command", cmd)
            onCommandExecuted("output", part.output.message)
            part.output.packages.forEach((pkg: string) => {
              onPackageInstalled(pkg, "latest")
            })
          }
          if (part.type === "tool-runCommand" && part.state === "output-available") {
            onCommandExecuted("command", part.output.command)
            onCommandExecuted("output", part.output.output)
          }
          if (part.type === "tool-createIssue" && part.state === "output-available") {
            onCommandExecuted("output", `📋 ${part.output.message}`)
            onCommandExecuted("output", `   ID: ${part.output.issueId}`)
          }
          if (part.type === "tool-searchLinearIssues" && part.state === "output-available") {
            onCommandExecuted("output", `🔍 ${part.output.message}`)
          }
        })
      }
    })
  }, [messages, onFilesGenerated, onCommandExecuted, onPackageInstalled])

  const hasApiKey = getCurrentApiKey().length > 0
  const canSendMessage = input.trim() && status !== "in_progress" && hasApiKey

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSendMessage) return

    sendMessage({ text: input })
    setInput("")
  }

  const getCurrentProvider = () => {
    if (selectedModel.startsWith("openai")) return "openai"
    if (selectedModel.startsWith("anthropic")) return "anthropic"
    if (selectedModel.startsWith("xai")) return "xai"
    if (selectedModel.startsWith("google")) return "google"
    if (selectedModel.startsWith("groq")) return "groq"
    return ""
  }

  return (
    <>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <Sparkles className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Start Building with AI</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Describe what you want to build, and I'll generate the code for you. I can also create Linear issues and
                manage your project.
              </p>
              {!hasApiKey && (
                <Alert className="mt-4 max-w-sm">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Configure your API key in settings to start generating code
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "rounded-lg px-4 py-2 max-w-[85%]",
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                  )}
                >
                  {message.parts.map((part, index) => {
                    if (part.type === "text") {
                      return (
                        <p key={index} className="text-sm whitespace-pre-wrap">
                          {part.text}
                        </p>
                      )
                    }

                    if (part.type === "tool-generateCode") {
                      if (part.state === "input-available") {
                        return (
                          <div key={index} className="text-sm space-y-1">
                            <p className="font-medium">Generating files...</p>
                          </div>
                        )
                      }
                      if (part.state === "output-available") {
                        return (
                          <div key={index} className="text-sm space-y-2">
                            <p className="font-medium">Generated {part.output.files.length} file(s)</p>
                            <div className="space-y-1">
                              {part.output.files.map((file: any, i: number) => (
                                <div key={i} className="text-xs bg-background/50 rounded px-2 py-1">
                                  <code>{file.path}</code>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      }
                    }

                    if (part.type === "tool-updateCode") {
                      if (part.state === "output-available") {
                        return (
                          <div key={index} className="text-sm">
                            <p className="font-medium">Updated: {part.output.path}</p>
                          </div>
                        )
                      }
                    }

                    if (part.type === "tool-installPackage") {
                      if (part.state === "output-available") {
                        return (
                          <div key={index} className="text-sm">
                            <p className="font-medium">Installed: {part.output.packages.join(", ")}</p>
                          </div>
                        )
                      }
                    }

                    if (part.type === "tool-runCommand") {
                      if (part.state === "output-available") {
                        return (
                          <div key={index} className="text-sm">
                            <p className="font-medium">Executed: {part.output.command}</p>
                          </div>
                        )
                      }
                    }

                    if (part.type === "tool-createIssue") {
                      if (part.state === "output-available") {
                        return (
                          <div key={index} className="text-sm">
                            <p className="font-medium">Created Linear Issue</p>
                            <p className="text-xs text-muted-foreground mt-1">{part.output.title}</p>
                          </div>
                        )
                      }
                    }

                    if (part.type === "tool-searchLinearIssues") {
                      if (part.state === "output-available") {
                        return (
                          <div key={index} className="text-sm">
                            <p className="font-medium">Searched Linear</p>
                            <p className="text-xs text-muted-foreground mt-1">Query: {part.output.query}</p>
                          </div>
                        )
                      }
                    }

                    return null
                  })}
                </div>
              </div>
            ))
          )}
          {status === "in_progress" && (
            <div className="flex gap-3 justify-start">
              <div className="bg-muted rounded-lg px-4 py-2">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">{error.message}</AlertDescription>
            </Alert>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                hasApiKey
                  ? "Describe what you want to build or create a Linear issue..."
                  : "Configure API key in settings first..."
              }
              className="min-h-[60px] resize-none"
              disabled={!hasApiKey}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
            />
            <Button type="submit" size="icon" disabled={!canSendMessage} className="h-[60px] w-[60px]">
              {status === "in_progress" ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </Button>
          </div>
        </form>
      </div>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={onSettingsClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>AI Model Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <ModelSelector value={selectedModel} onChange={setSelectedModel} apiKeys={apiKeys} />

            <div className="border-t pt-4">
              <APIKeyManager
                provider={getCurrentProvider()}
                value={apiKeys[getCurrentProvider()] || ""}
                onChange={(value) => {
                  const provider = getCurrentProvider()
                  setApiKeys((prev) => ({ ...prev, [provider]: value }))
                }}
              />
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Get free API keys from Groq for fast inference, or use premium providers for advanced models. Linear MCP
                integration is available for project management.
              </AlertDescription>
            </Alert>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
