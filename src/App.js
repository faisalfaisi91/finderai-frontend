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


  // Extracted send logic so it can be called from both form submit and Enter key
  const sendCurrentMessage = useCallback(async () => {
    // This function uses input and isLoading, so they are in its array
    if (!input.trim() || isLoading) return;

    const userQuery = input.trim();
    const userMessage = { role: 'user', content: userQuery };
    
    // Update state synchronously for the UI
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const responseData = await fetchRAGResponse(userQuery, sessionIdRef.current);
      
      const assistantMessage = { 
        role: 'assistant', 
        content: responseData 
      };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error(error);
      const errorMessage = { 
        role: 'assistant', 
        content: "Error: Could not connect to the API or received an invalid response."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
    // Dependency array for sendCurrentMessage: uses input, isLoading, and sessionIdRef
  }, [input, isLoading, sessionIdRef]); 


  // Handler for form submission
  const handleSend = useCallback(async (e) => {
    e.preventDefault();
    // CRITICAL FIX: Only call the function; include the function in the dependency array.
    await sendCurrentMessage(); 
  }, [sendCurrentMessage]); // Dependency array: ONLY depends on sendCurrentMessage


  const renderMessageContent = (message) => {
    if (message.role === 'assistant' && typeof message.content === 'object' && message.content !== null) {
      return <StructuredResponse data={message.content} />;
    }
    return <p className={message.role === 'user' ? "text-white" : "text-gray-800"}>{message.content}</p>;
  };

  return (
    // Outer container: Full screen, light background
    <div className="flex flex-col h-screen bg-gray-100"> 
      
      {/* 1. Header (Fixed Top Bar) - Indigo/Primary Color */}
      <header className="p-4 bg-indigo-600 text-white shadow-md flex-shrink-0">
        <div className="max-w-4xl mx-auto"> 
          <h1 className="text-2xl font-bold">🕌 Hadith AI Chatbot</h1>
          <p className="text-sm opacity-90">Conversational RAG Engine</p>
        </div>
      </header>

      {/* 2. Chat History Area (Scrollable & Centered) */}
      <div className="flex-grow overflow-y-auto p-4 space-y-6">
        <div className="max-w-4xl mx-auto space-y-6"> 
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`w-full sm:max-w-xl p-4 rounded-xl shadow-lg transition-all duration-300 ${
                  message.role === 'user' 
                    ? 'bg-blue-500 text-white' // User message: Blue (Primary accent)
                    : 'bg-white text-gray-900 border border-gray-200' // Assistant: Clean White
                }`}
              >
                {renderMessageContent(message)}
              </div>
            </div>
          ))}
          
          {/* Thinking Indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-md p-3 bg-gray-200 rounded-xl">
                <p className="text-gray-600 animate-pulse">Thinking...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 3. Input Footer (Fixed Bottom Bar & Centered Input) - Light Gray */}
      <footer className="p-4 bg-white border-t border-gray-200 flex-shrink-0 shadow-lg">
        <div className="max-w-4xl mx-auto"> 
            <form onSubmit={handleSend} className="flex w-full"> 
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your question about Hadith or Islamic topics..."
                className="flex-grow p-3 border border-gray-300 bg-white text-gray-800 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400"
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendCurrentMessage(); // Call the isolated function directly
                  }
                }}
              />
              <button
                type="submit"
                className={`p-3 text-white rounded-r-lg font-semibold flex items-center justify-center transition-colors duration-200 ${
                  isLoading || !input.trim()
                    ? 'bg-indigo-400 opacity-80 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700' // Blue accent for button
                }`}
                disabled={isLoading || !input.trim()}
              >
                <BsSendFill size={20} />
              </button>
            </form>
        </div>
      </footer>
    </div>
  );
}

export default App;