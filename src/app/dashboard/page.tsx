"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Transaction {
  id: number;
  amount: number;
  date: string;
  description: string;
  status: 'completed' | 'pending';
  flagged: 0 | 1;
}

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'recurring'>('all');
  const router = useRouter();

  useEffect(() => {
    const fetchTransactions = async () => {
      const res = await fetch('/api/transactions');
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      } else {
        router.push('/');
      }
    };
    fetchTransactions();
  }, [router]);

  const filteredTransactions = transactions.filter(t => {
    if (filter === 'pending') return t.status === 'pending';
    if (filter === 'completed') return t.status === 'completed';
    if (filter === 'recurring') return t.flagged === 1;
    return true;
  });

  const handleLogout = async () => {
    // This is a simplified logout. In a real app, you'd call an API route to clear the cookie.
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between p-4 border-b border-border">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button onClick={handleLogout} className="px-4 py-2 font-semibold text-white bg-red-600 rounded-md hover:bg-red-700">Logout</button>
      </header>
      <main className="p-4">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Transactions</h2>
          <div className="flex space-x-2 mt-2">
            <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>All</FilterButton>
            <FilterButton active={filter === 'completed'} onClick={() => setFilter('completed')}>Completed</FilterButton>
            <FilterButton active={filter === 'pending'} onClick={() => setFilter('pending')}>Pending</FilterButton>
            <FilterButton active={filter === 'recurring'} onClick={() => setFilter('recurring')}>Recurring</FilterButton>
          </div>
        </div>
        <div className="space-y-4">
          {filteredTransactions.map(t => (
            <div key={t.id} className="flex items-center justify-between p-4 border rounded-lg bg-card border-border">
              <div>
                <p className="font-semibold">{t.description}</p>
                <p className="text-sm text-gray-400">{new Date(t.date).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className={`font-bold ${t.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {t.amount.toFixed(2)}
                </p>
                <span className={`text-xs px-2 py-1 rounded-full ${
                    t.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                    {t.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

function FilterButton({ active, onClick, children }: { active: boolean, onClick: () => void, children: React.ReactNode }) {
    return (
        <button onClick={onClick} className={`px-3 py-1 text-sm font-medium rounded-full ${active ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-border'}`}>
            {children}
        </button>
    )
}