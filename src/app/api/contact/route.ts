import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
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
    if (!firstName || !lastName || !email || !message) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลในช่องที่จำเป็นให้ครบถ้วน' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
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
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim().toLowerCase(),
            phone: phone ? phone.trim() : null,
            message: message.trim(),
            status: 'NEW'
          }
        });
      } catch (dbError) {
        console.error('Database save error:', dbError);
        // Continue without failing the customer request
      }
    } else {
      console.log('Notice: DATABASE_URL not set in .env. Form submission payload:', {
        firstName, lastName, email, phone, message, timestamp: new Date()
      });
    }

    // 3. Optional LINE Notify Webhook
    const lineNotifyToken = process.env.LINE_NOTIFY_TOKEN;
    if (lineNotifyToken) {
      try {
        const lineMessage = `\n🔔 มีผู้ติดต่อใหม่จากหน้าเว็บดีถาวรการบัญชี!\nชื่อ: ${firstName} ${lastName}\nอีเมล: ${email}\nเบอร์โทร: ${phone || '-'}\nข้อความ: ${message}`;
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
