import { useEffect, useRef } from "react";
import { useSwipeable } from "react-swipeable";
import { AnimatePresence, motion } from "framer-motion";
import Message from "./Message";
import ChatInput from "./ChatInput";

/**
 * ChatWindow:
 * - Auto-scrolls only when user is near bottom
 * - Stable keys for messages
 * - AnimatePresence for message enter/exit
 * - Swipe handlers
 */
export default function ChatWindow({ messages, onSend, isTyping, onSwipe, darkMode = false }) {
  const containerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const autoScrollRef = useRef(true);
  const NEAR_BOTTOM_THRESHOLD = 120; // px

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onScroll = () => {
      const distanceFromBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;
      autoScrollRef.current = distanceFromBottom <= NEAR_BOTTOM_THRESHOLD;
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (autoScrollRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => onSwipe?.("left"),
    onSwipedRight: () => onSwipe?.("right"),
    delta: 10,
  });

  return (
    <div
      {...swipeHandlers}
      className="flex flex-col h-full w-full max-w-3xl mx-auto border rounded-lg shadow-lg bg-white dark:bg-gray-900"
    >
      {/* Header */}
      <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">AI Chat</h2>
      </div>

      {/* Messages */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-3" role="log" aria-live="polite" tabIndex={0}>
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const key = msg.id ?? msg.clientId ?? msg._id ?? msg.timestamp ?? JSON.stringify(msg).slice(0, 40);
            return (
              <motion.div key={key} layout>
                <Message message={msg} darkMode={darkMode} />
              </motion.div>
            );
          })}
        </AnimatePresence>

        {isTyping && <p className="italic text-gray-500 dark:text-gray-400">AI is typing...</p>}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={onSend} />
    </div>
  );
}
