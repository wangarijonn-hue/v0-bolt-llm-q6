"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

interface ModelSelectorProps {
  value: string
  onChange: (value: string) => void
  apiKeys: Record<string, string>
}

const MODELS = [
  // Free Models
  { id: "groq/llama-3.3-70b-versatile", name: "Llama 3.3 70B", provider: "Groq", requiresKey: true, isFree: true },
  { id: "groq/llama-3.1-8b-instant", name: "Llama 3.1 8B", provider: "Groq", requiresKey: true, isFree: true },
  { id: "groq/mixtral-8x7b-32768", name: "Mixtral 8x7B", provider: "Groq", requiresKey: true, isFree: true },
  { id: "google/gemini-1.5-flash", name: "Gemini 1.5 Flash", provider: "Google", requiresKey: true, isFree: true },

  // Premium Models
  { id: "openai/gpt-4o", name: "GPT-4o", provider: "OpenAI", requiresKey: true, isFree: false },
  { id: "openai/gpt-4o-mini", name: "GPT-4o Mini", provider: "OpenAI", requiresKey: true, isFree: false },
  {
    id: "anthropic/claude-3-5-sonnet-20241022",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    requiresKey: true,
    isFree: false,
  },
  {
    id: "anthropic/claude-3-5-haiku-20241022",
    name: "Claude 3.5 Haiku",
    provider: "Anthropic",
    requiresKey: true,
    isFree: false,
  },
  { id: "xai/grok-beta", name: "Grok Beta", provider: "xAI", requiresKey: true, isFree: false },
  { id: "google/gemini-2.0-flash-exp", name: "Gemini 2.0 Flash", provider: "Google", requiresKey: true, isFree: false },
]

export function ModelSelector({ value, onChange, apiKeys }: ModelSelectorProps) {
  const getProviderKey = (modelId: string) => {
    if (modelId.startsWith("openai")) return apiKeys.openai || ""
    if (modelId.startsWith("anthropic")) return apiKeys.anthropic || ""
    if (modelId.startsWith("xai")) return apiKeys.xai || ""
    if (modelId.startsWith("google")) return apiKeys.google || ""
    if (modelId.startsWith("groq")) return apiKeys.groq || ""
    return ""
  }

  const selectedModel = MODELS.find((m) => m.id === value)
  const hasKey = selectedModel ? getProviderKey(selectedModel.id) : false

  return (
    <div className="space-y-2">
      <Label>AI Model</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {MODELS.map((model) => {
            const hasApiKey = getProviderKey(model.id)
            return (
              <SelectItem key={model.id} value={model.id}>
                <div className="flex items-center justify-between w-full gap-2">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{model.name}</span>
                    <span className="text-xs text-muted-foreground">{model.provider}</span>
                  </div>
                  <div className="flex gap-1">
                    {model.isFree && (
                      <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-700 dark:text-green-400">
                        Free
                      </Badge>
                    )}
                    {!hasApiKey && (
                      <Badge variant="outline" className="text-xs">
                        Key Required
                      </Badge>
                    )}
                  </div>
                </div>
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
      {!hasKey && (
        <p className="text-xs text-amber-600 dark:text-amber-500">
          API key required for this model. Add it in settings below.
        </p>
      )}
    </div>
  )
}
