"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface SyntaxHighlighterProps {
  code: string
  language: string
  className?: string
}

export function SyntaxHighlighter({ code, language, className }: SyntaxHighlighterProps) {
  const preRef = useRef<HTMLPreElement>(null)

  useEffect(() => {
    if (preRef.current) {
      // Apply basic syntax coloring using CSS classes
      const highlighted = highlightCode(code, language)
      preRef.current.innerHTML = highlighted
    }
  }, [code, language])

  return (
    <pre
      ref={preRef}
      className={cn(
        "font-mono text-[13px] leading-relaxed p-4 overflow-x-auto bg-muted/20 rounded-lg",
        "syntax-highlighter",
        className,
      )}
    />
  )
}

function highlightCode(code: string, language: string): string {
  // Basic syntax highlighting patterns
  const patterns = {
    comment: /\/\/.*|\/\*[\s\S]*?\*\//g,
    string: /(["'`])(?:(?=(\\?))\2.)*?\1/g,
    keyword:
      /\b(const|let|var|function|return|if|else|for|while|import|export|from|default|class|interface|type|extends|implements|async|await|try|catch|finally)\b/g,
    number: /\b\d+(\.\d+)?\b/g,
    operator: /[+\-*/%=<>!&|?:]/g,
    punctuation: /[{}[\]();,.:]/g,
  }

  const highlighted = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(patterns.comment, '<span class="text-muted-foreground italic">$&</span>')
    .replace(patterns.string, '<span class="text-green-400">$&</span>')
    .replace(patterns.keyword, '<span class="text-blue-400 font-semibold">$&</span>')
    .replace(patterns.number, '<span class="text-orange-400">$&</span>')

  return highlighted
}
