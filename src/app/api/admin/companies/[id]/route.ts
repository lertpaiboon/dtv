import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession, hasPermission } from '@/lib/auth';
import { parsePositiveId } from '@/lib/admin-domain';

type ContactInput = {
  id?: unknown;
  name?: unknown;
  roleTitle?: unknown;
  phone?: unknown;
  email?: unknown;
  lineId?: unknown;
  isPrimary?: unknown;
  notes?: unknown;
};

const clean = (value: unknown) => typeof value === 'string' && value.trim() ? value.trim() : null;

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasPermission(session, 'companies:edit')) {
    return NextResponse.json({ success: false, error: 'ไม่มีสิทธิ์ในการแก้ไขข้อมูลบริษัท' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const companyId = parsePositiveId(id);
    if (!companyId) return NextResponse.json({ success: false, error: 'รหัสบริษัทไม่ถูกต้อง' }, { status: 400 });
    const body = await req.json();
    const { name, taxId, email, phone, address, isActive, contacts } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'กรุณาระบุชื่อบริษัท' }, { status: 400 });
    }

    const normalizedContacts = Array.isArray(contacts)
      ? (contacts as ContactInput[])
          .filter((contact) => clean(contact.name))
          .map((contact) => ({
            id: parsePositiveId(contact.id),
            name: clean(contact.name)!,
            roleTitle: clean(contact.roleTitle),
            phone: clean(contact.phone),
            email: clean(contact.email),
            lineId: clean(contact.lineId),
            isPrimary: Boolean(contact.isPrimary),
            notes: clean(contact.notes),
          }))
      : null;

    const updated = await prisma.$transaction(async (tx) => {
      const company = await tx.company.update({
        where: { id: companyId },
        data: {
          name: name.trim(),
          taxId: taxId?.trim() || null,
          email: email?.trim() || null,
          phone: phone?.trim() || null,
          address: address?.trim() || null,
          isActive: isActive !== undefined ? !!isActive : true,
        },
      });

      if (normalizedContacts) {
        const existingContacts = await tx.companyContact.findMany({ where: { companyId }, select: { id: true } });
        const existingIds = new Set(existingContacts.map((contact) => contact.id));
        const retainedIds: number[] = [];

        for (const contact of normalizedContacts) {
          const { id: contactId, ...contactData } = contact;
          if (contactId && existingIds.has(contactId)) {
            await tx.companyContact.update({ where: { id: contactId }, data: contactData });
            retainedIds.push(contactId);
          } else {
            const created = await tx.companyContact.create({ data: { ...contactData, companyId } });
            retainedIds.push(created.id);
          }
        }

        const removedIds = existingContacts.map((contact) => contact.id).filter((contactId) => !retainedIds.includes(contactId));
        if (removedIds.length > 0) {
          await tx.followUpLog.updateMany({ where: { contactId: { in: removedIds } }, data: { contactId: null } });
          await tx.companyContact.deleteMany({ where: { id: { in: removedIds }, companyId } });
        }
      }

      const fullCompany = await tx.company.findUnique({
        where: { id: companyId },
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
      });

      return fullCompany || company;
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating company:', error);
    return NextResponse.json({ success: false, error: 'ไม่สามารถแก้ไขข้อมูลได้' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasPermission(session, 'companies:delete')) {
    return NextResponse.json({ success: false, error: 'ไม่มีสิทธิ์ในการลบข้อมูลบริษัท' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const companyId = parseInt(id, 10);

    // Check if company has linked tax payments
    const paymentsCount = await prisma.taxPayment.count({
      where: { companyId },
    });
    if (paymentsCount > 0) {
      return NextResponse.json(
        { success: false, error: `ไม่สามารถลบได้ เนื่องจากมีรายการชำระภาษีผูกอยู่ ${paymentsCount} รายการ` },
        { status: 400 }
      );
    }

    await prisma.company.delete({
      where: { id: companyId },
    });

    return NextResponse.json({ success: true, message: 'ลบข้อมูลบริษัทสำเร็จ' });
  } catch (error) {
    console.error('Error deleting company:', error);
    return NextResponse.json({ success: false, error: 'ไม่สามารถลบข้อมูลได้' }, { status: 500 });
  }
}
