"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSaveKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const res = await fetch('/api/settings/coinbase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey, apiSecret }),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage(data.message);
      setApiKey('');
      setApiSecret('');
      router.push('/dashboard'); // Redirect to dashboard to show transactions
    } else {
      setError(data.message || 'Failed to save keys.');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    // Force a full reload to clear all state and redirect via middleware
    window.location.href = '/';
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="max-w-md mx-auto">
        <div className="p-6 border rounded-lg bg-card border-border">
          <h2 className="text-xl font-semibold mb-4">Coinbase API</h2>
          {message && <p className="text-green-500 mb-4">{message}</p>}
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleSaveKeys} className="space-y-4">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium">API Key</label>
              <input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-3 py-2 mt-1 border rounded-md bg-input border-border"
                required
              />
            </div>
            <div>
              <label htmlFor="apiSecret" className="block text-sm font-medium">API Secret</label>
              <input
                id="apiSecret"
                type="password"
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                className="w-full px-3 py-2 mt-1 border rounded-md bg-input border-border"
                required
              />
            </div>
            <button type="submit" className="w-full py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">
              Save Keys
            </button>
          </form>
        </div>

        <button onClick={handleLogout} className="w-full mt-8 py-2 font-semibold text-white bg-red-600 rounded-md hover:bg-red-700">
          Logout
        </button>
      </div>
    </div>
  );
}