

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { User, Conversation, DirectMessage, Guide, ToastMessage } from '../types';
import Button from './common/Button';
import Spinner from './common/Spinner';
import { db } from '../services/firebase';
import { translateText } from '../services/geminiService';

interface ChatPageProps {
  currentUser: User;
  guides: Guide[];
  activeConversationId: string | null;
  onViewConversation: (conversationId: string) => void;
  onSendMessage: (conversationId: string, text: string) => Promise<void>;
  onBack: () => void;
  addToast: (message: string, type: ToastMessage['type']) => void;
}

const ConversationListItem: React.FC<{ 
    conversation: Conversation; 
    lastMessageText?: string;
    guide?: Guide;
    onClick: () => void;
    isActive: boolean;
}> = ({ conversation, lastMessageText, guide, onClick, isActive }) => {
    if (!guide) return null;

    return (
        <button 
            onClick={onClick} 
            className={`w-full text-left p-4 rounded-lg flex items-center gap-4 transition-all duration-200 transform hover:scale-[1.02] ${isActive ? 'bg-primary/10 dark:bg-primary/20 scale-[1.02]' : 'hover:bg-gray-100 dark:hover:bg-dark-light'}`}
        >
            <img src={guide.avatarUrl} alt={guide.name} className="w-14 h-14 rounded-full object-cover" />
            <div className="flex-grow overflow-hidden">
                <h3 className="font-bold text-dark dark:text-light truncate">{guide.name}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm truncate">{lastMessageText || 'No messages yet'}</p>
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
        <div className={`flex items-end gap-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-md p-3 rounded-2xl ${isOwnMessage ? 'bg-primary text-white rounded-br-none' : 'bg-light dark:bg-dark rounded-bl-none'}`}>
                <p className="text-sm">{message.translatedText || message.text}</p>
                {message.translatedText && <span className="text-xs opacity-70 mt-1 block">(Translated)</span>}
            </div>
            {!isOwnMessage && !message.translatedText && (
                <Button variant="ghost" size="sm" className="px-2 py-1 self-center" onClick={onTranslate} loading={isTranslating}>
                    Translate
                </Button>
            )}
        </div>
    );
};

