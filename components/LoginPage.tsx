import React from 'react';
import Button from './common/Button';
import { useAuth } from '../contexts/AuthContext';
import { mockTouristUser, mockGuideUser, mockAdminUser } from '../services/mockData';

const LoginPage: React.FC = () => {
  const { signInWithGoogle, loading, error, signInAsDemoUser, isDemoMode } = useAuth();

  const renderLoginOptions = () => {
    if (isDemoMode) {
      return (
        <div className="space-y-4">
          <div className="text-yellow-800 dark:text-yellow-200 bg-yellow-100 dark:bg-yellow-900/50 p-4 rounded-lg text-center">
            <h3 className="font-bold text-lg">Welcome to the MahaYatri Demo!</h3>
            <p className="text-sm">The app is running in offline mode. You can explore all features by signing in with a sample profile below.</p>
          </div>
          <Button onClick={() => signInAsDemoUser(mockTouristUser)} className="w-full text-lg">
            Sign in as Tourist
          </Button>
          <Button onClick={() => signInAsDemoUser(mockGuideUser)} variant="secondary" className="w-full text-lg">
            Sign in as Guide
          </Button>
          <Button onClick={() => signInAsDemoUser(mockAdminUser)} variant="outline" className="w-full text-lg">
            Sign in as Admin
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {error && <p className="text-red-500 mb-4 bg-red-100 dark:bg-red-900/50 p-3 rounded-lg">{error}</p>}
        <Button onClick={signInWithGoogle} disabled={loading} className="w-full flex items-center justify-center space-x-2 text-lg">
          {loading ? (
              <span>Signing in...</span>
          ) : (
              <>
                  <svg className="w-6 h-6" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path></svg>
                  <span>Sign in with Google</span>
              </>
          )}
        </Button>
      </div>
    );
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('https://picsum.photos/seed/maharashtra/1920/1080')" }}>
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <div className="relative z-10 bg-white dark:bg-dark-light bg-opacity-95 dark:bg-opacity-95 backdrop-blur-sm p-8 sm:p-12 rounded-2xl shadow-2xl text-center max-w-lg w-full mx-4">
        <div className="flex justify-center mb-6">
            <svg className="w-16 h-16 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
        </div>
        <h1 className="text-4xl font-bold text-dark dark:text-light mb-3">Welcome to MahaYatri</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">Your adventure in Maharashtra awaits.</p>
        
        {renderLoginOptions()}
      </div>
    </div>
  );
};

export default LoginPage;