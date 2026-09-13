import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Run queries in parallel
    const [promisedToday, overduePromises, oldUnbilledCount] = await Promise.all([
      // 1. Follow-ups promised today
      prisma.followUpLog.findMany({
        where: {
          promisedDate: {
            gte: today,
            lt: tomorrow,
          },
          result: 'PROMISED',
        },
        include: {
          company: { select: { id: true, name: true, phone: true } },
        },
        take: 20,
      }),

      // 2. Overdue promises
      prisma.followUpLog.findMany({
        where: {
          promisedDate: {
            lt: today,
          },
          result: 'PROMISED',
        },
        include: {
          company: { select: { id: true, name: true, phone: true } },
        },
        take: 20,
      }),

      // 3. Tax payments unbilled older than 7 days
      prisma.taxPayment.count({
        where: {
          billingStatus: { in: ['UNBILLED', 'ADVANCED'] },
          paymentDate: { lt: sevenDaysAgo },
        },
      }),
    ]);

    const urgentCount = promisedToday.length + overduePromises.length;

    return NextResponse.json({
      success: true,
      data: {
        urgentCount,
        promisedTodayCount: promisedToday.length,
        overduePromisesCount: overduePromises.length,
        oldUnbilledCount,
        promisedToday,
        overduePromises,
      },
    });
  } catch (error) {
    console.error('Error fetching billing alerts:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch alerts' }, { status: 500 });
  }
}