const ConversationView: React.FC<{
    conversation: Conversation;
    currentUser: User;
    guide: Guide;
    onSendMessage: (conversationId: string, text: string) => Promise<void>;
    onBack: () => void;
    addToast: (message: string, type: ToastMessage['type']) => void;
}> = ({ conversation, currentUser, guide, onSendMessage, onBack, addToast }) => {
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [translatingId, setTranslatingId] = useState<string | null>(null);
    const [messages, setMessages] = useState<DirectMessage[]>([]);
    const [isLoadingMessages, setIsLoadingMessages] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!conversation.id || !db) {
            setMessages([]);
            return;
        }

        setIsLoadingMessages(true);
        const query = db.collection('messages')
                        .where('conversationId', '==', conversation.id)
                        .orderBy('timestamp', 'asc');
        
        const unsubscribe = query.onSnapshot(
            (snapshot) => {
                const fetchedMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DirectMessage));
                setMessages(fetchedMessages);
                setIsLoadingMessages(false);
            },
            (error) => {
                console.error("Error fetching messages:", error);
                addToast("Could not load messages.", "error");
                setIsLoadingMessages(false);
            }
        );

        return () => unsubscribe();
    }, [conversation.id, addToast]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(scrollToBottom, [messages, isLoadingMessages]);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isSending) return;
        
        setIsSending(true);
        try {
            await onSendMessage(conversation.id, input);
            setInput('');
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setIsSending(false);
        }
    };
    
    const handleTranslate = async (message: DirectMessage) => {
        setTranslatingId(message.id);
        try {
            if (!db) throw new Error("Database not connected");
            const translation = await translateText(message.text, "English");
            await db.collection('messages').doc(message.id).update({ translatedText: translation });
        } catch (error) {
            console.error("Translation failed:", error);
            addToast("Could not translate message.", 'error');
        } finally {
            setTranslatingId(null);
        }
    };

    if (!guide) return <div>Guide not found.</div>;

    return (
        <div className="flex flex-col h-full w-full">
             <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-4">
                <button onClick={onBack} className="md:hidden p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-lighter">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </button>
                <img src={guide.avatarUrl} alt={guide.name} className="w-10 h-10 rounded-full" />
                <h2 className="font-bold text-lg">{guide.name}</h2>
            </header>
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {isLoadingMessages ? (
                    <div className="flex justify-center items-center h-full"><Spinner /></div>
                ) : (
                    messages.map(msg => (
                        <MessageBubble 
                            key={msg.id}
                            message={msg}
                            isOwnMessage={msg.senderId === currentUser.id}
                            onTranslate={() => handleTranslate(msg)}
                            isTranslating={translatingId === msg.id}
                        />
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2 bg-white dark:bg-dark-light">
                <input 
                    type="text" 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 p-3 rounded-full border border-gray-300 dark:border-gray-600 bg-light dark:bg-dark focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    disabled={isSending}
                />
                <button type="submit" className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-50" disabled={!input.trim() || isSending}>
                   {isSending ? <Spinner className="w-6 h-6" /> : <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                </button>
            </form>
        </div>
    );
};


const ChatPage: React.FC<ChatPageProps> = (props) => {
  const { activeConversationId, onViewConversation, currentUser, guides } = props;
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [lastMessages, setLastMessages] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!db || !currentUser) return;
    const { id: userId, role: userRole } = currentUser;
    const unsubscribes: (() => void)[] = [];

    let userConvosData: Conversation[] = [], guideConvosData: Conversation[] = [];
    const mergeAndSetConversations = () => {
        const all = [...userConvosData, ...guideConvosData];
        const unique = Array.from(new Map(all.map(item => [item.id, item])).values());
        setConversations(unique);
    };

    const userQuery = db.collection('conversations').where('userId', '==', userId);
    unsubscribes.push(userQuery.onSnapshot(snap => {
      userConvosData = snap.docs.map(d => ({id: d.id, ...d.data()} as Conversation));
      mergeAndSetConversations();
    }));
    
    if (userRole === 'guide') {
      const guideQuery = db.collection('conversations').where('guideId', '==', userId);
      unsubscribes.push(guideQuery.onSnapshot(snap => {
        guideConvosData = snap.docs.map(d => ({id: d.id, ...d.data()} as Conversation));
        mergeAndSetConversations();
      }));
    }

    return () => unsubscribes.forEach(unsub => unsub());
  }, [currentUser]);

  useEffect(() => {
    if (!db || conversations.length === 0) return;

    const unsubscribes = conversations.map(conv => {
      const query = db.collection('messages')
                      .where('conversationId', '==', conv.id)
                      .orderBy('timestamp', 'desc')
                      .limit(1);

      return query.onSnapshot(snapshot => {
        if (!snapshot.empty) {
          const lastMsg = snapshot.docs[0].data() as DirectMessage;
          setLastMessages(prev => ({...prev, [conv.id]: lastMsg.text}));
        }
      });
    });
    
    return () => unsubscribes.forEach(unsub => unsub());
  }, [conversations]);

  const sortedConversations = useMemo(() => 
    [...conversations].sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp)
  , [conversations]);
  
  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const activeGuide = activeConversation ? guides.find(g => g.id === activeConversation.guideId) : undefined;
  
  return (
    <div className="bg-white dark:bg-dark-light rounded-2xl shadow-lg h-[80vh] flex overflow-hidden">
        <aside className={`w-full md:w-1/3 lg:w-1/4 border-r border-gray-200 dark:border-gray-700 flex-col flex-shrink-0 ${activeConversationId ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-2xl font-bold">Messages</h1>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
                {sortedConversations.map(conv => {
                    const guide = guides.find(g => g.id === conv.guideId);
                    return (
                        <ConversationListItem 
                            key={conv.id}
                            conversation={conv}
                            lastMessageText={lastMessages[conv.id]}
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
                    currentUser={currentUser}
                    guide={activeGuide}
                    onSendMessage={props.onSendMessage}
                    onBack={props.onBack}
                    addToast={props.addToast}
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