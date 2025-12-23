// Mock data for Feezy application - Indian context

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
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
    name: 'Priya Sharma',
    email: 'priya.sharma@gmail.com',
    phone: '+91 98765 43210',
    defaultFee: 5000,
    commissionPercentage: 15,
    status: 'active',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Rahul Verma',
    email: 'rahul.verma@yahoo.com',
    phone: '+91 87654 32109',
    defaultFee: 7500,
    commissionPercentage: 12,
    status: 'active',
    createdAt: '2024-02-01',
  },
  {
    id: '3',
    name: 'Anjali Patel',
    email: 'anjali.patel@hotmail.com',
    phone: '+91 76543 21098',
    defaultFee: 4000,
    commissionPercentage: 18,
    status: 'active',
    createdAt: '2024-02-15',
  },
  {
    id: '4',
    name: 'Vikram Singh',
    email: 'vikram.singh@gmail.com',
    phone: '+91 65432 10987',
    defaultFee: 6000,
    commissionPercentage: 10,
    status: 'inactive',
    createdAt: '2024-01-20',
  },
  {
    id: '5',
    name: 'Meera Reddy',
    email: 'meera.reddy@outlook.com',
    phone: '+91 54321 09876',
    defaultFee: 5500,
    commissionPercentage: 14,
    status: 'active',
    createdAt: '2024-03-01',
  },
  {
    id: '6',
    name: 'Arjun Nair',
    email: 'arjun.nair@gmail.com',
    phone: '+91 43210 98765',
    defaultFee: 8000,
    commissionPercentage: 16,
    status: 'active',
    createdAt: '2024-03-10',
  },
  {
    id: '7',
    name: 'Sneha Gupta',
    email: 'sneha.gupta@yahoo.com',
    phone: '+91 32109 87654',
    defaultFee: 4500,
    commissionPercentage: 15,
    status: 'active',
    createdAt: '2024-03-15',
  },
  {
    id: '8',
    name: 'Karthik Iyer',
    email: 'karthik.iyer@gmail.com',
    phone: '+91 21098 76543',
    defaultFee: 9000,
    commissionPercentage: 20,
    status: 'active',
    createdAt: '2024-04-01',
  },
];

export const payments: Payment[] = [
  { id: 'p1', clientId: '1', clientName: 'Priya Sharma', amount: 5000, monthFor: '2024-10', paymentDate: '2024-10-05', notes: 'Full payment received' },
  { id: 'p2', clientId: '1', clientName: 'Priya Sharma', amount: 5000, monthFor: '2024-11', paymentDate: '2024-11-03' },
  { id: 'p3', clientId: '1', clientName: 'Priya Sharma', amount: 5000, monthFor: '2024-12', paymentDate: '2024-12-08' },
  { id: 'p4', clientId: '2', clientName: 'Rahul Verma', amount: 7500, monthFor: '2024-10', paymentDate: '2024-10-10' },
  { id: 'p5', clientId: '2', clientName: 'Rahul Verma', amount: 7500, monthFor: '2024-11', paymentDate: '2024-11-12' },
  { id: 'p6', clientId: '2', clientName: 'Rahul Verma', amount: 4000, monthFor: '2024-12', paymentDate: '2024-12-05', notes: 'Partial payment - balance pending' },
  { id: 'p7', clientId: '3', clientName: 'Anjali Patel', amount: 4000, monthFor: '2024-10', paymentDate: '2024-10-15' },
  { id: 'p8', clientId: '3', clientName: 'Anjali Patel', amount: 4000, monthFor: '2024-11', paymentDate: '2024-11-18' },
  { id: 'p9', clientId: '3', clientName: 'Anjali Patel', amount: 4000, monthFor: '2024-12', paymentDate: '2024-12-20' },
  { id: 'p10', clientId: '5', clientName: 'Meera Reddy', amount: 5500, monthFor: '2024-11', paymentDate: '2024-11-08' },
  { id: 'p11', clientId: '5', clientName: 'Meera Reddy', amount: 5500, monthFor: '2024-12', paymentDate: '2024-12-10' },
  { id: 'p12', clientId: '6', clientName: 'Arjun Nair', amount: 8000, monthFor: '2024-11', paymentDate: '2024-11-20' },
  { id: 'p13', clientId: '6', clientName: 'Arjun Nair', amount: 8000, monthFor: '2024-12', paymentDate: '2024-12-15' },
  { id: 'p14', clientId: '7', clientName: 'Sneha Gupta', amount: 4500, monthFor: '2024-11', paymentDate: '2024-11-25' },
  { id: 'p15', clientId: '7', clientName: 'Sneha Gupta', amount: 4500, monthFor: '2024-12', paymentDate: '2024-12-18' },
  { id: 'p16', clientId: '8', clientName: 'Karthik Iyer', amount: 9000, monthFor: '2024-12', paymentDate: '2024-12-22' },
];

export const settlements: Settlement[] = [
  { id: 's1', amount: 8500, date: '2024-10-30', notes: 'October settlement from coaching centre' },
  { id: 's2', amount: 12000, date: '2024-11-28', notes: 'November partial settlement' },
  { id: 's3', amount: 9000, date: '2024-12-15', notes: 'December partial - remaining due end of month' },
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
    
    // Get short month name in Indian format
    const [year, monthNum] = month.split('-');
    const date = new Date(parseInt(year), parseInt(monthNum) - 1);
    const monthName = date.toLocaleDateString('en-IN', { month: 'short' });
    
    return {
      month: monthName,
      fullMonth: month,
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
      id: client.id,
      name: client.name,
      earnings: Math.round(totalEarnings),
      payments: clientPayments.length,
    };
  });
  
  return clientEarnings.sort((a, b) => b.earnings - a.earnings).slice(0, 5);
};

export const getClientPayments = (clientId: string) => {
  return payments.filter(p => p.clientId === clientId);
};

export const getRecentPayments = (limit: number = 5) => {
  return [...payments]
    .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
    .slice(0, limit);
};

export const getRecentSettlements = (limit: number = 5) => {
  return [...settlements]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
};
