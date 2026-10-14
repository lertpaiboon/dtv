import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendAdminContactNotification, sendClientConfirmation } from '@/lib/mail';

export const dynamic = 'force-dynamic';

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_SUBMISSIONS_PER_WINDOW = 5;
const contactRateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkContactRateLimit(ip: string): boolean {
  const now = Date.now();
  if (contactRateLimitMap.size > 1000) {
    for (const [key, val] of contactRateLimitMap.entries()) {
      if (val.resetAt <= now) contactRateLimitMap.delete(key);
    }
  }
  const existing = contactRateLimitMap.get(ip);
  if (!existing || existing.resetAt <= now) {
    contactRateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  existing.count += 1;
  return existing.count > MAX_SUBMISSIONS_PER_WINDOW;
}

export async function POST(req: Request) {
  try {
    const ip =
      (
        req.headers.get('x-forwarded-for')?.split(',')[0] ||
        req.headers.get('x-real-ip') ||
        'unknown'
      )
        .trim()
        .slice(0, 50) || 'unknown';

    if (checkContactRateLimit(ip)) {
      return NextResponse.json(
        { error: 'คุณส่งข้อความติดต่อบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่อีกครั้ง หรือติดต่อผ่าน LINE' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { firstName, lastName, email, phone, message, website } = body;

    // Honeypot spam bot trap: if website field is filled, silently discard
    if (website) {
      return NextResponse.json(
        {
          success: true,
          message: 'ได้รับข้อความเรียบร้อยแล้ว เจ้าหน้าที่จะติดต่อกลับโดยเร็วที่สุดครับ'
        },
        { status: 200 }
      );
    }

    // 1. Validation
    if (
      typeof firstName !== 'string' ||
      typeof lastName !== 'string' ||
      typeof email !== 'string' ||
      typeof message !== 'string' ||
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !message.trim()
    ) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลในช่องที่จำเป็นให้ครบถ้วน' },
        { status: 400 }
      );
    }

    const cleanFirstName = firstName.trim().slice(0, 100);
    const cleanLastName = lastName.trim().slice(0, 100);
    const cleanEmail = email.trim().toLowerCase().slice(0, 150);
    const cleanPhone = typeof phone === 'string' && phone.trim() ? phone.trim().slice(0, 50) : null;
    const cleanMessage = message.trim().slice(0, 5000);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { error: 'รูปแบบอีเมลไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    // 2. Save to MySQL Database if configured
    let savedLead = null;
    if (process.env.DATABASE_URL) {
      try {
        savedLead = await prisma.contactLead.create({
          data: {
            firstName: cleanFirstName,
            lastName: cleanLastName,
            email: cleanEmail,
            phone: cleanPhone,
            message: cleanMessage,
            status: 'NEW'
          }
        });
      } catch (dbError) {
        console.error('Database save error:', dbError);
        // Continue without failing the customer request
      }
    } else {
      console.log('Notice: DATABASE_URL not set in .env. Form submission payload:', {
        firstName: cleanFirstName,
        lastName: cleanLastName,
        email: cleanEmail,
        phone: cleanPhone,
        message: cleanMessage,
        timestamp: new Date()
      });
    }

    // 3. Optional SMTP Email Notifications
    const leadData = {
      firstName: cleanFirstName,
      lastName: cleanLastName,
      email: cleanEmail,
      phone: cleanPhone,
      message: cleanMessage,
    };

    try {
      await Promise.allSettled([
        sendAdminContactNotification(leadData),
        sendClientConfirmation(leadData),
      ]);
    } catch (mailError) {
      console.error('Email dispatch error:', mailError);
    }

    // 4. Optional LINE Notify Webhook
    const lineNotifyToken = process.env.LINE_NOTIFY_TOKEN;
    if (lineNotifyToken) {
      try {
        const lineMessage = `\n🔔 มีผู้ติดต่อใหม่จากหน้าเว็บดีถาวรการบัญชี!\nชื่อ: ${cleanFirstName} ${cleanLastName}\nอีเมล: ${cleanEmail}\nเบอร์โทร: ${cleanPhone || '-'}\nข้อความ: ${cleanMessage}`;
        await fetch('https://notify-api.line.me/api/notify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${lineNotifyToken}`
          },
          body: new URLSearchParams({ message: lineMessage })
        });
      } catch (lineErr) {
        console.error('Line notify error:', lineErr);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'ได้รับข้อความเรียบร้อยแล้ว เจ้าหน้าที่จะติดต่อกลับโดยเร็วที่สุดครับ',
        id: savedLead?.id
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Contact API Error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง' },
      { status: 500 }
    );
  }
}
