import React, { useState } from 'react';
import Button from './common/Button';
import { useAuth } from '../contexts/AuthContext';
import Input from './common/Input';
import Spinner from './common/Spinner';

const LoginPage: React.FC = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  
  const { signIn, signUp, loading, error, setError } = useAuth();

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
          className="hidden md:block relative p-12 text-white bg-cover bg-center" 
          style={{ backgroundImage: "url('https://picsum.photos/seed/maharashtra-culture/800/1200')" }}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-accent/80"></div>
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
              <div className="mt-8 p-4 bg-light dark:bg-dark border border-gray-200 dark:border-gray-700 rounded-lg">
                <h4 className="font-bold text-center text-dark dark:text-light mb-2 font-heading">Demo Accounts</h4>
                <p className="text-xs text-center text-gray-500 dark:text-gray-400 mb-3">Use password: <code className="bg-gray-200 dark:bg-gray-600 px-1 py-0.5 rounded">password123</code> for all demo accounts.</p>
                <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-300">
                  <li><strong>Tourist:</strong> <code className="text-primary">priya.sharma@example.com</code></li>
                  <li><strong>Admin:</strong> <code className="text-primary">admin@example.com</code></li>
                  <li><strong>Guide:</strong> <code className="text-primary">rohan.patil@example.com</code></li>
                </ul>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;