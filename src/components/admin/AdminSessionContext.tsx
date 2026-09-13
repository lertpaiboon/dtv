'use client';

import { createContext, useContext, type ReactNode } from 'react';

export type AdminSessionUser = {
  id: number;
  email: string;
  fullName: string;
  roleName: string;
  permissions: string[];
};

const AdminSessionContext = createContext<AdminSessionUser | null>(null);

export function AdminSessionProvider({
  user,
  children,
}: {
  user: AdminSessionUser | null;
  children: ReactNode;
}) {
  return <AdminSessionContext.Provider value={user}>{children}</AdminSessionContext.Provider>;
}

export function useAdminSession() {
  const user = useContext(AdminSessionContext);
  const can = (permission: string) =>
    Boolean(user?.permissions.includes('*') || user?.permissions.includes(permission));

  return { user, can, ready: user !== null };
}
