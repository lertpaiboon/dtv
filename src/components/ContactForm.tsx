'use client';

import { FormEvent, useState } from 'react';
import Image from 'next/image';
import { AlertCircle, CheckCircle2, Clock3, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';

const initialForm = { firstName: '', lastName: '', email: '', phone: '', message: '' };

export default function ContactForm() {
  const [formData, setFormData] = useState(initialForm);
  const [honeypot, setHoneypot] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setStatus({ type: 'idle', message: '' });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          message: formData.message.trim(),
          website: honeypot,
        }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'เกิดข้อผิดพลาดในการส่งข้อความ');

      setFormData(initialForm);
      setStatus({ type: 'success', message: 'ได้รับข้อมูลแล้ว ทีมงานจะติดต่อกลับโดยเร็วที่สุด' });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'ส่งข้อความไม่สำเร็จ กรุณาโทร 099-149-5656 หรือ 091-941-5656',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="contact" id="contact">
      <div className="container contact__layout">
        <div className="contact__intro reveal-on-scroll">
          <p className="section-kicker section-kicker--inverse">เริ่มต้นคุยกับเรา</p>
          <h2>เล่าเรื่องธุรกิจของคุณ<br />ที่เหลือให้เราช่วยจัดการ</h2>
          <p>ส่งข้อมูลเบื้องต้นเพื่อให้ทีมงานประเมินขอบเขตและราคา ไม่มีค่าใช้จ่ายและไม่มีข้อผูกมัด</p>

          <div className="contact__details">
            <div><Phone aria-hidden="true" /><span><small>โทรปรึกษา</small><a href="tel:0991495656">099-149-5656</a><a href="tel:0919415656">091-941-5656</a></span></div>
            <div><Mail aria-hidden="true" /><span><small>อีเมล</small><a href="mailto:dtv_accounting@hotmail.com">dtv_accounting@hotmail.com</a><a href="mailto:c.pimmphisa@gmail.com">c.pimmphisa@gmail.com</a></span></div>
            <div><Clock3 aria-hidden="true" /><span><small>เวลาทำการ</small>จันทร์–ศุกร์ 08:30–18:00 น.</span></div>
            <div><MapPin aria-hidden="true" /><span><small>สำนักงาน</small>อโศก–ดินแดง ใกล้ MRT เพชรบุรี</span></div>
          </div>

          <div className="contact__line-card">
            <div className="contact__line-qr-wrap">
              <Image
                src="/images/line-qr.png"
                alt="LINE QR Code ดีถาวรการบัญชี"
                width={120}
                height={120}
                className="contact__line-qr-img"
              />
            </div>
            <div className="contact__line-content">
              <span className="contact__line-badge">
                <MessageCircle aria-hidden="true" size={14} /> LINE
              </span>
              <h4>ปรึกษาด่วนผ่าน LINE</h4>
              <p>สแกน QR Code ด้วยมือถือ หรือคลิกปุ่มเพื่อเพิ่มเพื่อน</p>
              <div className="contact__line-actions">
                <a
                  href="https://line.me/ti/p/DliAyJfUXd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact__line-button"
                >
                  <MessageCircle aria-hidden="true" size={15} /> แอด LINE คุยกับเรา
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="contact-form-card reveal-on-scroll delay-2">
          <div className="contact-form-card__heading">
            <h3>ขอคำปรึกษาเบื้องต้น</h3>
            <span>ตอบกลับภายใน 1 วันทำการ</span>
          </div>

          {status.type !== 'idle' && (
            <div className={`form-status form-status--${status.type}`} role="status" aria-live="polite">
              {status.type === 'success' ? <CheckCircle2 aria-hidden="true" /> : <AlertCircle aria-hidden="true" />}
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="honeypot" aria-hidden="true">
              <label htmlFor="form-website-field">เว็บไซต์</label>
              <input id="form-website-field" name="website" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(event) => setHoneypot(event.target.value)} />
            </div>

            <div className="form-row">
              <label>ชื่อ<input required name="firstName" autoComplete="given-name" placeholder="ชื่อ" value={formData.firstName} onChange={(event) => setFormData({ ...formData, firstName: event.target.value })} /></label>
              <label>นามสกุล<input required name="lastName" autoComplete="family-name" placeholder="นามสกุล" value={formData.lastName} onChange={(event) => setFormData({ ...formData, lastName: event.target.value })} /></label>
            </div>
            <div className="form-row">
              <label>อีเมล<input required type="email" name="email" autoComplete="email" placeholder="name@company.com" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} /></label>
              <label>เบอร์โทรศัพท์<input type="tel" name="phone" autoComplete="tel" inputMode="tel" placeholder="081-234-5678" value={formData.phone} onChange={(event) => setFormData({ ...formData, phone: event.target.value })} /></label>
            </div>
            <label>รายละเอียดที่ต้องการปรึกษา<textarea required name="message" rows={5} placeholder="ประเภทธุรกิจ บริการที่สนใจ และจำนวนเอกสารโดยประมาณ" value={formData.message} onChange={(event) => setFormData({ ...formData, message: event.target.value })} /></label>
            <button className="btn btn-primary form-submit" type="submit" disabled={loading}>
              <Send aria-hidden="true" /> {loading ? 'กำลังส่งข้อมูล...' : 'ส่งข้อมูลให้ทีมงาน'}
            </button>
            <p className="form-privacy">ข้อมูลของคุณใช้เพื่อการติดต่อกลับและประเมินบริการเท่านั้น</p>
          </form>
        </div>
      </div>
    </section>
  );
}
