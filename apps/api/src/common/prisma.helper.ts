import type { PrismaService } from '../prisma/prisma.service.js';

export interface SessionDelegate {
  create(args: {
    data: { jti: string; userId: string; expiresAt: Date };
  }): Promise<unknown>;
  deleteMany(args: {
    where: { jti?: string; userId?: string };
  }): Promise<unknown>;
  findUnique(args: {
    where: { jti: string };
    include: { user: { select: { id: true; email: true; createdAt: true } } };
  }): Promise<{
    expiresAt: Date;
    user: { id: string; email: string; createdAt: Date } | null;
  } | null>;
}

export function getSessionDelegate(prisma: PrismaService): SessionDelegate {
  return prisma.session as unknown as SessionDelegate;
}
