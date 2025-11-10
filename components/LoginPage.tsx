
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
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  
  const { signIn, signUp, loading, error, setError, signInWithGoogle } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);

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

  const handleGoogleSignIn = async () => {
      setError(null);
      setGoogleLoading(true);
      try {
          await signInWithGoogle();
      } catch (err) {
        // Error is handled and displayed via the context's error state.
      } finally {
          setGoogleLoading(false);
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validateEmail(email)) {
      return;
    }
    try {
      if (isLoginView) {
        await signIn(email, password, rememberMe);
      } else {
        await signUp(name, email, password);
      }
    } catch (err) {
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
        
        <div className="p-8 sm:p-12 flex flex-col justify-center">
            <h2 className="text-3xl font-bold font-heading text-dark dark:text-light mb-2">{isLoginView ? 'Welcome Back!' : 'Create Your Account'}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">{isLoginView ? 'Sign in to continue your journey.' : 'Join us to start exploring.'}</p>

            <Button onClick={handleGoogleSignIn} variant="outline" className="w-full mb-6" loading={googleLoading} disabled={loading}>
                <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.222 0-9.618-3.317-11.28-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C41.382 36.66 44 31.134 44 24c0-1.341-.138-2.65-.389-3.917z"></path></svg>
                Sign In with Google
            </Button>

            <div className="flex items-center mb-6">
                <hr className="flex-grow border-gray-300 dark:border-gray-600"/>
                <span className="mx-4 text-sm text-gray-500">OR</span>
                <hr className="flex-grow border-gray-300 dark:border-gray-600"/>
            </div>
            
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
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.27 6.957 15.176 5 12 5c-1.465 0-2.858.485-4.001 1.343L3.707 2.293zm-1.414 7.414a10.003 10.003 0 001.414 1.414l1.328-1.328A3.982 3.982 0 018 10c0-1.433.75-2.684 1.86-3.417L7.43 5.17A9.96 9.96 0 00.458 10c1.274 3.043 4.368 5 7.542 5 1.547 0 2.992-.493 4.195-1.357l1.328 1.328a1 1 0 101.414-1.414l-14-14zM10 12a2 2 0 110-4 2 2 0 010 4z" clipRule="evenodd" /></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.73 6.957 4.824 5 8 5s6.27 1.957 7.542 5c-1.272 3.043-4.27 5-7.542 5S1.73 13.043.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                      )}
                    </button>
                  </div>
                </div>

                {isLoginView && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input id="remember-me" name="remember-me" type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"/>
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">Remember me</label>
                    </div>
                  </div>
                )}
                {error && <p className="text-sm text-red-500 bg-red-100 dark:bg-red-900/30 p-3 rounded-lg text-center">{formatFirebaseError(error)}</p>}
                <Button type="submit" disabled={loading || googleLoading} className="w-full flex items-center justify-center space-x-2 text-lg py-3">
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
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
