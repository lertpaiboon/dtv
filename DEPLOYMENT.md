# คู่มือการติดตั้งและ Deploy เว็บไซต์ บริษัท ดีถาวรการบัญชี จำกัด (Next.js 15 + MySQL + Prisma)

เอกสารนี้รวบรวมขั้นตอนการนำเว็บไซต์ **บริษัท ดีถาวรการบัญชี จำกัด (Deethavorn Accounting Co., Ltd.)** ขึ้นรันบน Production Server ทุกรูปแบบอย่างละเอียด ครอบคลุมทั้ง **Ubuntu / Debian VPS**, **Plesk Obsidian Control Panel**, และ **Vesta CP / Nginx Reverse Proxy**

---

## 🏗️ 1. สถาปัตยกรรมและข้อกำหนดขั้นต่ำของระบบ (System Requirements)

| ส่วนประกอบ | ข้อกำหนดขั้นต่ำที่แนะนำ | รายละเอียด |
| :--- | :--- | :--- |
| **Operating System** | Ubuntu 22.04 LTS / Debian 12 / AlmaLinux 9 | หรือระบบปฏิบัติการ Linux / Windows Server ที่รองรับ Node.js |
| **Node.js Runtime** | Node.js `18.18.0+` หรือ `20.x LTS` (แนะนำ) | จำเป็นสำหรับการทำงานของ Next.js 15 และ React 19 |
| **Package Manager** | `npm` 10+ หรือ `pnpm` / `yarn` | มาพร้อมกับ Node.js |
| **Database** | MySQL Server `8.0+` หรือ MariaDB `10.5+` | รองรับการจัดเก็บ Contact Leads และ utf8mb4 |
| **Process Manager** | [PM2](https://pm2.keymetrics.io/) | ดูแลให้เว็บทำงานตลอด 24 ชั่วโมง และ Autorestart เมื่อเซิร์ฟเวอร์รีบูต |
| **Web Server / Proxy**| Nginx 1.20+ หรือ Apache (พร้อม mod_proxy) | ทำหน้าที่ Reverse Proxy รับ Traffic พอร์ต 80/443 ส่งต่อพอร์ต 3000 |
| **SSL Certificate** | Let's Encrypt (Certbot) | ใบรับรองความปลอดภัย HTTPS ฟรี |

---

## ⚙️ 2. การเตรียม Environment Variables (`.env`)

เมื่อ Clone โค้ดหรืออัปโหลดไฟล์ขึ้นเซิร์ฟเวอร์แล้ว ให้สร้างไฟล์ `.env` ที่ Root โฟลเดอร์:

```bash
cp .env.example .env
nano .env   # หรือใช้ Text Editor ปรับแต่งค่า
```

### ตัวอย่างการกำหนดค่าภายใน `.env`:
```env
# 1. การเชื่อมต่อฐานข้อมูล MySQL (รูปแบบ: mysql://USER:PASSWORD@HOST:PORT/DATABASE)
DATABASE_URL="mysql://deethavorn_user:YourStrongPassword@127.0.0.1:3306/deethavorn_db"

# 2. ตั้งค่า Node Environment
NODE_ENV="production"
PORT=3000

# 3. SMTP Mail Server (ทางเลือก สำหรับระบบส่งแจ้งเตือนทีมงานเมื่อมีลูกค้าติดต่อเข้ามา)
SMTP_HOST="mail.deethavorn.com"
SMTP_PORT=587
SMTP_USER="info@deethavorn.com"
SMTP_PASS="YourEmailPassword"
SMTP_FROM="บริษัท ดีถาวรการบัญชี จำกัด <info@deethavorn.com>"
NOTIFICATION_EMAIL="contact@deethavorn.com"

# 4. LINE Notify Token (ทางเลือก สำหรับส่งแจ้งเตือนเข้ากลุ่มไลน์พนักงานทันที)
LINE_NOTIFY_TOKEN="your_line_notify_token_here"
```

---

## 🗄️ 3. การเตรียมฐานข้อมูล MySQL และ Prisma Migration

### 3.1 สร้าง Database และ User บน MySQL
เข้าสู่ MySQL Shell:
```bash
sudo mysql -u root -p
```
รันคำสั่ง SQL สร้างฐานข้อมูลและกำหนดสิทธิ์:
```sql
CREATE DATABASE deethavorn_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'deethavorn_user'@'localhost' IDENTIFIED BY 'YourStrongPassword';
GRANT ALL PRIVILEGES ON deethavorn_db.* TO 'deethavorn_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3.2 ซิงค์ตารางฐานข้อมูลอัตโนมัติด้วย Prisma
รันคำสั่งจากโฟลเดอร์โปรเจกต์:
```bash
# 1. ติดตั้ง Dependencies ทั้งหมด
npm install

# 2. สร้าง Prisma Client
npx prisma generate

# 3. สร้างตาราง contact_leads บน MySQL ตาม schema.prisma
npx prisma db push
```

> 💡 **การเปิดดูข้อมูล Leads ผ่าน Web GUI (Prisma Studio)**:  
> หากต้องการดูข้อมูลลูกค้าที่กรอกแบบฟอร์มเข้ามา สามารถพิมพ์คำสั่ง:
> ```bash
> npx prisma studio
> ```
> แล้วเปิดเบราว์เซอร์ที่พอร์ต 5555 (หรือทำ SSH Tunnel `ssh -L 5555:localhost:5555 user@server_ip`)

---

## 📦 4. การ Build โปรเจกต์สำหรับ Production

ก่อนเริ่มรันบริการจริง ต้องทำการ Compile หน้าเว็บและ Bundle ไฟล์ทั้งหมด:

```bash
npm run build
```

ผลลัพธ์ที่ได้:
* หน้า Landing Page (`/`) และหน้าคลังความรู้ (`/knowledge`) จะถูกพรีเรนเดอร์เป็น Static HTML/RSC อย่างมีประสิทธิภาพสูงสุด
* ไฟล์ระบบ SEO (`/sitemap.xml`, `/robots.txt`) และระบบดักจับ Error (`not-found.tsx`, `error.tsx`) จะถูกคอมไพล์พร้อมใช้งานทันที

---

## 🚀 5. การรันเว็บด้วย Process Manager (PM2)

เพื่อให้ Node.js ทำงานตลอด 24 ชม. และกู้คืนตัวเองอัตโนมัติเมื่อเกิดข้อผิดพลาด:

### 5.1 ติดตั้ง PM2 (หากยังไม่มีในระบบ)
```bash
sudo npm install -g pm2
```

### 5.2 เริ่มต้นการทำงาน (Start Service)
สร้างหรือรันด้วยคำสั่ง:
```bash
# รันโปรเจกต์โดยใช้คำสั่ง npm run start
pm2 start npm --name "deethavorn-web" -- start

# หรือหากต้องการระบุพอร์ตชัดเจน
pm2 start "npm run start" --name "deethavorn-web" -- -p 3000
```

### 5.3 ตั้งค่าให้เปิดทำงานอัตโนมัติเมื่อเซิร์ฟเวอร์เปิดใหม่ (Autostart on Boot)
```bash
pm2 save
pm2 startup
# นำคำสั่งที่ PM2 แนะนำในหน้าจอมา Copy วางและรันด้วยสิทธิ์ sudo
```

### 5.4 คำสั่งการจัดการ PM2 ที่สำคัญ:
```bash
pm2 status                  # ตรวจสอบสถานะการทำงาน
pm2 logs deethavorn-web     # ดู Log การทำงานและ Error แบบ Real-time
pm2 reload deethavorn-web   # Zero-downtime reload เมื่อมีการอัปเดตโค้ดใหม่
pm2 restart deethavorn-web  # รีสตาร์ตระบบ
pm2 stop deethavorn-web     # หยุดการทำงานชั่วคราว
```

---

## 🌐 6. การตั้งค่า Web Server & Reverse Proxy

### แบบที่ 6.1: ติดตั้งบน Nginx Standalone (Ubuntu/Debian VPS)

สร้างไฟล์คอนฟิก Nginx Virtual Host:
```bash
sudo nano /etc/nginx/sites-available/deethavorn.com
```

ระบุการตั้งค่าต่อไปนี้:
```nginx
server {
    listen 80;
    server_name deethavorn.com www.deethavorn.com;

    # บล็อกการเข้าถึงไฟล์ซ่อนและไฟล์คอนฟิก
    location ~ /\.(?!well-known).* {
        deny all;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts สำหรับงานประมวลผล
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
    }
}
```

เปิดใช้งานคอนฟิกและรีสตาร์ต Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/deethavorn.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

ติดตั้ง SSL ฟรีด้วย Let's Encrypt Certbot:
```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d deethavorn.com -d www.deethavorn.com
```

---

### แบบที่ 6.2: ติดตั้งผ่าน Plesk Obsidian (Node.js Extension)

หากเซิร์ฟเวอร์ของคุณจัดการผ่าน **Plesk Obsidian Control Panel**:
1. ไปที่เมนู **Websites & Domains** > เลือกโดเมน `deethavorn.com`
2. คลิกเมนู **Node.js**:
   * **Node.js Version**: เลือกเวอร์ชัน 20.x หรือ 18.x
   * **Document Root**: `/httpdocs/public` (หรือไดเรกทอรีที่อัปโหลด)
   * **Application Root**: `/httpdocs` (โฟลเดอร์รากของโปรเจกต์)
   * **Application Startup File**: `node_modules/next/dist/bin/next`
   * **Application Mode**: `production`
   * **Application Arguments**: `start`
3. ในหัวข้อ **Custom Environment Variables**:
   * เพิ่มตัวแปร `DATABASE_URL` และ `PORT=3000` ตามที่ระบุใน `.env`
4. คลิกปุ่ม **NPM Install** แล้วคลิก **Run script** พิมพ์ `build`
5. คลิก **Restart Application** เพื่อเริ่มรันระบบ
6. ไปที่เมนู **SSL/TLS Certificates** ใน Plesk เพื่อสั่งออกใบรับรอง Let's Encrypt แบบ 1-Click

---

### แบบที่ 6.3: ติดตั้งผ่าน Vesta CP / Hestia CP

1. สร้าง Web Domain `deethavorn.com` ใน Control Panel
2. กำหนด Proxy Template ของ Nginx ให้ชี้ไปยัง Port `3000`
3. เปิด Terminal หรือ SSH เข้าสู่ User เจ้าของโดเมน
4. อัปโหลดโค้ดไว้ใน `/home/{username}/web/deethavorn.com/public_html/`
5. รัน `npm install`, `npx prisma db push`, `npm run build`
6. ใช้ PM2 รัน `pm2 start npm --name "deethavorn" -- start`
7. ติ๊กเปิดใช้งาน SSL Support + Let's Encrypt Support ในหน้าตั้งค่า Domain ของ Vesta CP

---

## 🔄 7. ขั้นตอนการอัปเดตระบบในอนาคต (Deployment Update Workflow)

เมื่อคุณมีการ Commit และ Push โค้ดใหม่ขึ้น Git แล้วต้องการ Deploy อัปเดตบน Production:

```bash
# 1. ดึงโค้ดล่าสุดจาก Git
git pull origin main

# 2. อัปเดต Dependencies และ Prisma Client (หากมี)
npm install
npx prisma generate
npx prisma db push

# 3. คอมไพล์โปรเจกต์ใหม่
npm run build

# 4. สั่ง Reload เว็บไซต์โดยไม่มี Downtime
pm2 reload deethavorn-web
```

---

## 🧪 8. การทดสอบและตรวจสอบความถูกต้องของระบบ (Verification)

หลังจาก Deploy เสร็จสิ้น ให้รันการทดสอบฟังก์ชันสำคัญทั้งหมด:
```bash
# 1. ทดสอบ Linting
npm run lint

# 2. รันทดสอบ End-to-End Automated Test (Playwright)
node scripts/verify-webapp.mjs
```

### เกณฑ์การตรวจสอบความพร้อม:
- [x] หน้าเว็บหลักโหลดเร็ว ไม่มี Layout Shift (`CLS < 0.1`)
- [x] ลิงก์ทุกจุดทำงานถูกต้อง (Header navigation, MRT เพชรบุรี Map link, เบอร์โทร `tel:`)
- [x] เมนูมือถือ (Mobile Drawer) เปิด-ปิดได้อย่างสมบูรณ์
- [x] ฟอร์มติดต่อ (`ContactForm`) บันทึกข้อมูลลงฐานข้อมูล MySQL และแจ้งเตือนสำเร็จ
- [x] ระบบป้องกัน Bot (Honeypot) สกัดกั้นสแปมอัตโนมัติ
- [x] หน้า 404 (`/not-found`) และ Error Boundary (`/error`) แสดงผลถูกต้อง
- [x] หน้าคลังความรู้ (`/knowledge`) แสดงบทความครบทั้ง 5 หัวข้อ
- [x] ระบบ SEO XML Sitemap (`/sitemap.xml`) และ Robots (`/robots.txt`) เข้าถึงได้ถูกต้อง
