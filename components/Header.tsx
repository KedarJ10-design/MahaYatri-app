import React, { useState, useEffect, useRef } from 'react';
import { User, Page, Notification } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import LazyImage from './common/LazyImage';

interface HeaderProps {
  user: User | null;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  notifications: Notification[];
  onUpdateNotifications: (notifications: Notification[]) => void;
}

const NavLink: React.FC<{
  page: Page;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  children: React.ReactNode;
  isMobile?: boolean;
}> = ({ page, currentPage, onNavigate, children, isMobile }) => {
  const baseClasses = `transition-colors text-left ${isMobile ? 'w-full block px-4 py-3 text-lg' : 'px-3 py-2 rounded-md text-sm font-medium'}`;
  const activeClasses = isMobile ? 'bg-primary text-white' : 'bg-primary text-white';
  const inactiveClasses = isMobile 
    ? 'text-gray-700 dark:text-gray-300 hover:bg-primary/20 dark:hover:bg-primary/30' 
    : 'text-gray-700 dark:text-gray-300 hover:bg-primary/20 dark:hover:bg-primary/30 hover:text-primary';

  return (
    <button
      onClick={() => onNavigate(page)}
      className={`${baseClasses} ${currentPage === page ? activeClasses : inactiveClasses}`}
      aria-current={currentPage === page ? 'page' : undefined}
    >
      {children}
    </button>
  );
};

