import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getAdminSession } from '@/lib/auth';
import { hasArticlePermission, ARTICLE_PERMISSIONS } from '@/lib/articles/permissions';
import { prisma } from '@/lib/prisma';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const canEdit = hasArticlePermission(session, ARTICLE_PERMISSIONS.EDIT) || hasArticlePermission(session, ARTICLE_PERMISSIONS.CREATE);
  if (!canEdit) {
    return NextResponse.json({ success: false, error: 'Forbidden: ไม่มีสิทธิ์แก้ไขรีวิวลูกค้า' }, { status: 403 });
  }

  const { id } = await params;
  const reviewId = parseInt(id, 10);
  if (isNaN(reviewId)) {
    return NextResponse.json({ success: false, error: 'รหัสรีวิวไม่ถูกต้อง' }, { status: 400 });
  }

  try {
    const existing = await prisma.customerReview.findUnique({
      where: { id: reviewId },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'ไม่พบข้อมูลรีวิวที่ต้องการแก้ไข' }, { status: 404 });
    }

    const body = await req.json();
    const headline = body.headline !== undefined ? String(body.headline).trim() : existing.headline;
    const quote = body.quote !== undefined ? String(body.quote).trim() : existing.quote;
    const authorName = body.authorName !== undefined ? String(body.authorName).trim() : existing.authorName;

    if (!headline) {
      return NextResponse.json({ success: false, error: 'กรุณาระบุพาดหัวรีวิว (Headline)' }, { status: 400 });
    }
    if (!quote) {
      return NextResponse.json({ success: false, error: 'กรุณาระบุเนื้อหารีวิว (Quote)' }, { status: 400 });
    }
    if (!authorName) {
      return NextResponse.json({ success: false, error: 'กรุณาระบุชื่อผู้รีวิว (Author Name)' }, { status: 400 });
    }

    const parsedRating = body.rating !== undefined ? Number(body.rating) : existing.rating;
    const rating = Number.isFinite(parsedRating) ? Math.min(5, Math.max(1, Math.round(parsedRating))) : existing.rating;

    const parsedSortOrder = body.sortOrder !== undefined ? Number(body.sortOrder) : existing.sortOrder;
    const sortOrder = Number.isFinite(parsedSortOrder) ? Math.round(parsedSortOrder) : existing.sortOrder;

    const updated = await prisma.customerReview.update({
      where: { id: reviewId },
      data: {
        headline,
        quote,
        authorName,
        authorImage:
          body.authorImage !== undefined
            ? body.authorImage
              ? String(body.authorImage).trim()
              : null
            : existing.authorImage,
        companyName:
          body.companyName !== undefined
            ? body.companyName
              ? String(body.companyName).trim()
              : null
            : existing.companyName,
        businessType:
          body.businessType !== undefined
            ? body.businessType
              ? String(body.businessType).trim()
              : null
            : existing.businessType,
        rating,
        sourceUrl:
          body.sourceUrl !== undefined
            ? body.sourceUrl
              ? String(body.sourceUrl).trim()
              : null
            : existing.sourceUrl,
        sortOrder,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : existing.isActive,
      },
    });

    revalidatePath('/');

    return NextResponse.json({
      success: true,
      data: updated,
      message: `อัปเดตรีวิวจาก "${updated.authorName}" เรียบร้อยแล้ว`,
    });
  } catch (error) {
    console.error('Error updating customer review:', error);
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูลรีวิวลูกค้า' }, { status: 500 });
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

  const canDelete = hasArticlePermission(session, ARTICLE_PERMISSIONS.DELETE) || hasArticlePermission(session, ARTICLE_PERMISSIONS.EDIT);
  if (!canDelete) {
    return NextResponse.json({ success: false, error: 'Forbidden: ไม่มีสิทธิ์ลบรีวิวลูกค้า' }, { status: 403 });
  }

  const { id } = await params;
  const reviewId = parseInt(id, 10);
  if (isNaN(reviewId)) {
    return NextResponse.json({ success: false, error: 'รหัสรีวิวไม่ถูกต้อง' }, { status: 400 });
  }

  try {
    const existing = await prisma.customerReview.findUnique({
      where: { id: reviewId },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'ไม่พบข้อมูลรีวิวที่ต้องการลบ' }, { status: 404 });
    }

    await prisma.customerReview.delete({
      where: { id: reviewId },
    });

    revalidatePath('/');

    return NextResponse.json({
      success: true,
      message: `ลบรีวิวจาก "${existing.authorName}" เรียบร้อยแล้ว`,
    });
  } catch (error) {
    console.error('Error deleting customer review:', error);
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาดในการลบข้อมูลรีวิวลูกค้า' }, { status: 500 });
  }
}
