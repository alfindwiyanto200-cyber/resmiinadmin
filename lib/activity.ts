import { prisma } from './db';
import { ActivityAction } from '@prisma/client';

export async function logActivity(params: {
  userId?: string;
  action: ActivityAction;
  target?: string;
  targetId?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    await prisma.activityLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        target: params.target,
        targetId: params.targetId,
        details: params.details,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });
  } catch (error) {
    // Log silently — don't break main flow
    console.error('Failed to log activity:', error);
  }
}
