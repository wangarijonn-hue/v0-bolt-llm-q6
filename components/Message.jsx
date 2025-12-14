import React from "react";
import { motion } from "framer-motion";
import MarkdownRenderer from "./MarkdownRenderer";

/**
 * Message component:
 * - Uses motion for enter/exit
 * - Renders markdown safely with syntax highlighting
 * - Provides accessible labels for screen readers
 */
function VisuallyHidden({ children }) {
  return (
    <span
      className="sr-only"
      style={{
        position: "absolute",
        width: 1,
        height: 1,
        padding: 0,
        margin: -1,
        overflow: "hidden",
        clip: "rect(0,0,0,0)",
        whiteSpace: "nowrap",
        border: 0,
      }}
    >
      {children}
    </span>
  );
}

function Message({ message, darkMode = false }) {
  const isUser = message.sender === "user";
  const senderLabel = isUser ? "You" : message.sender || "AI";
  const timestampLabel = message.timestamp
    ? ` at ${new Date(message.timestamp).toLocaleString()}`
    : "";
  const ariaLabel = `${senderLabel}${timestampLabel}: ${String(
    message.text ?? ""
  )}`;

  const avatarContent = isUser ? "U" : "AI";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.18 }}
      className={`flex items-end ${isUser ? "justify-end" : "justify-start"} relative`}
      role="group"
      aria-roledescription="chat message"
      aria-label={ariaLabel}
    >
      {!isUser && (
        <div
          className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white mr-2 flex-shrink-0"
          aria-hidden="false"
        >
          <span aria-hidden="true" className="font-semibold">
            {avatarContent}
          </span>
          <VisuallyHidden>{senderLabel}</VisuallyHidden>
        </div>
      )}

      <div
        className={`max-w-xs md:max-w-lg p-3 rounded-lg shadow-sm break-words ${
          isUser
            ? "bg-blue-600 text-white rounded-br-none"
            : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none"
        }`}
      >
        <MarkdownRenderer darkMode={darkMode}>
          {String(message.text ?? "")}
        </MarkdownRenderer>
      </div>

      {isUser && (
        <div
          className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white ml-2 flex-shrink-0"
          aria-hidden="false"
        >
          <span aria-hidden="true" className="font-semibold">
            {avatarContent}
          </span>
          <VisuallyHidden>{senderLabel}</VisuallyHidden>
        </div>
      )}
    </motion.div>
  );
}

export default React.memo(Message);
