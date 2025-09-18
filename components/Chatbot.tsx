import React, { useState, useRef, useEffect } from 'react';
import { Chat } from '@google/genai';
import { ai } from '../services/geminiService';
import { ChatMessage, User } from '../types';
import { useAuth } from '../contexts/AuthContext';

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(scrollToBottom, [messages]);
  
  const getSystemInstruction = (currentUser: User | null): string => {
      if (!currentUser) {
          return "You are 'MahaYatri Guide', a friendly and enthusiastic AI travel assistant for exploring Maharashtra, India. Your goal is to help users discover places, plan trips, and learn about the local culture. Keep your answers concise, helpful, and engaging. Use markdown for formatting when appropriate.";
      }
      
      const preferences = currentUser.preferences.length > 0 ? `Their travel interests include ${currentUser.preferences.join(', ')}.` : '';
      return `You are a personal travel assistant for ${currentUser.name}. ${preferences} Use this information to give them tailored advice for exploring Maharashtra, India. Be friendly, concise, and engaging. Use markdown for formatting.`;
  }

  useEffect(() => {
    if (isOpen && !chatRef.current && user) {
        chatRef.current = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: getSystemInstruction(user),
            },
        });
        setMessages([{ sender: 'ai', text: `Namaste ${user.name.split(' ')[0]}! How can I help you plan your adventure in Maharashtra today?` }]);
    }
  }, [isOpen, user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const userMessage: ChatMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
        if (!chatRef.current) throw new Error("Chat not initialized");
        const response = await chatRef.current.sendMessage({ message: input });
        const aiMessage: ChatMessage = { sender: 'ai', text: response.text };
        setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
        console.error("Chatbot error:", error);
        const errorMessage: ChatMessage = { sender: 'ai', text: "Sorry, I'm having a little trouble right now. Please try again later."};
        setMessages(prev => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="bg-primary text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center transform hover:scale-110 active:scale-95 transition-transform"
          aria-label="Toggle chatbot"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        </button>
      </div>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-full max-w-sm h-[70vh] max-h-[600px] z-50 bg-white dark:bg-dark-light shadow-2xl rounded-2xl flex flex-col animate-slide-up origin-bottom-right">
            <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="font-bold text-lg">MahaYatri Assistant</h3>
                <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-dark-lighter">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
            </header>
            
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white font-bold">AI</div>}
                        <div className={`max-w-xs md:max-w-sm p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-light dark:bg-dark rounded-bl-none'}`}>
                            <p className="text-sm" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }}/>
                        </div>
                    </div>
                ))}
                 {isLoading && (
                    <div className="flex gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white font-bold">AI</div>
                        <div className="max-w-xs p-3 rounded-2xl bg-light dark:bg-dark">
                           <div className="flex items-center space-x-1">
                              <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
	                            <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
	                            <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></span>
                           </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2">
                <input 
                    type="text" 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Ask me anything..."
                    className="flex-1 p-3 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    disabled={isLoading}
                />
                <button type="submit" className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-50" disabled={isLoading || !input.trim()}>
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </button>
            </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;