const Header: React.FC<HeaderProps> = ({ user, currentPage, onNavigate, notifications, onUpdateNotifications }) => {
  const { signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isOnline = useOnlineStatus();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  if (!user) return null;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
            setIsProfileOpen(false);
        }
        if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
            setIsNotificationsOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [isMobileMenuOpen]);

  const handleMobileNav = (page: Page) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
  };
  
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllAsRead = () => {
      onUpdateNotifications(notifications.map(n => ({...n, read: true})));
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
        case 'booking': return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h4a1 1 0 100-2H7z" clipRule="evenodd" /></svg>;
        case 'message': return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor"><path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0L10 8.586l3.293-2.293a1 1 0 111.414 1.414l-4 3a1 1 0 01-1.414 0l-4-3a1 1 0 010-1.414z" /></svg>;
        case 'system': return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>;
    }
  }
  
  const renderNavLinks = (isMobile = false) => {
      const navFn = isMobile ? handleMobileNav : onNavigate;
      return (
        <>
            {user.role === 'user' && (
                <>
                    <NavLink page={Page.Home} currentPage={currentPage} onNavigate={navFn} isMobile={isMobile}>Home</NavLink>
                    <NavLink page={Page.Explore} currentPage={currentPage} onNavigate={navFn} isMobile={isMobile}>Explore</NavLink>
                    <NavLink page={Page.Search} currentPage={currentPage} onNavigate={navFn} isMobile={isMobile}>Guides</NavLink>
                    <NavLink page={Page.TripPlanner} currentPage={currentPage} onNavigate={navFn} isMobile={isMobile}>Trip Planner</NavLink>
                    <NavLink page={Page.Stays} currentPage={currentPage} onNavigate={navFn} isMobile={isMobile}>Stays</NavLink>
                    <NavLink page={Page.Vendors} currentPage={currentPage} onNavigate={navFn} isMobile={isMobile}>Vendors</NavLink>
                </>
            )}
            {user.role === 'guide' && <NavLink page={Page.GuideDashboard} currentPage={currentPage} onNavigate={navFn} isMobile={isMobile}>Dashboard</NavLink>}
            {user.role === 'admin' && <NavLink page={Page.Admin} currentPage={currentPage} onNavigate={navFn} isMobile={isMobile}>Admin Panel</NavLink>}
        </>
      )
  };


  return (
    <>
    <header className="bg-white dark:bg-dark-light shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
             <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden mr-4 p-2 rounded-md text-gray-600 dark:text-gray-300" aria-label="Open main menu" aria-expanded={isMobileMenuOpen}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <button onClick={() => onNavigate(Page.Home)} className="flex-shrink-0 flex items-center gap-2">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              <span className="text-xl font-bold font-heading text-dark dark:text-light">MahaYatri</span>
            </button>
             {!isOnline && (
                <span title="You are currently offline. Some features may be limited." className="ml-4 flex items-center gap-2 text-xs font-semibold text-gray-500 bg-gray-200 dark:bg-dark-lighter dark:text-gray-300 px-2 py-1 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M7.828 12.172a4 4 0 015.656 0M4.243 8.586a8 8 0 0111.314 0M1 1l22 22" />
                    </svg>
                    Offline Mode
                </span>
            )}
          </div>
          <nav className="hidden md:flex items-center space-x-4">
            {renderNavLinks()}
          </nav>
          <div className="flex items-center gap-2 md:gap-4">
            <button onClick={toggleTheme} className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-primary/20 dark:hover:bg-primary/30 hover:text-primary transition-colors" aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}>
                {theme === 'light' ? 
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg> : 
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                }
            </button>
            <div ref={notificationsRef} className="relative">
                 <button onClick={() => setIsNotificationsOpen(prev => !prev)} className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-primary/20 dark:hover:bg-primary/30 hover:text-primary transition-colors relative" aria-haspopup="true" aria-expanded={isNotificationsOpen} aria-label={`View notifications. ${unreadCount} unread.`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                    {unreadCount > 0 && <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-dark-light"></span>}
                </button>
                {isNotificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-dark-light rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50 animate-fade-in" role="menu">
                        <div className="p-3 flex justify-between items-center border-b dark:border-gray-700">
                            <h3 className="font-semibold">Notifications</h3>
                            <button onClick={handleMarkAllAsRead} className="text-xs text-primary hover:underline" disabled={unreadCount === 0}>Mark all as read</button>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                            {notifications.map(n => (
                                <div key={n.id} className={`p-3 flex items-start gap-3 transition-colors duration-200 hover:bg-primary/20 dark:hover:bg-primary/30 ${!n.read ? 'bg-primary/5 dark:bg-primary/10' : ''}`}>
                                    <div className="flex-shrink-0 mt-1">{getNotificationIcon(n.type)}</div>
                                    <p className="text-sm">{n.message}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <div ref={profileRef} className="relative">
              <button onClick={() => setIsProfileOpen(prev => !prev)} className="flex items-center gap-2 cursor-pointer p-2 -m-2 rounded-lg transition-colors hover:bg-primary/20 dark:hover:bg-primary/30" aria-haspopup="true" aria-expanded={isProfileOpen} aria-label="Open user menu">
                <LazyImage
                  src={user.avatarUrl}
                  alt={user.name}
                  className="h-10 w-10 rounded-full"
                  placeholderClassName="rounded-full"
                  sizes="40px"
                />
                <span className="hidden sm:block font-semibold">{user.name}</span>
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-light rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50 animate-fade-in" role="menu">
                    <button role="menuitem" onClick={() => { onNavigate(Page.Profile); setIsProfileOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-primary/20 hover:text-primary dark:hover:bg-primary/30 w-full text-left transition-colors">My Profile</button>
                    <button role="menuitem" onClick={() => { onNavigate(Page.Chat); setIsProfileOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-primary/20 hover:text-primary dark:hover:bg-primary/30 w-full text-left transition-colors">Messages</button>
                    <button role="menuitem" onClick={() => { signOut(); setIsProfileOpen(false); }} className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left transition-colors">Sign Out</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>

    {/* Mobile Menu */}
    <div className={`fixed inset-0 z-50 md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        {/* Overlay */}
        <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}></div>
        
        {/* Menu */}
        <div className={`fixed top-0 left-0 bottom-0 w-4/5 max-w-sm bg-light dark:bg-dark shadow-lg mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <span className="text-xl font-bold font-heading text-dark dark:text-light">Menu</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-md" aria-label="Close main menu">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            <nav className="p-4 space-y-2">
                {renderNavLinks(true)}
            </nav>
        </div>
    </div>
    </>
  );
};

export default Header;