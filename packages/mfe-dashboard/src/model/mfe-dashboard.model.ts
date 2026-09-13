export interface DashboardModel {
  orders: Order[];
  stats: DashboardStats;
}

export interface Order {
  id: string;
  customer: string;
  product: string;
  amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  date: string;
}

export interface DashboardStats {
  totalOrders: number;
  revenue: number;
  pendingOrders: number;
}
