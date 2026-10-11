import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { hasArticlePermission, ARTICLE_PERMISSIONS } from '@/lib/articles/permissions';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/articles/validation';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasArticlePermission(session, ARTICLE_PERMISSIONS.VIEW)) {
    return NextResponse.json({ success: false, error: 'Forbidden: ไม่มีสิทธิ์ดูข้อมูลผู้เขียน' }, { status: 403 });
  }

  try {
    const authors = await prisma.author.findMany({
      orderBy: { id: 'asc' },
      include: {
        _count: {
          select: {
            authoredArticles: true,
            reviewedArticles: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: authors });
  } catch (error) {
    console.error('Error fetching authors:', error);
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาดในการโหลดข้อมูลผู้เขียน' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasArticlePermission(session, ARTICLE_PERMISSIONS.CREATE)) {
    return NextResponse.json({ success: false, error: 'Forbidden: ไม่มีสิทธิ์เพิ่มผู้เขียนใหม่' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const name = (body.name || '').trim();
    let slug = (body.slug || '').trim();

    if (!name) {
      return NextResponse.json({ success: false, error: 'กรุณาระบุชื่อ-นามสกุล หรือชื่อทีมผู้เขียน' }, { status: 400 });
    }

    if (!slug) {
      slug = slugify(name);
    } else {
      slug = slugify(slug);
    }

    if (!slug) {
      return NextResponse.json({ success: false, error: 'กรุณาระบุ URL Slug ของผู้เขียน' }, { status: 400 });
    }

    // Check slug uniqueness
    const existing = await prisma.author.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json({ success: false, error: `Slug "${slug}" มีอยู่แล้วในระบบ กรุณาใช้ชื่ออื่น` }, { status: 400 });
    }

    const sameAs = Array.isArray(body.sameAs)
      ? body.sameAs.filter((u: any) => typeof u === 'string' && u.trim().length > 0)
      : typeof body.sameAs === 'string' && body.sameAs.trim()
      ? body.sameAs.split('\n').map((s: string) => s.trim()).filter(Boolean)
      : [];

    const author = await prisma.author.create({
      data: {
        name,
        slug,
        role: body.role ? body.role.trim() : null,
        credentials: body.credentials ? body.credentials.trim() : null,
        bio: body.bio ? body.bio.trim() : null,
        profileImage: body.profileImage ? body.profileImage.trim() : null,
        sameAs: sameAs.length > 0 ? sameAs : undefined,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
      },
      include: {
        _count: {
          select: {
            authoredArticles: true,
            reviewedArticles: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: author,
      message: `เพิ่มข้อมูลผู้เขียน "${author.name}" สำเร็จเรียบร้อยแล้ว`,
    });
  } catch (error) {
    console.error('Error creating author:', error);
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูลผู้เขียน' }, { status: 500 });
  }
}
