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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  
  const { signIn, signUp, loading, error, setError } = useAuth();

  const validateEmail = (emailToValidate: string): boolean => {
    if (!emailToValidate) {
      setEmailError('Email address is required.');
      return false;
    }
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(emailToValidate)) {
      setEmailError('Please enter a valid email address.');
      return false;
    }
    setEmailError(null);
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    if (newEmail) {
      validateEmail(newEmail);
    } else {
      setEmailError(null);
    }
  };

  const handleDemoSelect = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setEmailError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    // Final validation before submitting
    if (!validateEmail(email)) {
      return;
    }
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
          className="hidden md:block relative p-12 text-white bg-gradient-to-br from-primary via-secondary to-accent animate-gradient-bg"
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
                <div>
                  <Input 
                    label="Email Address" 
                    type="email" 
                    value={email} 
                    onChange={handleEmailChange} 
                    onBlur={() => validateEmail(email)}
                    placeholder="you@example.com" 
                    required 
                    aria-invalid={!!emailError}
                    aria-describedby="email-error"
                  />
                  {emailError && <p id="email-error" className="text-sm text-red-500 mt-1 animate-fade-in">{emailError}</p>}
                </div>
                
                <div>
                  <label htmlFor="password-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password-input"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full p-3 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-light focus:ring-2 focus:ring-primary focus:border-transparent hover:border-primary/50 dark:hover:border-primary/50 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-primary transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.27 6.957 15.176 5 12 5c-1.465 0-2.858.485-4.001 1.343L3.707 2.293zm-1.414 7.414a10.003 10.003 0 001.414 1.414l1.328-1.328A3.982 3.982 0 018 10c0-1.433.75-2.684 1.86-3.417L7.43 5.17A9.96 9.96 0 00.458 10c1.274 3.043 4.368 5 7.542 5 1.547 0 2.992-.493 4.195-1.357l1.328 1.328a1 1 0 101.414-1.414l-14-14zM10 12a2 2 0 110-4 2 2 0 010 4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.73 6.957 4.824 5 8 5s6.27 1.957 7.542 5c-1.272 3.043-4.27 5-7.542 5S1.73 13.043.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>


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
                <button onClick={() => { setIsLoginView(!isLoginView); setEmail(''); setPassword(''); setName(''); setError(null); setEmailError(null); }} className="font-semibold text-primary hover:underline ml-1">
                    {isLoginView ? 'Sign Up' : 'Sign In'}
                </button>
            </p>

            {isLoginView && (
              <div className="mt-6">
                <p className="text-center text-xs text-gray-500 dark:text-gray-400 mb-3">Or click a demo account to log in (password: <code className="bg-gray-200 dark:bg-gray-600 px-1 py-0.5 rounded">password123</code>)</p>
                <div className="space-y-2">
                   <DemoUserCard role="Tourist" email={mockTouristUser.email} onSelect={handleDemoSelect} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.28-1.25-1.44-2.143M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 0c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79-4-4-1.79-4-4-4z" /></svg>} />
                   <DemoUserCard role="Guide" email={mockGuideUser.email} onSelect={handleDemoSelect} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222 4 2.222V20M12 12L4 7l8-4 8 4-8 5z" /></svg>} />
                   <DemoUserCard role="Admin" email={mockAdminUser.email} onSelect={handleDemoSelect} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;