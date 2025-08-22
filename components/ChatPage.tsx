import React, { useState, useEffect, useRef } from 'react';
import { User, Conversation, DirectMessage, Guide } from '../types';
import Button from './common/Button';
import Spinner from './common/Spinner';

interface ChatPageProps {
  currentUser: User;
  conversations: Conversation[];
  messages: DirectMessage[];
  guides: Guide[];
  activeConversationId: string | null;
  onViewConversation: (conversationId: string) => void;
  onSendMessage: (conversationId: string, text: string) => void;
  onTranslateMessage: (messageId: string) => Promise<void>;
  onBack: () => void;
}

const ConversationListItem: React.FC<{ 
    conversation: Conversation; 
    lastMessage?: DirectMessage;
    guide?: Guide;
    onClick: () => void;
    isActive: boolean;
}> = ({ conversation, lastMessage, guide, onClick, isActive }) => {
    if (!guide) return null;

    return (
        <button 
            onClick={onClick} 
            className={`w-full text-left p-4 rounded-lg flex items-center gap-4 transition-colors ${isActive ? 'bg-primary/10 dark:bg-primary/20' : 'hover:bg-gray-100 dark:hover:bg-dark-light'}`}
        >
            <img src={guide.avatarUrl} alt={guide.name} className="w-14 h-14 rounded-full object-cover" />
            <div className="flex-grow overflow-hidden">
                <h3 className="font-bold text-dark dark:text-light truncate">{guide.name}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm truncate">{lastMessage?.text || 'No messages yet'}</p>
            </div>
        </button>
    );
};

const MessageBubble: React.FC<{ 
    message: DirectMessage; 
    isOwnMessage: boolean;
    onTranslate: () => void;
    isTranslating: boolean;
}> = ({ message, isOwnMessage, onTranslate, isTranslating }) => {
    return (
        <div className={`flex gap-3 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-md p-3 rounded-2xl ${isOwnMessage ? 'bg-primary text-white rounded-br-none' : 'bg-light dark:bg-dark rounded-bl-none'}`}>
                <p className="text-sm">{message.translatedText || message.text}</p>
                {message.translatedText && <span className="text-xs opacity-70 mt-1 block">(Translated)</span>}
            </div>
            {!isOwnMessage && !message.translatedText && (
                <Button variant="ghost" className="px-2 py-1 self-end" onClick={onTranslate} disabled={isTranslating}>
                    {isTranslating ? <Spinner className="w-4 h-4" /> : 'Translate'}
                </Button>
            )}
        </div>
    );
};

const ConversationView: React.FC<{
    conversation: Conversation;
    messages: DirectMessage[];
    currentUser: User;
    guide: Guide;
    onSendMessage: (conversationId: string, text: string) => void;
    onTranslateMessage: (messageId: string) => Promise<void>;
    onBack: () => void;
}> = ({ conversation, messages, currentUser, guide, onSendMessage, onTranslateMessage, onBack }) => {
    const [input, setInput] = useState('');
    const [translatingId, setTranslatingId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(scrollToBottom, [messages]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        onSendMessage(conversation.id, input);
        setInput('');
    };
    
    const handleTranslate = async (messageId: string) => {
        setTranslatingId(messageId);
        await onTranslateMessage(messageId);
        setTranslatingId(null);
    };

    if (!guide) return <div>Guide not found.</div>;

    return (
        <div className="flex flex-col h-full">
             <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-4">
                <button onClick={onBack} className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-lighter">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </button>
                <img src={guide.avatarUrl} alt={guide.name} className="w-10 h-10 rounded-full" />
                <h2 className="font-bold text-lg">{guide.name}</h2>
            </header>
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map(msg => (
                    <MessageBubble 
                        key={msg.id}
                        message={msg}
                        isOwnMessage={msg.senderId === currentUser.id}
                        onTranslate={() => handleTranslate(msg.id)}
                        isTranslating={translatingId === msg.id}
                    />
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2 bg-white dark:bg-dark-light">
                <input 
                    type="text" 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 p-3 rounded-full border border-gray-300 dark:border-gray-600 bg-light dark:bg-dark focus:ring-2 focus:ring-primary focus:border-transparent transition"
                />
                <button type="submit" className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-50" disabled={!input.trim()}>
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </button>
            </form>
        </div>
    );
};


const ChatPage: React.FC<ChatPageProps> = (props) => {
  const { conversations, messages, activeConversationId, onViewConversation, currentUser, guides } = props;

  const sortedConversations = [...conversations].sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp);
  
  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const activeGuide = activeConversation ? guides.find(g => g.id === activeConversation.guideId) : undefined;
  const activeMessages = messages.filter(m => m.conversationId === activeConversationId).sort((a, b) => a.timestamp - b.timestamp);
  
  return (
    <div className="bg-white dark:bg-dark-light rounded-2xl shadow-lg h-[80vh] flex">
        <aside className={`w-full md:w-1/3 lg:w-1/4 border-r border-gray-200 dark:border-gray-700 flex-col ${activeConversationId ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-2xl font-bold">Messages</h1>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
                {sortedConversations.map(conv => {
                    const lastMessage = messages
                        .filter(m => m.conversationId === conv.id)
                        .sort((a, b) => b.timestamp - a.timestamp)[0];
                    const guide = guides.find(g => g.id === conv.guideId);
                    return (
                        <ConversationListItem 
                            key={conv.id}
                            conversation={conv}
                            lastMessage={lastMessage}
                            guide={guide}
                            onClick={() => onViewConversation(conv.id)}
                            isActive={activeConversationId === conv.id}
                        />
                    );
                })}
            </div>
        </aside>
        <main className={`flex-1 ${!activeConversationId ? 'hidden md:flex' : 'flex'}`}>
            {activeConversation && activeGuide ? (
                <ConversationView 
                    conversation={activeConversation}
                    messages={activeMessages}
                    currentUser={currentUser}
                    guide={activeGuide}
                    onSendMessage={props.onSendMessage}
                    onTranslateMessage={props.onTranslateMessage}
                    onBack={props.onBack}
                />
            ) : (
                <div className="flex-1 items-center justify-center hidden md:flex flex-col text-center p-8">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    <h2 className="mt-4 text-xl font-semibold text-gray-700 dark:text-gray-300">Select a conversation</h2>
                    <p className="text-gray-500 dark:text-gray-400">Choose a chat from the left panel to view messages.</p>
                </div>
            )}
        </main>
    </div>
  );
};

export default ChatPage;