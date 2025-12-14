"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, ExternalLink, AlertCircle } from "lucide-react"

interface LivePreviewProps {
  files: Record<string, string>
}

export function LivePreview({ files }: LivePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (Object.keys(files).length > 0) {
      generatePreview()
    }
  }, [files])

  const generatePreview = () => {
    setIsLoading(true)

    // Generate HTML preview from files
    const htmlContent = generateHTMLPreview(files)

    // Create a blob URL for the preview
    const blob = new Blob([htmlContent], { type: "text/html" })
    const url = URL.createObjectURL(blob)

    setPreviewUrl(url)
    setIsLoading(false)
  }

  const handleRefresh = () => {
    generatePreview()
  }

  const handleOpenExternal = () => {
    if (previewUrl) {
      window.open(previewUrl, "_blank")
    }
  }

  if (Object.keys(files).length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-4 bg-muted/10">
        <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No Preview Available</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Generate some code with the AI assistant to see a live preview
        </p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-4 py-2 border-b border-border flex items-center justify-between bg-card">
        <span className="text-sm font-medium text-foreground">Preview</span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleRefresh} className="h-7 gap-1">
            <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
            <span className="text-xs">Refresh</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={handleOpenExternal} className="h-7 gap-1">
            <ExternalLink className="w-3 h-3" />
            <span className="text-xs">Open</span>
          </Button>
        </div>
      </div>
      <div className="flex-1 relative bg-white">
        {previewUrl && (
          <iframe
            ref={iframeRef}
            src={previewUrl}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin"
            title="Live Preview"
          />
        )}
      </div>
    </div>
  )
}

function generateHTMLPreview(files: Record<string, string>): string {
  // Find HTML, CSS, JS files
  const htmlFile = Object.entries(files).find(([path]) => path.endsWith(".html"))
  const cssFiles = Object.entries(files).filter(([path]) => path.endsWith(".css"))
  const jsFiles = Object.entries(files).filter(([path]) => path.endsWith(".js") || path.endsWith(".jsx"))

  // If there's an HTML file, use it as base
  if (htmlFile) {
    let html = htmlFile[1]

    // Inject CSS
    const cssStyles = cssFiles.map(([, content]) => `<style>${content}</style>`).join("\n")

    // Inject JS
    const jsScripts = jsFiles.map(([, content]) => `<script>${content}</script>`).join("\n")

    // Insert styles and scripts before closing head/body
    html = html.replace("</head>", `${cssStyles}\n</head>`)
    html = html.replace("</body>", `${jsScripts}\n</body>`)

    return html
  }

  // If no HTML file, check for React/JSX components
  const reactFiles = Object.entries(files).filter(([path]) => path.endsWith(".jsx") || path.endsWith(".tsx"))

  if (reactFiles.length > 0) {
    return generateReactPreview(reactFiles, cssFiles)
  }

  // Default: show a simple preview with all code
  const allCode = Object.entries(files)
    .map(([path, content]) => `<h3>${path}</h3><pre><code>${escapeHtml(content)}</code></pre>`)
    .join("\n")

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Preview</title>
      <style>
        body { font-family: system-ui; padding: 20px; background: #f5f5f5; }
        h3 { margin-top: 20px; color: #333; }
        pre { background: #fff; padding: 15px; border-radius: 5px; overflow-x: auto; }
        code { font-family: 'Monaco', 'Menlo', monospace; font-size: 13px; }
      </style>
    </head>
    <body>
      <h2>Generated Code Preview</h2>
      ${allCode}
    </body>
    </html>
  `
}

function generateReactPreview(reactFiles: [string, string][], cssFiles: [string, string][]): string {
  const cssStyles = cssFiles.map(([, content]) => content).join("\n")

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>React Preview</title>
      <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
      <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
      <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: system-ui, -apple-system, sans-serif; }
        ${cssStyles}
      </style>
    </head>
    <body>
      <div id="root"></div>
      <script type="text/babel">
        const { useState, useEffect } = React;
        ${reactFiles.map(([, content]) => content).join("\n\n")}
        
        // Try to render the main component
        const root = ReactDOM.createRoot(document.getElementById('root'));
        
        // Find App component or first exported component
        try {
          if (typeof App !== 'undefined') {
            root.render(<App />);
          } else {
            root.render(<div style={{ padding: '20px' }}>No App component found. Make sure to export an App component.</div>);
          }
        } catch (error) {
          root.render(<div style={{ padding: '20px', color: 'red' }}>Error rendering: {error.message}</div>);
        }
      </script>
    </body>
    </html>
  `
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}
