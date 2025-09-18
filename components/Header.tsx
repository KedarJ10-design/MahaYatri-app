import React from 'react';
import { Page, User } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../hooks/useTheme';

interface HeaderProps {
  onNavigate: (page: Page) => void;
  currentPage: Page;
  user: User;
}

const NavLink: React.FC<{
  page: Page;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  children: React.ReactNode;
  icon: React.ReactNode;
}> = ({ page, currentPage, onNavigate, children, icon }) => {
  const isActive = currentPage === page;
  return (
    <button
      onClick={() => onNavigate(page)}
      className={`flex items-center space-x-2 px-3 py-2 text-sm lg:text-md font-medium rounded-lg transition-colors duration-200 ${
        isActive
          ? 'text-primary bg-orange-100 dark:bg-dark-light'
          : 'text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-orange-50 dark:hover:bg-dark-lighter'
      }`}
    >
      {icon}
      <span className="hidden md:inline">{children}</span>
    </button>
  );
};

const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage, user }) => {
  const { signOut: logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const renderNavLinks = () => {
    switch (user.role) {
      case 'guide':
        return (
          <NavLink page={Page.GuideDashboard} currentPage={currentPage} onNavigate={onNavigate} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L16 11.414V15a1 1 0 01-1 1H5a1 1 0 01-1-1v-3.586L3.293 6.707A1 1 0 013 6V3zm3 1a1 1 0 011-1h6a1 1 0 011 1v1a1 1 0 01-1 1H7a1 1 0 01-1-1V4zm2 8a1 1 0 011-1h2a1 1 0 011 1v1a1 1 0 01-1 1H9a1 1 0 01-1-1v-1z" clipRule="evenodd" /></svg>}>Dashboard</NavLink>
        );
      case 'admin':
        return (
           <NavLink page={Page.Admin} currentPage={currentPage} onNavigate={onNavigate} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" /></svg>}>Admin Panel</NavLink>
        );
      case 'user':
      default:
        return (
          <>
            <NavLink page={Page.Home} currentPage={currentPage} onNavigate={onNavigate} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>}>Home</NavLink>
            <NavLink page={Page.Search} currentPage={currentPage} onNavigate={onNavigate} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>}>Guides</NavLink>
            <NavLink page={Page.Vendors} currentPage={currentPage} onNavigate={onNavigate} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 2a1 1 0 011 1v1.586l.707-.707a1 1 0 011.414 0L6.5 4.293l.293-.293a1 1 0 011.414 0L9.5 5.293l.293-.293a1 1 0 011.414 0L12.5 6.293l.293-.293a1 1 0 011.414 0L15.5 7.293l.293-.293a1 1 0 011.414 0l.707.707V3a1 1 0 112 0v1.586l.707-.707a1 1 0 111.414 1.414L19.414 6.5l.293.293a1 1 0 11-1.414 1.414L17.586 7.5l-1.293 1.293a1 1 0 01-1.414 0L13.586 7.5l-1.293 1.293a1 1 0 01-1.414 0L9.586 7.5 8.293 8.793a1 1 0 01-1.414 0L5.586 7.5 4.293 8.793a1 1 0 01-1.414 0L2 7.914V15a1 1 0 01-1 1H1a1 1 0 110-2h.586L12 3.414l1.707 1.707a1 1 0 010 1.414L12.414 7.828 11.707 7.121a1 1 0 00-1.414 0L9 8.414l-1.293-1.293a1 1 0 00-1.414 0L5 8.414 3.707 7.121a1 1 0 00-1.414 0L1.586 7.828a1 1 0 01-1.414-1.414L2 4.707V3a1 1 0 01-1-1H1a1 1 0 110-2h1zM18 11a1 1 0 100 2h-4a1 1 0 100 2h4a1 1 0 100-2zm-6 2a1 1 0 100 2H8a1 1 0 100-2h4z" /></svg>}>Vendors</NavLink>
            <NavLink page={Page.Stays} currentPage={currentPage} onNavigate={onNavigate} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.706-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-2.172 4.243a1 1 0 111.414 1.414l.707-.707a1 1 0 11-1.414-1.414l-.707.707zM3 11a1 1 0 100-2H2a1 1 0 100 2h1zm2.172 4.243l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4.464 4.95l-.707-.707a1 1 0 00-1.414 1.414l.707.707a1 1 0 001.414-1.414z" /></svg>}>Stays</NavLink>
            <NavLink page={Page.Explore} currentPage={currentPage} onNavigate={onNavigate} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v12a1 1 0 00.293.707L6 20.414V3.586L3.707 3.293zM17.707 5.293L14 1.586v16.828l3.707-3.707A1 1 0 0018 14V6a1 1 0 00-.293-.707z" clipRule="evenodd" /></svg>}>Explore</NavLink>
            <NavLink page={Page.TripPlanner} currentPage={currentPage} onNavigate={onNavigate} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V5a1 1 0 00-.553-.894l-4-2A1 1 0 0011 3v14z" /><path d="M7 4a1 1 0 00-1.447-.894l-4 2A1 1 0 001 6v10a1 1 0 00.553.894l4 2A1 1 0 007 18V4z" /></svg>}>AI Planner</NavLink>
            <NavLink page={Page.Chat} currentPage={currentPage} onNavigate={onNavigate} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm1.5 0a.5.5 0 00-.5.5v1.293l6.646 3.323a.5.5 0 00.708 0L17 6.793V5.5a.5.5 0 00-.5-.5h-13zM1 7.293l6.224 3.112a1.5 1.5 0 002.112 0L19 7.293V11a1 1 0 01-1 1H2a1 1 0 01-1-1V7.293z" /></svg>}>Messages</NavLink>
          </>
        );
    }
  };

  const getProfilePage = () => {
    switch(user.role) {
      case 'guide': return Page.GuideDashboard;
      case 'admin': return Page.Admin;
      case 'user':
      default:
        return Page.Profile;
    }
  }


  return (
    <header className="bg-white dark:bg-dark-light shadow-md sticky top-0 z-50 transition-colors duration-300">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => onNavigate(user.role === 'user' ? Page.Home : getProfilePage())}>
          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          <span className="text-2xl font-bold font-heading text-dark dark:text-light">MahaYatri</span>
        </div>
        <div className="flex-grow flex justify-center items-center space-x-1 sm:space-x-2">
            {renderNavLinks()}
        </div>
        <div className="flex items-center space-x-2">
           <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-lighter transition" aria-label="Toggle theme">
             {theme === 'dark' ? 
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg> :
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
             }
          </button>
          <button onClick={() => onNavigate(getProfilePage())} className="flex items-center space-x-2 p-1 pr-3 rounded-full hover:bg-gray-100 dark:hover:bg-dark-lighter transition">
            <img src={user?.avatarUrl} alt={user?.name} className="w-9 h-9 rounded-full border-2 border-primary" />
            <span className="font-medium hidden sm:block text-dark dark:text-light">{user?.name.split(' ')[0]}</span>
          </button>
          <button onClick={logout} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-lighter transition" aria-label="Logout">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;