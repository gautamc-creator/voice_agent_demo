import React, { useState } from "react";
import VoiceRecorder from "./VoiceRecorder";

const ChatWidget = () => {
  const [messages, setMessages] = useState([]);

  const handleTranscription = async (text) => {
    if (!text) return;

    // show user message
    setMessages((prev) => [...prev, { role: "user", text }]);

    // send to backend /chat
    const res = await fetch("http://localhost:8000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: text }),
    });

    const data = await res.json();

    setMessages((prev) => [...prev, { role: "assistant", text: data.answer }]);
  };

  return (
    <div style={{ width: "350px", padding: "12px", border: "1px solid #ccc" }}>
      <div style={{ maxHeight: "300px", overflowY: "auto", padding: "8px" }}>
        {messages.map((m, i) => (
          <p key={i}>
            <strong>{m.role}:</strong> {m.text}
          </p>
        ))}
      </div>

      <VoiceRecorder onTranscription={handleTranscription} />
    </div>
  );
};

export default ChatWidget;
