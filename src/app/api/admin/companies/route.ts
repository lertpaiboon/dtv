import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession, hasPermission } from '@/lib/auth';

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasPermission(session, 'companies:view')) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search')?.trim() || '';

  try {
    const companies = await prisma.company.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search } },
              { taxId: { contains: search } },
              { email: { contains: search } },
              { phone: { contains: search } },
            ],
          }
        : undefined,
      include: {
        contacts: {
          orderBy: [{ isPrimary: 'desc' }, { id: 'asc' }],
        },
        _count: {
          select: {
            taxPayments: true,
            followUpLogs: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ success: true, data: companies });
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch companies' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasPermission(session, 'companies:create')) {
    return NextResponse.json({ success: false, error: 'ไม่มีสิทธิ์ในการเพิ่มข้อมูลบริษัท' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, taxId, email, phone, address, contacts } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'กรุณาระบุชื่อบริษัท' }, { status: 400 });
    }

    // Check unique name
    const existing = await prisma.company.findUnique({
      where: { name: name.trim() },
    });
    if (existing) {
      return NextResponse.json({ success: false, error: `มีบริษัทชื่อ "${name.trim()}" ในระบบแล้ว` }, { status: 409 });
    }

    const newCompany = await prisma.company.create({
      data: {
        name: name.trim(),
        taxId: taxId?.trim() || null,
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        contacts: Array.isArray(contacts) && contacts.length > 0
          ? {
              create: contacts
                .filter((c: { name?: string }) => c.name && c.name.trim())
                .map((c: { name: string; roleTitle?: string; phone?: string; email?: string; lineId?: string; isPrimary?: boolean; notes?: string }) => ({
                  name: c.name.trim(),
                  roleTitle: c.roleTitle?.trim() || null,
                  phone: c.phone?.trim() || null,
                  email: c.email?.trim() || null,
                  lineId: c.lineId?.trim() || null,
                  isPrimary: !!c.isPrimary,
                  notes: c.notes?.trim() || null,
                })),
            }
          : undefined,
      },
      include: {
        contacts: true,
      },
    });

    return NextResponse.json({ success: true, data: newCompany });
  } catch (error) {
    console.error('Error creating company:', error);
    return NextResponse.json({ success: false, error: 'ไม่สามารถสร้างข้อมูลบริษัทได้' }, { status: 500 });
  }
}
