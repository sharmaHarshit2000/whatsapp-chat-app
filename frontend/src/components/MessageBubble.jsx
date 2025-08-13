import { FaCheck, FaCheckDouble } from "react-icons/fa";

const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString();
};

export default function MessageBubble({ message, isIncoming, lastDate }) {
  const msgDate = formatDate(message.timestamp);
  const showDate = msgDate !== lastDate.current;
  if (showDate) lastDate.current = msgDate;

  return (
    <>
      {showDate && (
        <div className="text-center text-xs text-gray-500 my-3">{msgDate}</div>
      )}
      <div className={`mb-2 flex ${isIncoming ? "justify-start" : "justify-end"}`}>
        <div
          className={`px-3 py-2 rounded-2xl max-w-xs shadow ${
            isIncoming ? "bg-white text-gray-800" : "bg-green-100 text-gray-800"
          }`}
        >
          <div>{message.text}</div>
          <div className="text-xs text-gray-500 flex items-center justify-end mt-1">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
            {message.status === "sent" && <FaCheck className="ml-1" />}
            {message.status === "delivered" && <FaCheckDouble className="ml-1" />}
            {message.status === "read" && (
              <FaCheckDouble className="ml-1 text-blue-500" />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
