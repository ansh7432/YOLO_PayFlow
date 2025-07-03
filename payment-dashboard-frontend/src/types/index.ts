export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface Payment {
  _id: string;
  amount: number;
  receiver: string;
  status: 'success' | 'failed' | 'pending';
  method: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'crypto';
  description?: string;
  transactionId: string;
  currency: string;
  fee: number;
  createdAt: string;
  updatedAt: string;
}

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  TransactionDetails: { payment: Payment };
  AddPayment: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Transactions: undefined;
  AddPayment: undefined;
  Users: undefined;
};
