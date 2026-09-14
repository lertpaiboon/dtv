import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession, hasPermission } from '@/lib/auth';

const DEFAULT_LINE_TEMPLATE = `เรียน {contactHeader} ({companyName})

สำนักงานบัญชีดีถาวร ขอแจ้งผลการดำเนินงานยื่นแบบและชำระภาษีงวด {monthYear} ให้เรียบร้อยแล้วค่ะ โดยมีรายละเอียดดังนี้:

{taxList}
-------------------------------------------
ยอดรวมเงินทดรองจ่ายภาษี: {totalAmount}

ท่านสามารถชำระคืนเงินทดรองจ่ายภาษีได้ที่บัญชี:
{bankAccount}

เมื่อท่านดำเนินการเรียบร้อยแล้ว สามารถส่งสลิปแจ้งกลับทางนี้ได้เลยนะคะ ทางสำนักงานจะรีบนำส่งใบเสร็จรับเงินจากกรมสรรพากรให้ท่านต่อไปค่ะ

หากมีข้อสงสัยหรือต้องการสอบถามเพิ่มเติม แจ้งได้ตลอดนะคะ
ขอบพระคุณที่ไว้วางใจให้ดีถาวรการบัญชีดูแลค่ะ 🙏`;

const DEFAULT_BANK_INFO = `ธนาคารกสิกรไทย (KBANK)
เลขที่บัญชี: 055-8-12345-6
ชื่อบัญชี: บจก. ดีถาวรการบัญชี`;

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const settings = await prisma.systemSetting.findMany();
    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }

    // Populate defaults if not yet present
    if (!settingsMap['billing_line_template']) {
      settingsMap['billing_line_template'] = DEFAULT_LINE_TEMPLATE;
    }
    if (!settingsMap['company_bank_info']) {
      settingsMap['company_bank_info'] = DEFAULT_BANK_INFO;
    }

    return NextResponse.json({
      success: true,
      data: settingsMap,
      defaults: {
        billing_line_template: DEFAULT_LINE_TEMPLATE,
        company_bank_info: DEFAULT_BANK_INFO,
      },
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  // Super admin check
  if (!hasPermission(session, '*')) {
    return NextResponse.json({ success: false, error: 'ต้องใช้สิทธิ์ผู้ดูแลระบบระดับสูง (Super Admin) ในการเปลี่ยนการตั้งค่า' }, { status: 403 });
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'ข้อมูลคำขอไม่ถูกต้อง' }, { status: 400 });
    }

    const updates: Promise<unknown>[] = [];
    for (const [key, value] of Object.entries(body)) {
      if (typeof key === 'string' && typeof value === 'string') {
        updates.push(
          prisma.systemSetting.upsert({
            where: { key },
            update: { value },
            create: { key, value },
          })
        );
      }
    }

    await Promise.all(updates);

    return NextResponse.json({ success: true, message: 'บันทึกการตั้งค่าเรียบร้อยแล้ว' });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ success: false, error: 'Failed to save settings' }, { status: 500 });
  }
}
