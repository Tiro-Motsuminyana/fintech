import type { Transaction } from '@/lib/types';

async function getTransactions(): Promise<Transaction[]> {
  // In a real app, you'd fetch from your domain.
  // For this MVP, we'll use an absolute path during SSR.
  const res = await fetch('http://localhost:3000/api/transactions', { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch transactions');
  }
  return res.json();
}

export default async function TransactionsPage() {
  const transactions = await getTransactions();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Transactions</h1>
      <div className="space-y-4">
        {transactions.map((tx) => (
          <div key={tx.id} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 flex justify-between items-center">
            <div>
              <p className="font-semibold">{tx.merchant}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(tx.date).toLocaleDateString()}</p>
            </div>
            <p className={`font-bold ${tx.amount > 0 ? 'text-green-500' : 'text-white'}`}>
              {tx.amount.toFixed(2)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
