export const USER_ROLES = ['Super Admin', 'Admin', 'Manager', 'Staff'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export type UserStatus = 'Active' | 'Inactive';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

export type AdminUserInput = Omit<AdminUser, 'id' | 'createdAt'>;

export const ROLE_STYLES: Record<UserRole, string> = {
  'Super Admin': 'bg-[#EDE9FE] text-[#6D28D9]',
  Admin: 'bg-[#DBEAFE] text-[#1D4ED8]',
  Manager: 'bg-[#FEF3C7] text-[#B45309]',
  Staff: 'bg-[#F1F5F9] text-[#475569]',
};

// Frontend-only seed data until the users API is available.
export const INITIAL_USERS: AdminUser[] = [
  {
    id: 'USR-001',
    name: 'Arun Kumar',
    email: 'arun@magnify.lk',
    phone: '+94 77 123 4567',
    role: 'Super Admin',
    status: 'Active',
    createdAt: '2026-01-12',
  },
  {
    id: 'USR-002',
    name: 'Priya Sharma',
    email: 'priya@magnify.lk',
    phone: '+94 76 234 5678',
    role: 'Admin',
    status: 'Active',
    createdAt: '2026-03-04',
  },
  {
    id: 'USR-003',
    name: 'Kavin Raj',
    email: 'kavin@magnify.lk',
    phone: '+94 71 345 6789',
    role: 'Manager',
    status: 'Active',
    createdAt: '2026-05-21',
  },
  {
    id: 'USR-004',
    name: 'Nila Selvam',
    email: 'nila@magnify.lk',
    phone: '+94 75 456 7890',
    role: 'Staff',
    status: 'Inactive',
    createdAt: '2026-07-09',
  },
  {
    id: 'USR-005',
    name: 'Tharun Mohan',
    email: 'tharun@magnify.lk',
    phone: '+94 77 567 8901',
    role: 'Staff',
    status: 'Active',
    createdAt: '2026-09-15',
  },
];

export const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
