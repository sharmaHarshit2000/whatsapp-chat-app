import { useEffect, useState, useRef } from "react";
import { getConversations, getMessages, sendMessage } from "./api";
import { io } from "socket.io-client";
import { Toaster } from "react-hot-toast";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";

const socket = io(import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:4000");

export default function App() {
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [activeChatName, setActiveChatName] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    loadConversations();
  }, []);

  // Refresh name if conversations update
  useEffect(() => {
    // Whenever conversations update, refresh activeChatName
    if (activeChat) {
      const chat = conversations.find((c) => c.wa_id === activeChat);
      if (chat) {
        setActiveChatName(chat.name || chat.wa_id);
      }
    }
  }, [conversations, activeChat]);

  const loadConversations = async () => {
    const res = await getConversations();
    setConversations(res.data);
  };

  const loadMessages = async (wa_id) => {
    setActiveChat(wa_id);
    const chat = conversations.find((c) => c.wa_id === wa_id);
    setActiveChatName(chat?.name || wa_id);
    const res = await getMessages(wa_id);
    setMessages(res.data);
    scrollToBottom();
  };

  const scrollToBottom = () => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const handleSend = async () => {
    if (!input.trim() || !activeChat) return;

    // Keep the existing name
    if (!activeChatName || activeChatName === activeChat) {
      const chat = conversations.find((c) => c.wa_id === activeChat);
      if (chat) {
        setActiveChatName(chat.name || chat.wa_id);
      }
    }

    await sendMessage(activeChat, input);
    setInput("");
  };

  useEffect(() => {
    socket.on("new_message", (msg) => {
      if (msg.wa_id === activeChat) {
        setMessages((prev) => [...prev, msg]);
        scrollToBottom();
      }
      loadConversations();
    });

    socket.on("update_status", ({ id, status }) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status } : m))
      );
    });

    return () => {
      socket.off("new_message");
      socket.off("update_status");
    };
  }, [activeChat]);

  return (
    <div className="flex h-screen bg-gray-100">
      <Toaster position="top-right" />
      <Sidebar
        conversations={conversations}
        activeChat={activeChat}
        onSelectChat={loadMessages}
      />
      <ChatWindow
        activeChat={activeChat}
        activeChatName={activeChatName}
        messages={messages}
        onBack={() => setActiveChat(null)}
        input={input}
        setInput={setInput}
        onSend={handleSend}
        bottomRef={bottomRef}
      />
    </div>
  );
}
