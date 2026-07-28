import { cookies } from 'next/headers';
import { prisma } from './db';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export async function getSession(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_session')?.value;
    if (!token) return null;

    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    return {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role,
    };
  } catch {
    return null;
  }
}

export async function createSession(userId: string, rememberMe = false): Promise<string> {
  const token = crypto.randomUUID() + '-' + crypto.randomUUID();
  const expiresAt = new Date();
  if (rememberMe) {
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days
  } else {
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours
  }

  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return token;
}

export async function deleteSession(token: string): Promise<void> {
  await prisma.session.deleteMany({ where: { token } });
}

export function hasPermission(userRole: string, requiredRoles: string[]): boolean {
  const roleHierarchy: Record<string, number> = {
    VIEWER: 0,
    AUTHOR: 1,
    EDITOR: 2,
    ADMIN: 3,
    SUPER_ADMIN: 4,
  };
  const userLevel = roleHierarchy[userRole] ?? -1;
  return requiredRoles.some((role) => userLevel >= (roleHierarchy[role] ?? 99));
}

import bcrypt from 'bcryptjs';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
