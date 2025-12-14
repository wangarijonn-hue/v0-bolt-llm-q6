import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark, materialLight } from "react-syntax-highlighter/dist/esm/styles/prism";

/**
 * Safe markdown renderer with code block highlighting.
 * Props:
 * - children: markdown string
 * - darkMode: boolean to pick theme for SyntaxHighlighter
 */
export default function MarkdownRenderer({ children, darkMode = false }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeSanitize]}
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-([^\s]+)/.exec(className || "");
          if (!inline && match) {
            return (
              <SyntaxHighlighter
                style={darkMode ? materialDark : materialLight}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            );
          }
          return (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
