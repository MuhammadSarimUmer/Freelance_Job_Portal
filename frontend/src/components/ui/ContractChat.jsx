import { useEffect, useRef, useState } from "react";
import { messageService } from "../../api/services/messageService";
import { useToast } from "../../context/ToastContext";

function ContractChat({ contractID, currentUserId }) {
  const { addToast } = useToast();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const fetchMessages = async (showLoader = false) => {
    if (!contractID) return;
    if (showLoader) setIsLoading(true);

    try {
      const res = await messageService.getMessages(contractID);
      setMessages(res.data?.data || []);
      if (currentUserId) {
        messageService.markAsRead(contractID).catch(() => null);
      }
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to load messages.", "error");
    } finally {
      if (showLoader) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages(true);
    const interval = setInterval(() => fetchMessages(false), 5000);
    return () => clearInterval(interval);
  }, [contractID]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    try {
      setIsSending(true);
      await messageService.sendMessage({
        contractID,
        content: newMessage.trim(),
      });
      setNewMessage("");
      await fetchMessages(false);
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to send message.", "error");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div
        style={{
          background: "var(--color-surface-container)",
          borderRadius: "8px",
          padding: "1.5rem",
          border: "1px solid var(--color-outline-variant)",
          minHeight: "360px",
          maxHeight: "420px",
          overflowY: "auto",
        }}
      >
        {isLoading ? (
          <p style={{ color: "var(--color-on-surface-variant)" }}>Loading messages...</p>
        ) : messages.length === 0 ? (
          <p style={{ color: "var(--color-on-surface-variant)" }}>No messages yet. Start the conversation.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {messages.map((message) => {
              const isMine =
                message.senderID === currentUserId || message.sender?.userID === currentUserId;
              return (
                <div
                  key={message.messageID}
                  style={{
                    alignSelf: isMine ? "flex-end" : "flex-start",
                    maxWidth: "70%",
                    background: isMine
                      ? "linear-gradient(135deg, var(--color-primary), var(--color-primary-container))"
                      : "var(--color-surface-container-high)",
                    color: isMine ? "var(--color-on-primary)" : "var(--color-on-surface)",
                    padding: "0.9rem 1rem",
                    borderRadius: "10px",
                    boxShadow: "0 8px 18px rgba(0,0,0,0.2)",
                  }}
                >
                  <p style={{ margin: 0, fontSize: "0.75rem", opacity: 0.7 }}>
                    {message.sender?.fullName || "Member"} •{" "}
                    {message.createdAt
                      ? new Date(message.createdAt).toLocaleString()
                      : ""}
                  </p>
                  <p style={{ margin: "0.4rem 0 0", whiteSpace: "pre-wrap" }}>{message.content}</p>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          gap: "1rem",
          alignItems: "flex-end",
          flexWrap: "wrap",
        }}
      >
        <textarea
          value={newMessage}
          onChange={(event) => setNewMessage(event.target.value)}
          placeholder="Type your update..."
          rows={2}
          style={{
            flex: 1,
            minWidth: "240px",
            background: "var(--color-surface)",
            color: "var(--color-on-surface)",
            border: "1px solid var(--color-outline-variant)",
            borderRadius: "6px",
            padding: "0.75rem",
            fontFamily: "var(--font-body)",
            resize: "vertical",
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              handleSend();
            }
          }}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={isSending}
          style={{
            background: "var(--color-secondary)",
            color: "var(--color-on-secondary)",
            border: "none",
            borderRadius: "6px",
            padding: "0.75rem 1.5rem",
            cursor: isSending ? "not-allowed" : "pointer",
            fontFamily: "var(--font-headline)",
            fontWeight: 700,
          }}
        >
          {isSending ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}

export default ContractChat;
