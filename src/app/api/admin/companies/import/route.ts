import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession, hasPermission } from '@/lib/auth';

interface ImportCompanyItem {
  name: string;
  taxId?: string;
  email?: string;
  phone?: string;
  address?: string;
  contactName?: string;
  contactRole?: string;
  contactPhone?: string;
  contactEmail?: string;
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasPermission(session, 'companies:create')) {
    return NextResponse.json({ success: false, error: 'ไม่มีสิทธิ์ในการนำเข้าข้อมูลบริษัท' }, { status: 403 });
  }

  try {
    const { items } = await req.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: 'ไม่มีข้อมูลสำหรับนำเข้า' }, { status: 400 });
    }

    // Get existing companies to avoid duplicate key errors
    const existingCompanies = await prisma.company.findMany({
      select: { name: true, taxId: true },
    });
    const existingNames = new Set(existingCompanies.map((c) => c.name.toLowerCase().trim()));
    const existingTaxIds = new Set(
      existingCompanies
        .filter((c) => !!c.taxId)
        .map((c) => c.taxId!.trim())
    );

    let importedCount = 0;
    let skippedCount = 0;
    const skippedItems: { name: string; reason: string }[] = [];

    const companiesWithoutContacts: Array<{
      name: string;
      taxId: string | null;
      email: string | null;
      phone: string | null;
      address: string | null;
    }> = [];

    const companiesWithContacts: Array<{
      name: string;
      taxId: string | null;
      email: string | null;
      phone: string | null;
      address: string | null;
      contacts: Array<{
        name: string;
        roleTitle: string;
        phone: string | null;
        email: string | null;
        isPrimary: boolean;
      }>;
    }> = [];

    for (const item of items as ImportCompanyItem[]) {
      const cleanName = item.name?.trim();
      if (!cleanName) {
        skippedCount++;
        skippedItems.push({ name: '(ไม่ระบุชื่อ)', reason: 'ไม่มีชื่อบริษัท' });
        continue;
      }

      if (existingNames.has(cleanName.toLowerCase())) {
        skippedCount++;
        skippedItems.push({ name: cleanName, reason: 'มีชื่อบริษัทนี้ในระบบแล้ว' });
        continue;
      }

      const cleanTaxId = item.taxId?.replace(/[^0-9]/g, '').trim() || null;
      if (cleanTaxId && existingTaxIds.has(cleanTaxId)) {
        skippedCount++;
        skippedItems.push({ name: cleanName, reason: `เลขประจำตัวผู้เสียภาษี ${cleanTaxId} ซ้ำกับในระบบ` });
        continue;
      }

      const companyBase = {
        name: cleanName,
        taxId: cleanTaxId,
        email: item.email?.trim() || null,
        phone: item.phone?.trim() || null,
        address: item.address?.trim() || null,
      };

      if (item.contactName?.trim()) {
        companiesWithContacts.push({
          ...companyBase,
          contacts: [
            {
              name: item.contactName.trim(),
              roleTitle: item.contactRole?.trim() || 'ผู้ประสานงานหลัก',
              phone: item.contactPhone?.trim() || null,
              email: item.contactEmail?.trim() || null,
              isPrimary: true,
            },
          ],
        });
      } else {
        companiesWithoutContacts.push(companyBase);
      }

      existingNames.add(cleanName.toLowerCase());
      if (cleanTaxId) existingTaxIds.add(cleanTaxId);
      importedCount++;
    }

    if (companiesWithoutContacts.length > 0) {
      await prisma.company.createMany({
        data: companiesWithoutContacts,
        skipDuplicates: true,
      });
    }

    const CHUNK_SIZE = 50;
    for (let i = 0; i < companiesWithContacts.length; i += CHUNK_SIZE) {
      const chunk = companiesWithContacts.slice(i, i + CHUNK_SIZE);
      await prisma.$transaction(
        chunk.map((c) =>
          prisma.company.create({
            data: {
              name: c.name,
              taxId: c.taxId,
              email: c.email,
              phone: c.phone,
              address: c.address,
              contacts: { create: c.contacts },
            },
          })
        )
      );
    }

    return NextResponse.json({
      success: true,
      importedCount,
      skippedCount,
      skippedItems,
      message: `นำเข้าสำเร็จ ${importedCount} บริษัท${skippedCount > 0 ? ` (ข้ามข้อมูลที่ซ้ำ ${skippedCount} รายการ)` : ''}`,
    });
  } catch (error) {
    console.error('Batch import error:', error);
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาดในการนำเข้าข้อมูล' }, { status: 500 });
  }
}
