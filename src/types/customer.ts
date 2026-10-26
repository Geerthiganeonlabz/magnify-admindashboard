export interface Customer {
  id: string;
  name: string;
  initials?: string;
  email: string;
  phone: string;
  address: string;
  isActive: boolean;
  source: 'user' | 'customer';
  recordId: string;
  createdAt?: string;
  [key: string]: unknown; // allow extra fields from backend
}

export interface CustomerApiItem {
  _id?: string;
  id?: string;
  customerId?: string;
  customerName?: string;
  name?: string;
  emailAddress?: string;
  email?: string;
  phoneNumber?: string;
  phone?: string;
  customerAddress?: string;
  address?: string;
  createdAt?: string;
  isActive?: boolean;
  source?: 'user' | 'customer';
  recordId?: string;
}

export interface CustomerStats {
  totalActiveCustomers: number;
  satisfactionRate: number;
  newToday: number;
}

export interface CustomerApiResponse {
  statusCode: number;
  message: string;
  data: CustomerApiItem[];
  total: number;
  activeTotal?: number;
  page: number;
  limit: number;
  totalPages: number;
}
