// src/App.jsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import StructuredResponse from './components/StructuredResponse';
import { fetchRAGResponse } from './api/chatService';
import { BsSendFill } from 'react-icons/bs'; 

// Define the message structure for chat history
/**
 * @typedef {object} ChatMessage
 * @property {'user' | 'assistant'} role
 * @property {string | import('./api/chatService').FinalHadithResponse} content
 */

function App() {
  const sessionIdRef = React.useRef(Date.now().toString());
  const messagesEndRef = useRef(null);

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ 
        role: 'assistant', 
        content: "Welcome! I remember previous messages in this session. Ask me about a topic (e.g., 'What is the importance of intentions?'), then follow up with a related question like 'tell me more about it'." 
      }]);
    }
  }, [messages.length]);


  const handleSend = useCallback(async (e) => {
    e.preventDefault();
    await sendCurrentMessage();
  }, [input, isLoading]);

  // Extracted send logic so it can be called from both form submit and Enter key
  const sendCurrentMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const responseData = await fetchRAGResponse(input, sessionIdRef.current);
      const assistantMessage = { role: 'assistant', content: responseData };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage = {
        role: 'assistant',
        content: error.message && error.message.includes && error.message.includes('Failed to fetch')
          ? "Error: Could not connect to the API. Ensure your FastAPI server is running."
          : `An error occurred: ${error.message || String(error)}`
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading]);

  const renderMessageContent = (message) => {
    if (message.role === 'assistant' && typeof message.content === 'object' && message.content !== null) {
      // Structured responses are handled by the component
      return <StructuredResponse data={message.content} />;
    }
    // User message content
    return <p className="text-white">{message.content}</p>;
  };

  return (
    // Dark patterned background with centered hero layout
    <div className="app-hero">

      {/* Centered Hero */}
      <main className="hero-main">
        <div className="hero-inner">
          <div className="hero-center">
            {/* Logo area */}
            <div className="logo-circle">
              <img src={`${process.env.PUBLIC_URL}/logo192.png`} alt="Ansari" className="logo-img" />
            </div>
            <h1 className="hero-title">FinderAI</h1>
          </div>
        </div>
      </main>

      {/* Chat area (visible) - shows message history and assistant responses */}
      <section className="chat-area">
        <div className="chat-inner">
          {messages.map((message, index) => (
            <div key={index} className={`chat-message ${message.role === 'user' ? 'user' : 'assistant'}`}>
              {renderMessageContent(message)}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </section>

      {/* Fixed footer input - remains at the bottom of the viewport */}
      <footer className="bottom-input">
        <div className="bottom-inner">
          <form onSubmit={handleSend} className="input-form">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Salam, Message Ansari..."
              className="main-textarea"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendCurrentMessage();
                }
              }}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="send-button"
              disabled={isLoading || !input.trim()}
            >
              <BsSendFill size={20} />
            </button>
          </form>
        </div>
      </footer>
      <div className="hero-footer">
        <div className="footer-right">FinderAI can make mistakes. Consider consulting a qualified Islamic Scholar.</div>
      </div>
    </div>
  );
}

export default App;