import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getAdminSession } from '@/lib/auth';
import { hasArticlePermission, ARTICLE_PERMISSIONS } from '@/lib/articles/permissions';
import { prisma } from '@/lib/prisma';
import { defaultCustomerReviews } from '@/lib/default-content';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasArticlePermission(session, ARTICLE_PERMISSIONS.VIEW)) {
    return NextResponse.json({ success: false, error: 'Forbidden: ไม่มีสิทธิ์ดูข้อมูลรีวิวลูกค้า' }, { status: 403 });
  }

  try {
    const reviews = await prisma.customerReview.findMany({
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });

    return NextResponse.json({ success: true, data: reviews });
  } catch (error) {
    console.error('Error fetching customer reviews:', error);
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาดในการโหลดข้อมูลรีวิวลูกค้า' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const canCreate = hasArticlePermission(session, ARTICLE_PERMISSIONS.CREATE) || hasArticlePermission(session, ARTICLE_PERMISSIONS.EDIT);
  if (!canCreate) {
    return NextResponse.json({ success: false, error: 'Forbidden: ไม่มีสิทธิ์เพิ่มรีวิวลูกค้า' }, { status: 403 });
  }

  try {
    const body = await req.json();

    if (body.action === 'seed_defaults') {
      const count = await prisma.customerReview.count();
      if (count > 0) {
        return NextResponse.json({
          success: false,
          error: 'มีข้อมูลรีวิวอยู่ในฐานข้อมูลแล้ว',
        }, { status: 400 });
      }

      await prisma.customerReview.createMany({
        data: defaultCustomerReviews.map((r, idx) => ({
          headline: r.headline,
          quote: r.quote,
          authorName: r.authorName,
          authorImage: r.authorImage ?? null,
          companyName: r.companyName ?? null,
          businessType: r.businessType ?? null,
          rating: r.rating ?? 5,
          sourceUrl: r.sourceUrl ?? null,
          sortOrder: r.sortOrder ?? idx + 1,
          isActive: r.isActive ?? true,
        })),
      });

      revalidatePath('/');
      const seeded = await prisma.customerReview.findMany({
        orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      });

      return NextResponse.json({
        success: true,
        data: seeded,
        message: 'นำเข้าข้อมูลรีวิวเริ่มต้นลงฐานข้อมูลเรียบร้อยแล้ว',
      });
    }

    const headline = (body.headline || '').trim();
    const quote = (body.quote || '').trim();
    const authorName = (body.authorName || '').trim();

    if (!headline) {
      return NextResponse.json({ success: false, error: 'กรุณาระบุพาดหัวรีวิว (Headline)' }, { status: 400 });
    }
    if (!quote) {
      return NextResponse.json({ success: false, error: 'กรุณาระบุเนื้อหารีวิว (Quote)' }, { status: 400 });
    }
    if (!authorName) {
      return NextResponse.json({ success: false, error: 'กรุณาระบุชื่อผู้รีวิว (Author Name)' }, { status: 400 });
    }

    const parsedRating = Number(body.rating);
    const rating = Number.isFinite(parsedRating) ? Math.min(5, Math.max(1, Math.round(parsedRating))) : 5;
    const parsedSortOrder = Number(body.sortOrder);
    const sortOrder = Number.isFinite(parsedSortOrder) ? Math.round(parsedSortOrder) : 0;

    const created = await prisma.customerReview.create({
      data: {
        headline,
        quote,
        authorName,
        authorImage: body.authorImage ? String(body.authorImage).trim() : null,
        companyName: body.companyName ? String(body.companyName).trim() : null,
        businessType: body.businessType ? String(body.businessType).trim() : null,
        rating,
        sourceUrl: body.sourceUrl ? String(body.sourceUrl).trim() : null,
        sortOrder,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
      },
    });

    revalidatePath('/');

    return NextResponse.json({
      success: true,
      data: created,
      message: `เพิ่มรีวิวจาก "${created.authorName}" เรียบร้อยแล้ว`,
    });
  } catch (error) {
    console.error('Error creating customer review:', error);
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูลรีวิวลูกค้า' }, { status: 500 });
  }
}
