import React, { useState } from 'react';
import Button from './common/Button';
import { useAuth } from '../contexts/AuthContext';
import Input from './common/Input';
import Spinner from './common/Spinner';
import { mockAdminUser, mockGuideUser, mockTouristUser } from '../services/mockData';

const DemoUserCard: React.FC<{
  role: string;
  email: string;
  icon: React.ReactNode;
  onSelect: (email: string) => void;
}> = ({ role, email, icon, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(email)}
    className="p-4 w-full text-left bg-light dark:bg-dark border border-gray-200 dark:border-gray-700 rounded-lg flex items-center gap-4 hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary/50 transition-all transform hover:scale-105"
  >
    <div className="text-primary bg-primary/10 p-3 rounded-lg">{icon}</div>
    <div>
      <p className="font-bold text-dark dark:text-light">{role}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{email}</p>
    </div>
  </button>
);

const LoginPage: React.FC = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] =useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  
  const { signIn, signUp, loading, error, setError } = useAuth();

  const handleDemoSelect = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLoginView) {
        await signIn(email, password, rememberMe);
      } else {
        await signUp(name, email, password);
      }
      // On success, the AuthProvider's onAuthStateChanged will handle navigation.
    } catch (err) {
      console.error("Auth error:", err);
      // Error is handled and displayed via the context's error state.
    }
  };
  
  const formatFirebaseError = (errorMessage: string | null): string => {
    if (!errorMessage) return '';
    return errorMessage.replace('Firebase: ', '').replace(/ \(auth\/[a-z-]+?\)/, '.');
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-light dark:bg-dark p-4">
      <div className="relative z-10 bg-white dark:bg-dark-light w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden grid md:grid-cols-2 animate-fade-in">
        {/* Info Panel */}
        <div 
          className="hidden md:block relative p-12 text-white bg-gradient-to-br from-primary via-orange-500 to-accent animate-gradient-bg"
          style={{ backgroundSize: '200% 200%' }}
        >
            <div className="relative z-10 flex flex-col justify-between h-full">
                <div>
                    <div className="flex items-center space-x-2">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                        <span className="text-3xl font-bold font-heading">MahaYatri</span>
                    </div>
                    <h1 className="text-4xl font-extrabold font-heading mt-8 leading-tight">Your Adventure in Maharashtra Awaits.</h1>
                </div>
                <p className="text-lg opacity-90">Discover hidden gems, authentic culture, and unforgettable experiences with our verified local guides.</p>
            </div>
        </div>
        
        {/* Form Panel */}
        <div className="p-8 sm:p-12 flex flex-col justify-center">
            <h2 className="text-3xl font-bold font-heading text-dark dark:text-light mb-2">{isLoginView ? 'Welcome Back!' : 'Create Your Account'}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">{isLoginView ? 'Sign in to continue your journey.' : 'Join us to start exploring.'}</p>
            
            <form onSubmit={handleSubmit} className="space-y-5">
                {!isLoginView && (
                    <Input label="Full Name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Priya Sharma" required />
                )}
                <Input label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
                <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />

                {isLoginView && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                        Remember me
                      </label>
                    </div>
                  </div>
                )}

                {error && <p className="text-sm text-red-500 bg-red-100 dark:bg-red-900/30 p-3 rounded-lg text-center">{formatFirebaseError(error)}</p>}

                <Button type="submit" disabled={loading} className="w-full flex items-center justify-center space-x-2 text-lg py-3">
                  {loading && <Spinner className="h-5 w-5 border-white" />}
                  <span>{isLoginView ? 'Sign In' : 'Sign Up'}</span>
                </Button>
            </form>

             <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
                {isLoginView ? "Don't have an account?" : "Already have an account?"}
                <button onClick={() => { setIsLoginView(!isLoginView); setEmail(''); setPassword(''); setName(''); setError(null); }} className="font-semibold text-primary hover:underline ml-1">
                    {isLoginView ? 'Sign Up' : 'Sign In'}
                </button>
            </p>

            {isLoginView && (
              <div className="mt-6">
                <p className="text-center text-xs text-gray-500 dark:text-gray-400 mb-3">Or click a demo account to log in (password: <code className="bg-gray-200 dark:bg-gray-600 px-1 py-0.5 rounded">password123</code>)</p>
                <div className="space-y-2">
                   <DemoUserCard role="Tourist" email={mockTouristUser.email} onSelect={handleDemoSelect} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.28-1.25-1.44-2.143M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 0c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z" /></svg>} />
                   <DemoUserCard role="Guide" email={mockGuideUser.email} onSelect={handleDemoSelect} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222 4 2.222V20M12 12L4 7l8-4 8 4-8 5z" /></svg>} />
                   <DemoUserCard role="Admin" email={mockAdminUser.email} onSelect={handleDemoSelect} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;