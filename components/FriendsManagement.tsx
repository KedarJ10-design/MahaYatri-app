import React, { useState, useEffect, useMemo } from 'react';
import { User, FriendRequest } from '../types';
// FIX: Import firebase to use for type annotations.
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { db, functions } from '../services/firebase';
import Input from './common/Input';
import Button from './common/Button';
import LazyImage from './common/LazyImage';
import Spinner from './common/Spinner';

interface FriendsManagementProps {
  currentUser: User;
  allUsers: User[];
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const FriendsManagement: React.FC<FriendsManagementProps> = ({ currentUser, allUsers, addToast }) => {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!db) {
      addToast("Friend system is unavailable in mock mode.", "info");
      setLoadingRequests(false);
      return;
    }
    setLoadingRequests(true);
    const query1 = db.collection('friendRequests').where('toUserId', '==', currentUser.id);
    const query2 = db.collection('friendRequests').where('fromUserId', '==', currentUser.id);

    const unsubs: (()=>void)[] = [];
    const allRequests: Record<string, FriendRequest> = {};

    const handleSnapshot = (snapshot: firebase.firestore.QuerySnapshot) => {
        snapshot.docs.forEach(doc => {
            allRequests[doc.id] = { id: doc.id, ...doc.data() } as FriendRequest;
        });
        setRequests(Object.values(allRequests));
        setLoadingRequests(false);
    };
    
    unsubs.push(query1.onSnapshot(handleSnapshot));
    unsubs.push(query2.onSnapshot(handleSnapshot));

    return () => {
        unsubs.forEach(unsub => unsub());
    };
  }, [currentUser.id, addToast]);

  const { incoming, outgoing, friends, others } = useMemo(() => {
    const friendIds = currentUser.friends;
    const requestUserIds = new Set(requests.flatMap(r => [r.fromUserId, r.toUserId]));

    return {
        incoming: requests.filter(r => r.toUserId === currentUser.id && r.status === 'pending'),
        outgoing: requests.filter(r => r.fromUserId === currentUser.id && r.status === 'pending'),
        friends: allUsers.filter(u => friendIds.includes(u.id)),
        others: allUsers.filter(u => 
            u.id !== currentUser.id &&
            !friendIds.includes(u.id) &&
            !requestUserIds.has(u.id)
        ),
    };
  }, [currentUser, allUsers, requests]);

  const handleAction = async (action: 'send' | 'accept' | 'decline' | 'remove', targetId: string) => {
    if (!functions) {
        addToast("Action unavailable in mock mode.", "error");
        return;
    }
    setActionLoading(prev => ({ ...prev, [targetId]: true }));
    try {
        let func;
        let payload;
        switch(action) {
            case 'send':
                func = functions.httpsCallable('sendFriendRequest');
                payload = { toUserId: targetId };
                addToast("Friend request sent!", "success");
                break;
            case 'accept':
                func = functions.httpsCallable('respondToFriendRequest');
                payload = { requestId: targetId, response: 'accepted' };
                addToast("Friend request accepted!", "success");
                break;
            case 'decline':
                func = functions.httpsCallable('respondToFriendRequest');
                payload = { requestId: targetId, response: 'declined' };
                addToast("Friend request declined.", "info");
                break;
            case 'remove':
                func = functions.httpsCallable('removeFriend');
                payload = { friendId: targetId };
                addToast("Friend removed.", "info");
                break;
        }
        await func(payload);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "An error occurred.";
        console.error(`Error with friend action '${action}':`, err);
        addToast(message, "error");
    } finally {
        setActionLoading(prev => ({ ...prev, [targetId]: false }));
    }
  };
  
  const searchResults = useMemo(() => {
      if (!searchTerm) return [];
      return others.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [searchTerm, others]);

  const UserCard = ({ user, children }: { user: User, children: React.ReactNode }) => (
      <div className="p-3 bg-light dark:bg-dark rounded-lg flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
              <LazyImage src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full flex-shrink-0" placeholderClassName="rounded-full" />
              <div className="overflow-hidden">
                  <p className="font-bold truncate">{user.name}</p>
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>
              </div>
          </div>
          <div className="flex-shrink-0 flex gap-2">{children}</div>
      </div>
  );

  return (
    <div className="space-y-8">
      {/* Incoming Requests */}
      <section className="bg-white dark:bg-dark-light p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold font-heading mb-4">Friend Requests</h2>
        {loadingRequests ? <Spinner /> : 
         incoming.length > 0 ? (
            <div className="space-y-3">
            {incoming.map(req => {
                const sender = allUsers.find(u => u.id === req.fromUserId);
                if (!sender) return null;
                return (
                    <UserCard user={sender} key={req.id}>
                        <Button size="sm" variant="outline" onClick={() => handleAction('decline', req.id)} loading={actionLoading[req.id]}>Decline</Button>
                        <Button size="sm" onClick={() => handleAction('accept', req.id)} loading={actionLoading[req.id]}>Accept</Button>
                    </UserCard>
                );
            })}
            </div>
        ) : <p className="text-gray-500">No new friend requests.</p>}
      </section>

      {/* My Friends */}
      <section className="bg-white dark:bg-dark-light p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold font-heading mb-4">My Friends ({friends.length})</h2>
        {friends.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {friends.map(friend => (
                    <UserCard user={friend} key={friend.id}>
                        <Button size="sm" variant="danger" onClick={() => handleAction('remove', friend.id)} loading={actionLoading[friend.id]}>Remove</Button>
                    </UserCard>
                ))}
            </div>
        ) : <p className="text-gray-500">You haven't added any friends yet.</p>}
      </section>

      {/* Find Friends */}
      <section className="bg-white dark:bg-dark-light p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold font-heading mb-4">Find Friends</h2>
        <Input label="" placeholder="Search by name or email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        {searchTerm && (
            <div className="mt-4 space-y-3">
                {searchResults.length > 0 ? searchResults.map(user => (
                    <UserCard user={user} key={user.id}>
                        <Button size="sm" onClick={() => handleAction('send', user.id)} loading={actionLoading[user.id]}>Add Friend</Button>
                    </UserCard>
                )) : <p className="text-gray-500 text-center py-4">No users found.</p>}
            </div>
        )}
      </section>
    </div>
  );
};

export default FriendsManagement;