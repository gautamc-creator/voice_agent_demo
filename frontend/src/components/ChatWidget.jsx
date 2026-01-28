import React, { useState, useRef, useEffect } from 'react';
import VoiceRecorder from './VoiceRecorder';
import '../styles/ChatWidget.css';

export default function ChatWidget() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatResponse = (text, sources) => {
    // Handle if text is undefined or null
    if (!text || typeof text !== 'string') {
      return '<p>Unable to format response</p>';
    }

    // Convert markdown-like formatting to HTML
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.*?)__/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
      .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
      .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
      .replace(/\n- (.*?)(?=\n|$)/g, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>');

    // Add sources if available
    if (sources && sources.length > 0) {
      formatted += '<div class="sources-inline"><strong>Sources:</strong><ul>';
      sources.forEach(source => {
        formatted += `<li><a href="${source.url}" target="_blank" rel="noopener noreferrer">${source.title}</a></li>`;
      });
      formatted += '</ul></div>';
    }

    return formatted;
  };

  const handleResponse = async (transcript) => {
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: transcript }]);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: transcript })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Log the response to debug
      console.log('Backend response:', data);

      // The backend returns 'answer' and 'sources'
      const answerText = data.answer || 'No response received';
      const sources = data.sources || [];
      const formattedResponse = formatResponse(answerText, sources);

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: formattedResponse,
        isHtml: true
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '<p>Sorry, I encountered an error. Please try again.</p>',
        isHtml: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-widget">
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message message-${msg.role}`}>
            {msg.isHtml ? (
              <div 
                className="message-content formatted"
                dangerouslySetInnerHTML={{ __html: msg.content }}
              />
            ) : (
              <div className="message-content">{msg.content}</div>
            )}
          </div>
        ))}
        {loading && <div className="message message-assistant"><div className="typing">Assistant is typing...</div></div>}
        <div ref={messagesEndRef} />
      </div>
      <VoiceRecorder onTranscript={handleResponse} disabled={loading} />
    </div>
  );
}