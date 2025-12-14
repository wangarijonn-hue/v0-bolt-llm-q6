import React, { useState, useRef, useEffect } from "react";

export default React.memo(function ChatInput({
  onSend,
  isDisabled = false,
  placeholder = "Ask me anything...",
  maxRows = 6,
  maxLength,
}) {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  // Auto-resize textarea to fit content up to maxRows
  const adjustHeight = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto"; // reset to measure scrollHeight
    const lineHeight = parseFloat(window.getComputedStyle(ta).lineHeight || "20");
    const maxHeight = lineHeight * maxRows;
    ta.style.height = Math.min(ta.scrollHeight, maxHeight) + "px";
  };

  useEffect(() => {
    adjustHeight();
  }, [text]);

  useEffect(() => {
    // ensure starting height is correct
    adjustHeight();
  }, []);

  const handleSend = () => {
    if (isDisabled) return;
    const trimmed = String(text || "").trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
    // return focus to textarea for fast follow-up
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    // Enter without shift sends; Shift+Enter inserts newline
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = !isDisabled && String(text || "").trim().length > 0;

  return (
    <div className="p-4 border-t dark:border-gray-700 flex items-center gap-2">
      <label htmlFor="chat-input" className="sr-only">
        Message
      </label>

      <textarea
        id="chat-input"
        ref={textareaRef}
        className="flex-1 border rounded-lg p-2 resize-none dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={1}
        placeholder={placeholder}
        value={text}
        maxLength={maxLength}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        aria-label="Message input"
        aria-disabled={isDisabled}
        disabled={isDisabled}
        style={{ overflow: "hidden" }}
      />

      <button
        type="button"
        onClick={handleSend}
        disabled={!canSend}
        aria-disabled={!canSend}
        className={`flex items-center justify-center px-4 py-2 rounded-lg transition ${
          canSend
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-gray-300 text-gray-600 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400"
        }`}
      >
        {/* simple inline spinner when disabled/sending; replace with your spinner if you have one */}
        {isDisabled ? (
          <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        ) : (
          "Send"
        )}
      </button>
    </div>
  );
});
