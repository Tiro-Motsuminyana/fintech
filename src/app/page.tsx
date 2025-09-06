"use client";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthPage() {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  const authError = searchParams.get('error');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const endpoint = isLoginView ? '/api/auth/login' : '/api/auth/signup';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || 'An error occurred.');
    } else {
      if (isLoginView) {
        router.push('/dashboard');
      } else {
        setMessage('Signup successful! Please log in.');
        setIsLoginView(true);
        setEmail('');
        setPassword('');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-6 border rounded-lg shadow-lg bg-card border-border">
        <h1 className="text-3xl font-bold text-center text-foreground">
          {isLoginView ? 'Welcome Back' : 'Create Account'}
        </h1>
        {authError && <p className="text-center text-red-500">You must be logged in to view that page.</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        {message && <p className="text-center text-green-500">{message}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-foreground"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border rounded-md bg-input border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-foreground"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border rounded-md bg-input border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isLoginView ? 'Login' : 'Sign Up'}
          </button>
        </form>
        <p className="text-sm text-center">
          {isLoginView ? "Don't have an account?" : 'Already have an account?'}
          <button
            onClick={() => {
              setIsLoginView(!isLoginView);
              setError('');
              setMessage('');
            }}
            className="ml-1 font-semibold text-blue-500 hover:underline"
          >
            {isLoginView ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}