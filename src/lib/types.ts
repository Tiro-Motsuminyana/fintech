export interface Transaction {
  id: string;
  merchant: string;
  amount: number;
  date: string;
  category: string;
  status: 'pending' | 'settled' | 'refunded';
  type: 'buy' | 'sell' | 'send' | 'receive' | 'deposit' | 'withdraw';
}
