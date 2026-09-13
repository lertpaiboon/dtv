import nodemailer from 'nodemailer';

interface ContactLeadData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  message: string;
}

/**
 * Creates and returns a nodemailer transporter based on .env SMTP configurations.
 * Returns null if SMTP configuration is not present.
 */
function getMailTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT) || 465;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
    // Allows self-signed / hosting certificates without throwing errors on Plesk
    tls: {
      rejectUnauthorized: false,
    },
  });
}

/**
 * Sends a notification email to the firm's administrators about a new inquiry.
 */
export async function sendAdminContactNotification(lead: ContactLeadData) {
  const transporter = getMailTransporter();
  if (!transporter) {
    console.log('ℹ️ [SMTP] Skipped sending admin notification: SMTP_HOST/USER/PASS not fully configured in .env');
    return false;
  }

  const senderUser = process.env.SMTP_USER;
  const adminReceivers = process.env.NOTIFICATION_RECEIVER_EMAIL || 'dtv_accounting@hotmail.com, c.pimmphisa@gmail.com';
  const fullName = `${lead.firstName} ${lead.lastName}`.trim();

  const formattedDate = new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Bangkok',
  }).format(new Date());

  const html = `
    <!DOCTYPE html>
    <html lang="th">
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
        .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .header { background: #1B2A80; color: #ffffff; padding: 24px; text-align: center; }
        .header h1 { margin: 0 0 6px; font-size: 20px; font-weight: 700; }
        .header p { margin: 0; opacity: 0.85; font-size: 13px; }
        .content { padding: 24px; }
        .lead-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .lead-table td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; vertical-align: top; }
        .lead-table td.label { font-weight: 600; color: #475569; width: 110px; }
        .lead-table td.value { color: #0f172a; }
        .msg-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; font-size: 14px; line-height: 1.6; color: #334155; white-space: pre-wrap; }
        .footer { background: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>🔔 มีผู้ติดต่อใหม่จากหน้าเว็บไซต์</h1>
          <p>ดีถาวรการบัญชี (Deethavorn Accounting)</p>
        </div>
        <div class="content">
          <table class="lead-table">
            <tr>
              <td class="label">ชื่อ-นามสกุล:</td>
              <td class="value"><strong>${fullName}</strong></td>
            </tr>
            <tr>
              <td class="label">เบอร์โทรศัพท์:</td>
              <td class="value"><a href="tel:${lead.phone || ''}" style="color: #1B2A80; font-weight: 600; text-decoration: none;">${lead.phone || 'ไม่ได้ระบุ'}</a></td>
            </tr>
            <tr>
              <td class="label">อีเมลลูกค้า:</td>
              <td class="value"><a href="mailto:${lead.email}" style="color: #1B2A80; text-decoration: none;">${lead.email}</a></td>
            </tr>
            <tr>
              <td class="label">เวลาที่ติดต่อ:</td>
              <td class="value">${formattedDate}</td>
            </tr>
          </table>
          <p style="font-weight: 600; margin: 0 0 8px; font-size: 14px; color: #475569;">รายละเอียดที่ต้องการปรึกษา:</p>
          <div class="msg-box">${lead.message}</div>
        </div>
        <div class="footer">
          อีเมลนี้ถูกส่งอัตโนมัติจากระบบแบบฟอร์มเว็บไซต์ deethavorn.com
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"ดีถาวรการบัญชี (ระบบเว็บไซต์)" <${senderUser}>`,
      to: adminReceivers,
      replyTo: lead.email,
      subject: `🔔 มีผู้ติดต่อขอคำปรึกษาใหม่: คุณ ${fullName}`,
      html,
    });
    console.log(`✅ [SMTP] Sent inquiry notification for ${fullName} to ${adminReceivers}`);
    return true;
  } catch (error) {
    console.error('❌ [SMTP] Failed to send admin notification email:', error);
    return false;
  }
}

/**
 * Sends a confirmation email to the client acknowledging their request.
 */
export async function sendClientConfirmation(lead: ContactLeadData) {
  const transporter = getMailTransporter();
  if (!transporter) return false;

  const senderUser = process.env.SMTP_USER;
  const fullName = `${lead.firstName} ${lead.lastName}`.trim();

  const html = `
    <!DOCTYPE html>
    <html lang="th">
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
        .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .header { background: #1B2A80; color: #ffffff; padding: 28px 24px; text-align: center; }
        .header h1 { margin: 0 0 6px; font-size: 22px; font-weight: 700; }
        .header p { margin: 0; opacity: 0.9; font-size: 14px; }
        .content { padding: 28px 24px; font-size: 15px; line-height: 1.7; color: #334155; }
        .contact-pill { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin: 20px 0; font-size: 14px; }
        .contact-pill p { margin: 4px 0; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>บริษัท ดีถาวรการบัญชี จำกัด</h1>
          <p>ได้รับข้อมูลการติดต่อของคุณเรียบร้อยแล้ว</p>
        </div>
        <div class="content">
          <p>เรียน คุณ <strong>${fullName}</strong>,</p>
          <p>ทางทีมงานดีถาวรการบัญชีได้รับข้อมูลและรายละเอียดคำปรึกษาของคุณเรียบร้อยแล้ว เจ้าหน้าที่จะทำการตรวจสอบข้อมูลเบื้องต้นและติดต่อกลับโดยเร็วที่สุดในเวลาทำการครับ</p>
          
          <div class="contact-pill">
            <p><strong>ช่องทางติดต่อด่วน:</strong></p>
            <p>📞 โทร: <a href="tel:0991495656" style="color: #1B2A80; text-decoration: none; font-weight: 600;">099-149-5656</a> / <a href="tel:0919415656" style="color: #1B2A80; text-decoration: none; font-weight: 600;">091-941-5656</a></p>
            <p>💬 LINE: <a href="https://line.me/ti/p/DliAyJfUXd" style="color: #06C755; text-decoration: none; font-weight: 600;">คลิกแอด LINE ปรึกษาทีมงาน</a></p>
            <p>🕒 เวลาทำการ: จันทร์–ศุกร์ 08:30–17:30 น.</p>
          </div>

          <p style="margin-top: 24px;">ขอแสดงความนับถือ,<br><strong>ทีมงาน บริษัท ดีถาวรการบัญชี จำกัด</strong></p>
        </div>
        <div class="footer">
          234/116 ถนนอโศก–ดินแดง แขวงบางกะปิ เขตห้วยขวาง กรุงเทพฯ 10310<br>
          อีเมลนี้เป็นการแจ้งเตือนอัตโนมัติจากระบบ
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"บริษัท ดีถาวรการบัญชี จำกัด" <${senderUser}>`,
      to: lead.email,
      subject: `บริษัท ดีถาวรการบัญชี จำกัด - ได้รับข้อมูลการขอคำปรึกษาของคุณเรียบร้อยแล้ว`,
      html,
    });
    console.log(`✅ [SMTP] Sent client confirmation to ${lead.email}`);
    return true;
  } catch (error) {
    console.error('❌ [SMTP] Failed to send client confirmation email:', error);
    return false;
  }
}
