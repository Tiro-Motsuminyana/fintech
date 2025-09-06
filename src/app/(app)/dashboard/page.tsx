"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Transaction {
  id: string;
  amount: { amount: string; currency: string };
  native_amount: { amount: string; currency: string };
  description: string | null;
  created_at: string;
  status: string;
}

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [loading, setLoading] = useState(true);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const router = useRouter();

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/coinbase/transactions');
    if (res.ok) {
      const data = await res.json();
      setTransactions(data);
    } else if (res.status === 401) {
      router.push('/');
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    async function checkUserStatus() {
      const res = await fetch('/api/user/status');
      if (!res.ok) {
        router.push('/');
        return;
      }
      const { hasApiKey } = await res.json();
      setHasApiKey(hasApiKey);
      if (hasApiKey) {
        fetchTransactions();
      } else {
        setLoading(false);
      }
    }
    checkUserStatus();
  }, [router, fetchTransactions]);

  const filteredTransactions = transactions.filter(t => {
    if (filter === 'pending') return t.status === 'pending';
    if (filter === 'completed') return t.status === 'completed';
    return true;
  });

  if (loading || hasApiKey === null) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  if (!hasApiKey) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <h2 className="text-2xl font-bold mb-4">Welcome to Your Finance Tracker</h2>
        <p className="mb-6 text-gray-400">Please connect your Coinbase account to get started.</p>
        <Link href="/settings" className="px-6 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">
          Go to Settings
        </Link>
      </div>
    );
  }

  return (
    <div>
      <header className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <button onClick={fetchTransactions} className="px-3 py-1.5 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">Refresh</button>
      </header>
      <main className="p-4">
        <div className="mb-4">
          <div className="flex space-x-2 mt-2">
            <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>All</FilterButton>
            <FilterButton active={filter === 'completed'} onClick={() => setFilter('completed')}>Completed</FilterButton>
            <FilterButton active={filter === 'pending'} onClick={() => setFilter('pending')}>Pending</FilterButton>
          </div>
        </div>
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p>No transactions found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map(t => (
              <div key={t.id} className="flex items-center justify-between p-3 border rounded-lg bg-card border-border">
                <div>
                  <p className="font-semibold capitalize">{t.description || 'Transaction'}</p>
                  <p className="text-sm text-gray-400">{new Date(t.created_at).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${parseFloat(t.amount.amount) > 0 ? 'text-green-500' : 'text-red-50a00'}`}>
                    {t.native_amount.amount} {t.native_amount.currency}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                      t.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                      {t.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function FilterButton({ active, onClick, children }: { active: boolean, onClick: () => void, children: React.ReactNode }) {
    return (
        <button onClick={onClick} className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${active ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-border'}`}>
            {children}
        </button>
    )
}