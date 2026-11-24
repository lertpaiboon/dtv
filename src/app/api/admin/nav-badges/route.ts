import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession, hasPermission } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const canViewBilling =
    hasPermission(session, '*') ||
    hasPermission(session, 'followup:view') ||
    hasPermission(session, 'vat:view') ||
    hasPermission(session, 'wht:view') ||
    hasPermission(session, 'pnd51:view');

  const canViewSeo = hasPermission(session, '*') || hasPermission(session, 'article:view');

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [urgentCount, unresolved404Count] = await Promise.all([
      canViewBilling
        ? prisma.followUpLog.count({
            where: {
              promisedDate: { lt: tomorrow },
              result: { in: ['PROMISED', 'PROMISED_TO_PAY'] },
              OR: [
                { taxPayment: { billingStatus: { not: 'PAID' } } },
                {
                  taxPaymentId: null,
                  company: {
                    taxPayments: {
                      some: {
                        billingStatus: { not: 'PAID' },
                      },
                    },
                  },
                },
              ],
            },
          })
        : Promise.resolve(0),
      canViewSeo
        ? prisma.errorLog404.count({ where: { isResolved: false } })
        : Promise.resolve(0),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          urgentCount,
          unresolved404Count,
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching admin nav badges:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch navigation badges' },
      { status: 500 }
    );
  }
}
