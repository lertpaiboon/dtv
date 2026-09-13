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

      const contactsData = item.contactName?.trim()
        ? [
            {
              name: item.contactName.trim(),
              roleTitle: item.contactRole?.trim() || 'ผู้ประสานงานหลัก',
              phone: item.contactPhone?.trim() || null,
              email: item.contactEmail?.trim() || null,
              isPrimary: true,
            },
          ]
        : [];

      await prisma.company.create({
        data: {
          name: cleanName,
          taxId: cleanTaxId,
          email: item.email?.trim() || null,
          phone: item.phone?.trim() || null,
          address: item.address?.trim() || null,
          contacts: contactsData.length > 0 ? { create: contactsData } : undefined,
        },
      });

      existingNames.add(cleanName.toLowerCase());
      if (cleanTaxId) existingTaxIds.add(cleanTaxId);
      importedCount++;
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
