"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Key, ExternalLink } from "lucide-react"

interface APIKeyManagerProps {
  provider: string
  value: string
  onChange: (value: string) => void
}

export function APIKeyManager({ provider, value, onChange }: APIKeyManagerProps) {
  const [showKey, setShowKey] = useState(false)

  const getProviderLabel = (provider: string) => {
    if (provider.startsWith("openai")) return "OpenAI API Key"
    if (provider.startsWith("anthropic")) return "Anthropic API Key"
    if (provider.startsWith("xai")) return "xAI API Key"
    if (provider.startsWith("google")) return "Google API Key"
    if (provider.startsWith("groq")) return "Groq API Key"
    return "API Key"
  }

  const getProviderPlaceholder = (provider: string) => {
    if (provider.startsWith("openai")) return "sk-..."
    if (provider.startsWith("anthropic")) return "sk-ant-..."
    if (provider.startsWith("xai")) return "xai-..."
    if (provider.startsWith("google")) return "AI..."
    if (provider.startsWith("groq")) return "gsk_..."
    return "Enter your API key"
  }

  const getProviderLink = (provider: string) => {
    if (provider.startsWith("openai")) return "https://platform.openai.com/api-keys"
    if (provider.startsWith("anthropic")) return "https://console.anthropic.com/settings/keys"
    if (provider.startsWith("xai")) return "https://console.x.ai"
    if (provider.startsWith("google")) return "https://aistudio.google.com/app/apikey"
    if (provider.startsWith("groq")) return "https://console.groq.com/keys"
    return ""
  }

  const link = getProviderLink(provider)

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Key className="w-4 h-4" />
        {getProviderLabel(provider)}
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-xs text-blue-600 hover:underline flex items-center gap-1"
          >
            Get Key <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </Label>
      <div className="flex gap-2">
        <Input
          type={showKey ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={getProviderPlaceholder(provider)}
          className="font-mono text-sm"
        />
        <Button type="button" variant="ghost" size="icon" onClick={() => setShowKey(!showKey)}>
          {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">Your API key is stored locally and never sent to our servers</p>
    </div>
  )
}
