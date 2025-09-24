

import React, { useState, useRef, useEffect } from 'react';
import { User, Conversation, DirectMessage } from '../types';
import { mockConversations, mockMessages, mockGuides, otherUsers } from '../services/mockData';
import Input from './common/Input';
import Button from './common/Button';
import LazyImage from './common/LazyImage';

interface ChatPageProps {
  currentUser: User;
  allUsers: User[];
}

const ChatPage: React.FC<ChatPageProps> = ({ currentUser }) => {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [messages, setMessages] = useState<DirectMessage[]>(mockMessages);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(conversations[0]?.id || null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const allUsers = [currentUser, ...mockGuides, ...otherUsers];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedConversationId]);

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);
  const currentMessages = messages.filter(m => m.conversationId === selectedConversationId);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversationId) return;

    const newMsg: DirectMessage = {
      id: `msg-${Date.now()}`,
      conversationId: selectedConversationId,
      senderId: currentUser.id,
      text: newMessage,
      timestamp: Date.now(),
    };
    
    setMessages(prev => [...prev, newMsg]);
    setNewMessage('');
  };
  
  const getOtherParticipant = (convo: Conversation) => {
    const otherId = convo.userId === currentUser.id ? convo.guideId : convo.userId;
    return allUsers.find(u => u.id === otherId);
  };

  return (
    <div className="flex h-[calc(100vh-150px)] bg-white dark:bg-dark-light rounded-2xl shadow-lg overflow-hidden">
      {/* Sidebar with conversations */}
      <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map(convo => {
            const otherUser = getOtherParticipant(convo);
            if (!otherUser) return null;
            return (
              <button
                key={convo.id}
                onClick={() => setSelectedConversationId(convo.id)}
                className={`w-full text-left p-4 flex items-center gap-3 transition-colors ${selectedConversationId === convo.id ? 'bg-primary/10' : 'hover:bg-gray-100 dark:hover:bg-dark-lighter'}`}
              >
                <LazyImage src={otherUser.avatarUrl} alt={otherUser.name} className="w-12 h-12 rounded-full" placeholderClassName="rounded-full" />
                <div className="flex-1 overflow-hidden">
                  <p className="font-semibold truncate">{otherUser.name}</p>
                  {/* FIX: Replaced `findLast` with a compatible alternative to support older JS runtimes. */}
                  <p className="text-sm text-gray-500 truncate">{[...messages].reverse().find(m => m.conversationId === convo.id)?.text}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main chat window */}
      <div className="w-2/3 flex flex-col">
        {selectedConversation && getOtherParticipant(selectedConversation) ? (
          <>
            <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
               <LazyImage src={getOtherParticipant(selectedConversation)?.avatarUrl || ''} alt="" className="w-10 h-10 rounded-full" placeholderClassName="rounded-full" />
               <h3 className="font-bold">{getOtherParticipant(selectedConversation)?.name}</h3>
            </header>
            <main className="flex-1 p-6 overflow-y-auto space-y-4">
              {currentMessages.map(msg => {
                const isSender = msg.senderId === currentUser.id;
                const sender = allUsers.find(u => u.id === msg.senderId);
                return (
                  <div key={msg.id} className={`flex gap-3 ${isSender ? 'justify-end' : 'justify-start'}`}>
                    {!isSender && <LazyImage src={sender?.avatarUrl || ''} alt={sender?.name || ''} className="w-8 h-8 rounded-full" placeholderClassName="rounded-full"/>}
                    <div className={`max-w-md p-3 rounded-2xl ${isSender ? 'bg-primary text-white rounded-br-none' : 'bg-light dark:bg-dark rounded-bl-none'}`}>
                        <p className="text-sm">{msg.text}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </main>
            <footer className="p-4 border-t border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <Input label="" placeholder="Type a message..." value={newMessage} onChange={e => setNewMessage(e.target.value)} className="flex-1"/>
                    <Button type="submit" disabled={!newMessage.trim()}>Send</Button>
                </form>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <p>Select a conversation to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;