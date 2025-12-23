// Mock data for Feezy application

export interface Client {
  id: string;
  name: string;
  email: string;
  defaultFee: number;
  commissionPercentage: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Payment {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  monthFor: string; // Format: "2024-01"
  paymentDate: string;
  notes?: string;
}

export interface Settlement {
  id: string;
  amount: number;
  date: string;
  notes?: string;
}

export const clients: Client[] = [
  {
    id: '1',
    name: 'Sarah Mitchell',
    email: 'sarah@example.com',
    defaultFee: 500,
    commissionPercentage: 15,
    status: 'active',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'James Rodriguez',
    email: 'james@example.com',
    defaultFee: 750,
    commissionPercentage: 12,
    status: 'active',
    createdAt: '2024-02-01',
  },
  {
    id: '3',
    name: 'Emily Chen',
    email: 'emily@example.com',
    defaultFee: 400,
    commissionPercentage: 18,
    status: 'active',
    createdAt: '2024-02-15',
  },
  {
    id: '4',
    name: 'Michael Thompson',
    email: 'michael@example.com',
    defaultFee: 600,
    commissionPercentage: 10,
    status: 'inactive',
    createdAt: '2024-01-20',
  },
  {
    id: '5',
    name: 'Lisa Patel',
    email: 'lisa@example.com',
    defaultFee: 550,
    commissionPercentage: 14,
    status: 'active',
    createdAt: '2024-03-01',
  },
  {
    id: '6',
    name: 'David Kim',
    email: 'david@example.com',
    defaultFee: 800,
    commissionPercentage: 16,
    status: 'active',
    createdAt: '2024-03-10',
  },
];

export const payments: Payment[] = [
  { id: 'p1', clientId: '1', clientName: 'Sarah Mitchell', amount: 500, monthFor: '2024-10', paymentDate: '2024-10-05', notes: 'Full payment' },
  { id: 'p2', clientId: '1', clientName: 'Sarah Mitchell', amount: 500, monthFor: '2024-11', paymentDate: '2024-11-03' },
  { id: 'p3', clientId: '1', clientName: 'Sarah Mitchell', amount: 500, monthFor: '2024-12', paymentDate: '2024-12-08' },
  { id: 'p4', clientId: '2', clientName: 'James Rodriguez', amount: 750, monthFor: '2024-10', paymentDate: '2024-10-10' },
  { id: 'p5', clientId: '2', clientName: 'James Rodriguez', amount: 750, monthFor: '2024-11', paymentDate: '2024-11-12' },
  { id: 'p6', clientId: '2', clientName: 'James Rodriguez', amount: 400, monthFor: '2024-12', paymentDate: '2024-12-05', notes: 'Partial payment' },
  { id: 'p7', clientId: '3', clientName: 'Emily Chen', amount: 400, monthFor: '2024-10', paymentDate: '2024-10-15' },
  { id: 'p8', clientId: '3', clientName: 'Emily Chen', amount: 400, monthFor: '2024-11', paymentDate: '2024-11-18' },
  { id: 'p9', clientId: '3', clientName: 'Emily Chen', amount: 400, monthFor: '2024-12', paymentDate: '2024-12-20' },
  { id: 'p10', clientId: '5', clientName: 'Lisa Patel', amount: 550, monthFor: '2024-11', paymentDate: '2024-11-08' },
  { id: 'p11', clientId: '5', clientName: 'Lisa Patel', amount: 550, monthFor: '2024-12', paymentDate: '2024-12-10' },
  { id: 'p12', clientId: '6', clientName: 'David Kim', amount: 800, monthFor: '2024-11', paymentDate: '2024-11-20' },
  { id: 'p13', clientId: '6', clientName: 'David Kim', amount: 800, monthFor: '2024-12', paymentDate: '2024-12-15' },
];

export const settlements: Settlement[] = [
  { id: 's1', amount: 850, date: '2024-10-30', notes: 'October settlement' },
  { id: 's2', amount: 1200, date: '2024-11-28', notes: 'November partial' },
  { id: 's3', amount: 900, date: '2024-12-15', notes: 'December partial' },
];

// Helper functions for calculations
export const calculateTotalCommission = () => {
  return payments.reduce((sum, p) => {
    const client = clients.find(c => c.id === p.clientId);
    if (!client) return sum;
    return sum + (p.amount * client.commissionPercentage / 100);
  }, 0);
};

export const calculateTotalReceived = () => {
  return settlements.reduce((sum, s) => sum + s.amount, 0);
};

export const calculatePending = () => {
  return calculateTotalCommission() - calculateTotalReceived();
};

export const calculateThisMonthEarnings = () => {
  const currentMonth = new Date().toISOString().slice(0, 7);
  return payments
    .filter(p => p.monthFor === currentMonth || p.paymentDate.startsWith(currentMonth))
    .reduce((sum, p) => {
      const client = clients.find(c => c.id === p.clientId);
      if (!client) return sum;
      return sum + (p.amount * client.commissionPercentage / 100);
    }, 0);
};

export const getMonthlyData = () => {
  const months = ['2024-08', '2024-09', '2024-10', '2024-11', '2024-12'];
  return months.map(month => {
    const monthPayments = payments.filter(p => p.monthFor === month);
    const earnings = monthPayments.reduce((sum, p) => {
      const client = clients.find(c => c.id === p.clientId);
      if (!client) return sum;
      return sum + (p.amount * client.commissionPercentage / 100);
    }, 0);
    
    const monthSettlements = settlements.filter(s => s.date.startsWith(month));
    const received = monthSettlements.reduce((sum, s) => sum + s.amount, 0);
    
    return {
      month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' }),
      earnings: Math.round(earnings),
      received: Math.round(received),
      pending: Math.round(earnings - received),
    };
  });
};

export const getTopClients = () => {
  const clientEarnings = clients.map(client => {
    const clientPayments = payments.filter(p => p.clientId === client.id);
    const totalEarnings = clientPayments.reduce((sum, p) => {
      return sum + (p.amount * client.commissionPercentage / 100);
    }, 0);
    return {
      name: client.name,
      earnings: Math.round(totalEarnings),
    };
  });
  
  return clientEarnings.sort((a, b) => b.earnings - a.earnings).slice(0, 5);
};

export const getClientPayments = (clientId: string) => {
  return payments.filter(p => p.clientId === clientId);
};
