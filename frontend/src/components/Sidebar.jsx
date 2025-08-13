export default function Sidebar({ conversations, activeChat, onSelectChat }) {
  return (
    <div
      className={`${activeChat ? "hidden" : "flex"} md:flex w-full md:w-1/3 border-r bg-white flex-col`}
    >
      <h2 className="p-4 font-bold text-lg border-b bg-gray-50">Chats</h2>
      <div className="overflow-y-auto flex-1">
        {conversations.map((c) => (
          <div
            key={c.wa_id}
            onClick={() => onSelectChat(c.wa_id)}
            className={`flex items-center p-3 cursor-pointer hover:bg-gray-100 transition border-b ${
              activeChat === c.wa_id ? "bg-gray-200" : ""
            }`}
          >
            <div className="w-10 h-10 flex-shrink-0 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
              {c.name ? c.name.charAt(0).toUpperCase() : c.wa_id.charAt(0)}
            </div>
            <div className="flex-1 ml-3 min-w-0">
              <div className="flex justify-between items-center">
                <span className="font-semibold truncate">{c.name || c.wa_id}</span>
                <span className="text-xs text-gray-400">
                  {c.last_timestamp
                    ? new Date(c.last_timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </span>
              </div>
              <div className="text-sm text-gray-500 truncate">{c.last_message}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
