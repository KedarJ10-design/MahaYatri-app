
import React, { useState, useRef, useEffect } from 'react';
import { User, Conversation, DirectMessage } from '../types';
import { db, functions } from '../services/firebase';
import Input from './common/Input';
import Button from './common/Button';
import LazyImage from './common/LazyImage';
import Spinner from './common/Spinner';
import { useAppStore } from '../store/appStore';

interface ChatPageProps {
  currentUser: User;
}

const ChatPage: React.FC<ChatPageProps> = ({ currentUser }) => {
  const { allUsers } = useAppStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedConversationId]);
  
  // Fetch conversations for the current user
  useEffect(() => {
    if (!db) {
        setLoading(false);
        return;
    }
    setLoading(true);

    const queries = [
        db.collection('conversations').where('userId', '==', currentUser.id),
        db.collection('conversations').where('guideId', '==', currentUser.id)
    ];

    const unsubs = queries.map(query => {
        return query.onSnapshot(snapshot => {
            const fetchedConvos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Conversation));
            setConversations(prev => {
                const convoMap = new Map(prev.map(c => [c.id, c]));
                fetchedConvos.forEach(c => convoMap.set(c.id, c));
                const sorted = Array.from(convoMap.values()).sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp);
                if (!selectedConversationId && sorted.length > 0) {
                    setSelectedConversationId(sorted[0].id);
                }
                return sorted;
            });
            setLoading(false);
        });
    });

    return () => unsubs.forEach(unsub => unsub());
  }, [currentUser.id, selectedConversationId]);

  // Fetch messages for the selected conversation
  useEffect(() => {
    if (!selectedConversationId || !db) {
        setMessages([]);
        return;
    }

    const query = db.collection('messages')
                    .where('conversationId', '==', selectedConversationId)
                    .orderBy('timestamp', 'asc');
    
    const unsubscribe = query.onSnapshot(snapshot => {
        const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DirectMessage));
        setMessages(msgs);
    });

    return () => unsubscribe();
  }, [selectedConversationId]);


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversationId || !functions) return;

    const messageToSend = newMessage;
    setNewMessage('');

    try {
        const sendMessageFn = functions.httpsCallable('sendMessage');
        await sendMessageFn({ conversationId: selectedConversationId, text: messageToSend });
    } catch (error) {
        console.error("Error sending message:", error);
        // Restore message on failure
        setNewMessage(messageToSend);
        // Ideally, show a toast message here.
    }
  };
  
  const getOtherParticipant = (convo: Conversation) => {
    const otherId = convo.userId === currentUser.id ? convo.guideId : convo.userId;
    return allUsers.find(u => u.id === otherId);
  };

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  return (
    <div className="flex h-[calc(100vh-150px)] bg-white dark:bg-dark-light rounded-2xl shadow-lg overflow-hidden">
      {/* Sidebar with conversations */}
      <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? <div className="p-4"><Spinner /></div> : conversations.map(convo => {
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
              {messages.map(msg => {
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
            {loading ? <Spinner /> : <p>Select a conversation to start chatting.</p>}
          </div>
        )}
      </div>
    </div>
  );
};

// FIX: Add default export to resolve import error in App.tsx.
export default ChatPage;
