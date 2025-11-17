export type TopCustomer = { name: string; totalSpent: number; orders: number };

export type DashboardData = {
  kitchenName: string;
  status: 'Open' | 'Closed';
  todaysOrders: number;
  totalIncome: number;
  activeSubscriptions: number;
  avgRating: number;
  weeklySales: { day: string; value: number }[]; 
  monthlySales: { month: string; value: number }[];
  weeklySalesTotal: number;
  weeklyGrowthPercent: number;
  quickActions: { id: string; title: string; iconPack?: 'material' | 'feather' | 'fa'; iconName: string }[];
  avgOrderValue: number;
  conversionRate: number;
  pendingOrders: number;
  activeDeliveries: number;
  topItems: { name: string; sold: number }[];
  topCustomers: TopCustomer[];
};