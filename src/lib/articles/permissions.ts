import { AdminSessionUser } from '@/lib/auth';

export const ARTICLE_PERMISSIONS = {
  VIEW: 'article:view',
  CREATE: 'article:create',
  EDIT: 'article:edit',
  REVIEW: 'article:review',
  PUBLISH: 'article:publish',
  ARCHIVE: 'article:archive',
  DELETE: 'article:delete',
} as const;

export type ArticlePermission = (typeof ARTICLE_PERMISSIONS)[keyof typeof ARTICLE_PERMISSIONS];

/**
 * Check if the authenticated admin user has the required permission
 * Super Admins with wildcard '*' automatically have all permissions.
 */
export function hasArticlePermission(
  user: AdminSessionUser | null,
  permission: ArticlePermission | string
): boolean {
  if (!user || !user.permissions) return false;
  if (user.permissions.includes('*')) return true;
  return user.permissions.includes(permission);
}
