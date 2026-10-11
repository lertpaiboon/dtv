import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { hasArticlePermission, ARTICLE_PERMISSIONS } from '@/lib/articles/permissions';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/articles/validation';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasArticlePermission(session, ARTICLE_PERMISSIONS.VIEW)) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const authorId = parseInt(id, 10);
  if (isNaN(authorId)) {
    return NextResponse.json({ success: false, error: 'รหัสผู้เขียนไม่ถูกต้อง' }, { status: 400 });
  }

  try {
    const author = await prisma.author.findUnique({
      where: { id: authorId },
      include: {
        _count: {
          select: {
            authoredArticles: true,
            reviewedArticles: true,
          },
        },
      },
    });

    if (!author) {
      return NextResponse.json({ success: false, error: 'ไม่พบข้อมูลผู้เขียน' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: author });
  } catch (error) {
    console.error('Error fetching author detail:', error);
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาดในการโหลดข้อมูลผู้เขียน' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasArticlePermission(session, ARTICLE_PERMISSIONS.EDIT)) {
    return NextResponse.json({ success: false, error: 'Forbidden: ไม่มีสิทธิ์แก้ไขข้อมูลผู้เขียน' }, { status: 403 });
  }

  const { id } = await params;
  const authorId = parseInt(id, 10);
  if (isNaN(authorId)) {
    return NextResponse.json({ success: false, error: 'รหัสผู้เขียนไม่ถูกต้อง' }, { status: 400 });
  }

  try {
    const existing = await prisma.author.findUnique({
      where: { id: authorId },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'ไม่พบข้อมูลผู้เขียนที่ต้องการแก้ไข' }, { status: 404 });
    }

    const body = await req.json();
    const name = (body.name || existing.name).trim();
    let slug = (body.slug || existing.slug).trim();
    slug = slugify(slug);

    if (!name) {
      return NextResponse.json({ success: false, error: 'กรุณาระบุชื่อผู้เขียน' }, { status: 400 });
    }

    // Check slug uniqueness if changed
    if (slug !== existing.slug) {
      const duplicate = await prisma.author.findUnique({
        where: { slug },
        select: { id: true },
      });
      if (duplicate && duplicate.id !== authorId) {
        return NextResponse.json({ success: false, error: `Slug "${slug}" มีอยู่แล้วในระบบ` }, { status: 400 });
      }
    }

    const sameAs = Array.isArray(body.sameAs)
      ? body.sameAs.filter((u: any) => typeof u === 'string' && u.trim().length > 0)
      : typeof body.sameAs === 'string'
      ? body.sameAs.split('\n').map((s: string) => s.trim()).filter(Boolean)
      : existing.sameAs;

    const updated = await prisma.author.update({
      where: { id: authorId },
      data: {
        name,
        slug,
        role: body.role !== undefined ? (body.role ? body.role.trim() : null) : existing.role,
        credentials: body.credentials !== undefined ? (body.credentials ? body.credentials.trim() : null) : existing.credentials,
        bio: body.bio !== undefined ? (body.bio ? body.bio.trim() : null) : existing.bio,
        profileImage: body.profileImage !== undefined ? (body.profileImage ? body.profileImage.trim() : null) : existing.profileImage,
        sameAs: sameAs !== undefined ? sameAs : existing.sameAs,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : existing.isActive,
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
      data: updated,
      message: `บันทึกข้อมูลผู้เขียน "${updated.name}" เรียบร้อยแล้ว`,
    });
  } catch (error) {
    console.error('Error updating author:', error);
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูลผู้เขียน' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasArticlePermission(session, ARTICLE_PERMISSIONS.DELETE)) {
    return NextResponse.json({ success: false, error: 'Forbidden: ไม่มีสิทธิ์ลบข้อมูลผู้เขียน' }, { status: 403 });
  }

  const { id } = await params;
  const authorId = parseInt(id, 10);
  if (isNaN(authorId)) {
    return NextResponse.json({ success: false, error: 'รหัสผู้เขียนไม่ถูกต้อง' }, { status: 400 });
  }

  try {
    const author = await prisma.author.findUnique({
      where: { id: authorId },
      include: {
        _count: {
          select: {
            authoredArticles: true,
            reviewedArticles: true,
          },
        },
      },
    });

    if (!author) {
      return NextResponse.json({ success: false, error: 'ไม่พบข้อมูลผู้เขียน' }, { status: 404 });
    }

    const totalArticles = author._count.authoredArticles + author._count.reviewedArticles;

    // If author has linked articles, don't hard delete to preserve data integrity; deactivate instead
    if (totalArticles > 0) {
      await prisma.author.update({
        where: { id: authorId },
        data: { isActive: false },
      });

      return NextResponse.json({
        success: true,
        message: `ผู้เขียน "${author.name}" มีบทความที่เกี่ยวข้องจำนวน ${totalArticles} บทความ จึงเปลี่ยนสถานะเป็น "ปิดใช้งาน (Inactive)" แทนการลบถาวร`,
      });
    }

    // Hard delete if 0 articles
    await prisma.author.delete({ where: { id: authorId } });

    return NextResponse.json({
      success: true,
      message: `ลบข้อมูลผู้เขียน "${author.name}" เรียบร้อยแล้ว`,
    });
  } catch (error) {
    console.error('Error deleting author:', error);
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาดในการลบข้อมูลผู้เขียน' }, { status: 500 });
  }
}
