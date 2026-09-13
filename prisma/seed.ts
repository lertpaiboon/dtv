import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting system initialization seed...');

  // 1. Roles & Permissions (RBAC Matrix)
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'SUPER_ADMIN' },
    update: {
      permissions: ['*'],
    },
    create: {
      name: 'SUPER_ADMIN',
      description: 'ผู้ดูแลระบบสูงสุด (เข้าถึงและจัดการได้ทุกฟังก์ชัน)',
      permissions: ['*'],
    },
  });

  await prisma.role.upsert({
    where: { name: 'ACCOUNTANT' },
    update: {
      permissions: [
        'pnd51:view', 'pnd51:create', 'pnd51:edit',
        'wht:view', 'wht:create', 'wht:edit',
        'vat:view', 'vat:create', 'vat:edit',
        'companies:view', 'companies:create', 'companies:edit',
        'followup:view', 'followup:create', 'followup:edit',
      ],
    },
    create: {
      name: 'ACCOUNTANT',
      description: 'เจ้าหน้าที่บัญชีและการเงิน (จัดการภาษี, ทะเบียนบริษัท, และบันทึกการทวงถาม)',
      permissions: [
        'pnd51:view', 'pnd51:create', 'pnd51:edit',
        'wht:view', 'wht:create', 'wht:edit',
        'vat:view', 'vat:create', 'vat:edit',
        'companies:view', 'companies:create', 'companies:edit',
        'followup:view', 'followup:create', 'followup:edit',
      ],
    },
  });

  await prisma.role.upsert({
    where: { name: 'VIEWER' },
    update: {
      permissions: [
        'pnd51:view', 'wht:view', 'vat:view', 'companies:view', 'followup:view',
      ],
    },
    create: {
      name: 'VIEWER',
      description: 'ผู้ตรวจสอบ / ดูข้อมูลได้อย่างเดียว (ไม่สามารถเพิ่มหรือแก้ไขข้อมูล)',
      permissions: [
        'pnd51:view', 'wht:view', 'vat:view', 'companies:view', 'followup:view',
      ],
    },
  });

  console.log('✅ Roles initialized.');

  // 2. Payment Methods (บัตรเครดิตสำนักงาน และวิธีชำระเงินหลัก)
  const paymentMethods = [
    { code: 'SCB_CARD', name: 'บัตรเครดิต SCB' },
    { code: 'BBL_CARD', name: 'บัตรเครดิต BBL' },
    { code: 'KBANK_CARD', name: 'บัตรเครดิต KBANK' },
    { code: 'TRANSFER', name: 'โอนเงินผ่านบัญชีธนาคาร' },
    { code: 'CASH', name: 'เงินสด / สำรองจ่าย' },
  ];

  for (const pm of paymentMethods) {
    await prisma.paymentMethod.upsert({
      where: { code: pm.code },
      update: { name: pm.name },
      create: pm,
    });
  }
  console.log('✅ Payment Methods initialized (SCB, BBL, KBANK, Transfer, Cash).');

  // 3. Default Super Admin User
  const defaultAdminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const defaultAdminPassword = process.env.ADMIN_PASSWORD;
  if (!defaultAdminEmail || !defaultAdminPassword || defaultAdminPassword.length < 12) {
    console.log('ℹ️ Skipping admin creation. Set ADMIN_EMAIL and ADMIN_PASSWORD (12+ characters) to create one.');
    return;
  }
  const existingAdmin = await prisma.user.findUnique({
    where: { email: defaultAdminEmail },
  });

  if (!existingAdmin) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(defaultAdminPassword, salt);

    await prisma.user.create({
      data: {
        email: defaultAdminEmail,
        passwordHash: passwordHash,
        fullName: 'ผู้ดูแลระบบ ดีถาวร',
        roleId: superAdminRole.id,
        isActive: true,
      },
    });
    console.log(`✅ Super Admin created: ${defaultAdminEmail}`);
  } else if (process.env.RESET_ADMIN_PASSWORD === 'true') {
    const passwordHash = await bcrypt.hash(defaultAdminPassword, 12);
    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: { passwordHash, isActive: true, roleId: superAdminRole.id },
    });
    console.log(`✅ Super Admin password reset: ${defaultAdminEmail}`);
  } else {
    console.log(`ℹ️ Admin user ${defaultAdminEmail} already exists.`);
  }

  console.log('🎉 System initialization finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
