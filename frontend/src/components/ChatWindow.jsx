import { useRef } from "react";
import MessageBubble from "./MessageBubble";

export default function ChatWindow({
  activeChat,
  activeChatName,
  messages,
  onBack,
  input,
  setInput,
  onSend,
  bottomRef,
}) {
  const lastDate = useRef(null);

  return (
    <div className={`${activeChat ? "flex" : "hidden"} md:flex flex-col flex-1`}>
      {activeChat && (
        <div className="flex items-center p-4 bg-gray-50 border-b">
          <button onClick={onBack} className="md:hidden mr-3 text-gray-500 text-lg">
            ←
          </button>
          <div className="w-10 h-10 flex-shrink-0 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
            {activeChatName?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="ml-3">
            <div className="font-semibold">{activeChatName}</div>
            <div className="text-xs text-gray-500">{activeChat}</div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            message={m}
            isIncoming={m.from === activeChat}
            lastDate={lastDate}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {activeChat && (
        <div className="p-4 flex border-t bg-white">
          <input
            className="flex-1 border rounded-full p-2 px-4 mr-2 focus:outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSend()}
            placeholder="Type a message..."
          />
          <button
            onClick={onSend}
            className="bg-green-500 text-white px-4 py-2 rounded-full"
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
}
