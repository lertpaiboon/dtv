/**
 * Restricted Markdown & Sanitized HTML Parser / Content Extractors for Deethavorn Knowledge Hub
 * Parser-backed OWASP-hardened HTML sanitization tailored for Server & Client Components.
 */
import sanitizeHtml from 'sanitize-html';

export interface TocHeading {
  id: string;
  text: string;
  level: number;
}

export interface ContentLink {
  anchor: string;
  href: string;
}

export interface HeadingTextGroups {
  h1: string[];
  h2: string[];
  h3: string[];
}

// Generate URL-friendly, stable anchor slug from Thai and English text
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\u0E00-\u0E7Fa-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-f]+);?/gi, (_, hex) => {
      const code = parseInt(hex, 16);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : '';
    })
    .replace(/&#(\d+);?/g, (_, dec) => {
      const code = parseInt(dec, 10);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : '';
    })
    .replace(/&(nbsp|amp|lt|gt|quot|apos);/gi, (match, name) => {
      switch (name.toLowerCase()) {
        case 'nbsp':
          return ' ';
        case 'amp':
          return '&';
        case 'lt':
          return '<';
        case 'gt':
          return '>';
        case 'quot':
          return '"';
        case 'apos':
          return "'";
        default:
          return match;
      }
    });
}

function escapeHtmlAttr(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Detect whether article body content is written in HTML rather than Markdown.
 */
export function isHtmlContent(content: string): boolean {
  const trimmed = (content || '').trim();
  if (!trimmed) return false;

  if (
    /^<!--/.test(trimmed) ||
    /^<(?:div|section|article|aside|header|main|p|h[1-6]|ul|ol|table|blockquote|figure|details|hr)\b[^>]*>/i.test(
      trimmed
    )
  ) {
    return true;
  }

  const closingBlockTags =
    trimmed.match(
      /<\/(?:div|p|h[1-6]|ul|ol|li|table|thead|tbody|tr|th|td|blockquote|section|article|figure|details)>/gi
    ) || [];
  if (closingBlockTags.length < 2) {
    return false;
  }

  const htmlBlockTagCount = (
    trimmed.match(
      /<\/?(?:div|section|article|aside|p|h[1-6]|ul|ol|li|table|thead|tbody|tr|th|td|blockquote|figure|details)\b/gi
    ) || []
  ).length;
  const mdHeadingCount = (trimmed.match(/^#{2,4}\s+/gm) || []).length;

  return htmlBlockTagCount > mdHeadingCount;
}

/**
 * Detect whether an HTML article already embeds its own Table of Contents block
 * so the site does not render a duplicate TOC above the body.
 */
export function hasEmbeddedToc(content: string): boolean {
  if (!isHtmlContent(content)) return false;

  if (/<!--[^>]*(?:สารบัญ|table\s+of\s+contents|\btoc\b)[^>]*-->/i.test(content)) {
    return true;
  }

  const topSlice = content.slice(0, Math.max(1500, Math.floor(content.length * 0.45)));
  const anchorLinksInTop = topSlice.match(/href\s*=\s*["']#[^"']+["']/gi) || [];

  const hasTocLabelInTop = /(?:<h[2-4]|<p|<strong|<b)[^>]*>[\s\S]{0,80}(?:สารบัญ|table\s+of\s+contents)/i.test(
    topSlice
  );
  if (hasTocLabelInTop && anchorLinksInTop.length >= 2) {
    return true;
  }

  const first40Slice = content.slice(0, Math.max(1200, Math.floor(content.length * 0.4)));
  const listMatches = first40Slice.match(/<(?:ol|ul)\b[^>]*>[\s\S]*?<\/(?:ol|ul)>/gi) || [];
  for (const listHtml of listMatches) {
    const anchorsInsideList = listHtml.match(/href\s*=\s*["']#[^"']+["']/gi) || [];
    if (anchorsInsideList.length >= 2) {
      return true;
    }
  }

  return false;
}

/**
 * Extract H2 and H3 headings for the Table of Contents (TOC)
 */
export function extractHeadings(markdown: string): TocHeading[] {
  const headings: TocHeading[] = [];

  if (isHtmlContent(markdown)) {
    const clean = markdown
      .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '');
    const headingRe = /<h([23])\b([^>]*)>([\s\S]*?)<\/h\1>/gi;
    let match: RegExpExecArray | null;
    while ((match = headingRe.exec(clean)) !== null) {
      const level = Number(match[1]);
      const attrs = match[2] || '';
      const rawInner = match[3] || '';
      const cleanText = decodeHtmlEntities(rawInner.replace(/<[^>]*>/g, ''))
        .replace(/\s+/g, ' ')
        .trim();
      if (!cleanText) continue;

      const idMatch = attrs.match(/\bid\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/i);
      const rawId = idMatch ? (idMatch[1] || idMatch[2] || idMatch[3] || '').trim() : '';
      const safeId =
        rawId && /^[a-zA-Z0-9_\-\u0E00-\u0E7F]+$/.test(rawId)
          ? rawId
          : slugifyHeading(cleanText) || `heading-${headings.length + 1}`;
      headings.push({ id: safeId, text: cleanText, level });
    }
    return headings;
  }

  const lines = markdown.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    const match = trimmed.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const rawText = match[2].trim();
      // Remove any inline markdown formatting like bold or links for the TOC label
      const cleanText = rawText.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\[(.*?)\]\(.*?\)/g, '$1');
      const id = slugifyHeading(cleanText) || `heading-${headings.length + 1}`;
      headings.push({ id, text: cleanText, level });
    }
  }

  return headings;
}

/**
 * Sanitize and validate image URLs (only https, http, or local relative paths)
 */
export function sanitizeImageUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed || /[\s"'<>\\`\u0000-\u001F\u007F]/.test(trimmed)) {
    return '';
  }
  if (
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://') ||
    (trimmed.startsWith('/') && !trimmed.startsWith('//'))
  ) {
    return trimmed;
  }
  return '';
}

/**
 * Sanitize and validate external/internal link URLs
 */
function sanitizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed || /[\s"'<>\\`\u0000-\u001F\u007F]/.test(trimmed)) {
    return '#';
  }
  if (
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://') ||
    (trimmed.startsWith('/') && !trimmed.startsWith('//')) ||
    trimmed.startsWith('#') ||
    trimmed.startsWith('tel:') ||
    trimmed.startsWith('mailto:')
  ) {
    return trimmed;
  }
  return '#';
}

/**
 * Escape raw HTML to prevent XSS injection
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Parse inline markdown: bold, italic, code, images, links
 */
function parseInline(text: string): string {
  let res = escapeHtml(text);

  // Bold + Italic: ***text***
  res = res.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');

  // Bold: **text**
  res = res.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Italic: *text* or _text_
  res = res.replace(/(^|[^*])\*(?!\s)([^*]+?)\*(?!\*)/g, '$1<em>$2</em>');

  // Inline code: `code`
  res = res.replace(/`([^`]+)`/g, '<code class="article-code">$1</code>');

  // Inline images: ![alt](url)
  res = res.replace(/!\[(.*?)\]\((.+?)\)/g, (_, alt, url) => {
    const safeSrc = sanitizeImageUrl(url);
    if (!safeSrc) return '';
    return `<img src="${safeSrc}" alt="${alt}" class="article-inline-image" loading="lazy" decoding="async" />`;
  });

  // Links: [label](url)
  res = res.replace(/\[(.*?)\]\((.*?)\)/g, (_, label, url) => {
    const safeHref = sanitizeUrl(url);
    const isExternal = safeHref.startsWith('http');
    const rel = isExternal ? ' rel="noopener noreferrer" target="_blank"' : '';
    return `<a href="${safeHref}" class="article-link"${rel}>${label}</a>`;
  });

  return res;
}

const ALLOWED_CSS_PROPERTIES = new Set([
  'color',
  'background',
  'background-color',
  'font-weight',
  'font-style',
  'font-size',
  'line-height',
  'text-align',
  'text-decoration',
  'text-transform',
  'letter-spacing',
  'white-space',
  'word-break',
  'vertical-align',
  'margin',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'padding',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'border',
  'border-top',
  'border-right',
  'border-bottom',
  'border-left',
  'border-color',
  'border-width',
  'border-style',
  'border-radius',
  'border-collapse',
  'border-spacing',
  'box-shadow',
  'box-sizing',
  'width',
  'min-width',
  'max-width',
  'height',
  'min-height',
  'overflow',
  'overflow-x',
  'overflow-y',
  'list-style',
  'list-style-type',
  'list-style-position',
  'gap',
  'align-items',
  'justify-content',
  'flex-wrap',
  'grid-template-columns',
  'opacity',
  'display',
]);

const ALLOWED_HTML_TAGS = new Set([
  'div',
  'section',
  'article',
  'aside',
  'p',
  'br',
  'hr',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'del',
  'ins',
  'mark',
  'small',
  'sub',
  'sup',
  'span',
  'a',
  'ul',
  'ol',
  'li',
  'dl',
  'dt',
  'dd',
  'blockquote',
  'pre',
  'code',
  'table',
  'thead',
  'tbody',
  'tfoot',
  'tr',
  'th',
  'td',
  'caption',
  'colgroup',
  'col',
  'figure',
  'figcaption',
  'img',
  'details',
  'summary',
]);

const DANGEROUS_PAIRED_TAGS = [
  'script',
  'style',
  'iframe',
  'object',
  'embed',
  'svg',
  'math',
  'form',
  'noscript',
  'template',
  'textarea',
  'title',
];

const SAFE_REL_TOKENS = new Set(['noopener', 'noreferrer', 'nofollow', 'sponsored', 'ugc']);

function sanitizeInlineStyle(rawStyle: string): string {
  const decoded = decodeHtmlEntities(rawStyle).replace(/\/\*[\s\S]*?\*\//g, '');
  const declarations = decoded.split(';');
  const safeParts: string[] = [];

  for (const decl of declarations) {
    const colonIdx = decl.indexOf(':');
    if (colonIdx <= 0) continue;

    const prop = decl.slice(0, colonIdx).trim().toLowerCase();
    const val = decl.slice(colonIdx + 1).trim();
    if (!val || !ALLOWED_CSS_PROPERTIES.has(prop)) continue;

    if (
      /url\s*\(|expression\s*\(|javascript:|vbscript:|@import|behavior\s*:|-moz-binding|\\|[<>]/i.test(
        val
      )
    ) {
      continue;
    }

    if (
      prop === 'display' &&
      !/^(?:block|inline|inline-block|flex|inline-flex|grid|table|table-row|table-cell|none)$/i.test(
        val
      )
    ) {
      continue;
    }

    safeParts.push(`${prop}: ${val.replace(/\s+/g, ' ')}`);
  }

  return safeParts.join('; ');
}

function stripDangerousTagsAndComments(rawHtml: string): string {
  let html = rawHtml || '';
  let previous = '';
  // Strip comments first, then strip dangerous tags iteratively until fixed-point
  while (html !== previous) {
    previous = html;
    html = html.replace(/<!--[\s\S]*?-->/g, '').replace(/<!--[\s\S]*$/g, '');
    for (const tag of DANGEROUS_PAIRED_TAGS) {
      const pairedRe = new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}\\s*>`, 'gi');
      html = html.replace(pairedRe, '');
      const strayRe = new RegExp(`<\\/?${tag}\\b[^>]*>`, 'gi');
      html = html.replace(strayRe, '');
    }
  }
  return html;
}

function wrapBareHtmlTables(html: string): string {
  const tokenRe = /<\/?(?:div|table)\b[^>]*>/gi;
  const divStack: boolean[] = [];
  let tableDepth = 0;
  let openTableStart = -1;
  let shouldWrapCurrentTable = false;
  const regionsToWrap: Array<{ start: number; end: number }> = [];

  let match: RegExpExecArray | null;
  while ((match = tokenRe.exec(html)) !== null) {
    const tagStr = match[0];
    const lower = tagStr.toLowerCase();
    if (lower.startsWith('<div')) {
      const hasOverflow = /\bstyle\s*=\s*"[^"]*overflow-x\s*:/i.test(tagStr);
      divStack.push(hasOverflow);
    } else if (lower.startsWith('</div')) {
      if (divStack.length > 0) divStack.pop();
    } else if (lower.startsWith('<table')) {
      if (tableDepth === 0) {
        openTableStart = match.index;
        shouldWrapCurrentTable = !divStack.some(Boolean);
      }
      tableDepth += 1;
    } else if (lower.startsWith('</table')) {
      if (tableDepth > 0) {
        tableDepth -= 1;
        if (tableDepth === 0 && shouldWrapCurrentTable && openTableStart !== -1) {
          regionsToWrap.push({ start: openTableStart, end: match.index + tagStr.length });
          openTableStart = -1;
          shouldWrapCurrentTable = false;
        }
      }
    }
  }

  if (regionsToWrap.length === 0) return html;

  let result = '';
  let cursor = 0;
  for (const region of regionsToWrap) {
    result += html.slice(cursor, region.start);
    result += `<div class="article-html-table-wrap">${html.slice(region.start, region.end)}</div>`;
    cursor = region.end;
  }
  result += html.slice(cursor);
  return result;
}

const ALLOWED_HTML_TAG_LIST = Array.from(ALLOWED_HTML_TAGS);

/**
 * Sanitize raw HTML authored by the SEO team using strict parser-backed tag/attribute/CSS allowlists.
 */
export function sanitizeArticleHtml(rawHtml: string): string {
  let html = sanitizeHtml(rawHtml || '', {
    allowedTags: ALLOWED_HTML_TAG_LIST,
    disallowedTagsMode: 'discard',
    parseStyleAttributes: false,
    allowProtocolRelative: false,
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: {
      img: ['http', 'https'],
    },
    allowedAttributes: {
      '*': ['id', 'title', 'dir', 'lang', 'aria-label', 'style'],
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'width', 'height', 'loading', 'decoding'],
      th: ['colspan', 'rowspan', 'scope', 'align', 'valign'],
      td: ['colspan', 'rowspan', 'scope', 'align', 'valign'],
      col: ['span'],
      colgroup: ['span'],
      ol: ['start', 'type', 'reversed'],
      details: ['open'],
    },
    exclusiveFilter: (frame) => {
      if (frame.tag === 'img') {
        const src = typeof frame.attribs.src === 'string' ? frame.attribs.src.trim() : '';
        return !sanitizeImageUrl(src);
      }
      return false;
    },
    transformTags: {
      '*': (tagName, attribs) => {
        const nextAttribs: Record<string, string> = {};

        if (typeof attribs.id === 'string') {
          const cleanId = attribs.id.trim();
          if (cleanId && /^[a-zA-Z0-9_\-\u0E00-\u0E7F]+$/.test(cleanId)) {
            nextAttribs.id = cleanId;
          }
        }
        if (typeof attribs.title === 'string') {
          const cleanTitle = attribs.title.trim();
          if (cleanTitle) nextAttribs.title = cleanTitle;
        }
        if (typeof attribs.dir === 'string') {
          const cleanDir = attribs.dir.trim().toLowerCase();
          if (cleanDir === 'ltr' || cleanDir === 'rtl' || cleanDir === 'auto') {
            nextAttribs.dir = cleanDir;
          }
        }
        if (typeof attribs.lang === 'string') {
          const cleanLang = attribs.lang.trim();
          if (/^[a-zA-Z0-9-]+$/.test(cleanLang)) {
            nextAttribs.lang = cleanLang;
          }
        }
        if (typeof attribs['aria-label'] === 'string') {
          const cleanAria = attribs['aria-label'].trim();
          if (cleanAria) nextAttribs['aria-label'] = cleanAria;
        }
        if (typeof attribs.style === 'string') {
          const safeStyle = sanitizeInlineStyle(attribs.style);
          if (safeStyle) nextAttribs.style = safeStyle;
        }

        // Preserve tag-specific attributes validated by tag transformers so '*' doesn't drop them
        if (tagName === 'a') {
          if (attribs.href !== undefined) nextAttribs.href = attribs.href;
          if (attribs.target !== undefined) nextAttribs.target = attribs.target;
          if (attribs.rel !== undefined) nextAttribs.rel = attribs.rel;
        } else if (tagName === 'img') {
          if (attribs.src !== undefined) nextAttribs.src = attribs.src;
          if (attribs.alt !== undefined) nextAttribs.alt = attribs.alt;
          if (attribs.width !== undefined) nextAttribs.width = attribs.width;
          if (attribs.height !== undefined) nextAttribs.height = attribs.height;
          if (attribs.loading !== undefined) nextAttribs.loading = attribs.loading;
          if (attribs.decoding !== undefined) nextAttribs.decoding = attribs.decoding;
        } else if (tagName === 'th' || tagName === 'td') {
          if (attribs.colspan !== undefined) nextAttribs.colspan = attribs.colspan;
          if (attribs.rowspan !== undefined) nextAttribs.rowspan = attribs.rowspan;
          if (attribs.scope !== undefined) nextAttribs.scope = attribs.scope;
          if (attribs.align !== undefined) nextAttribs.align = attribs.align;
          if (attribs.valign !== undefined) nextAttribs.valign = attribs.valign;
        } else if (tagName === 'col' || tagName === 'colgroup') {
          if (attribs.span !== undefined) nextAttribs.span = attribs.span;
        } else if (tagName === 'ol') {
          if (attribs.start !== undefined) nextAttribs.start = attribs.start;
          if (attribs.type !== undefined) nextAttribs.type = attribs.type;
          if (attribs.reversed !== undefined) nextAttribs.reversed = attribs.reversed;
        } else if (tagName === 'details') {
          if (attribs.open !== undefined) nextAttribs.open = attribs.open;
        }

        return { tagName, attribs: nextAttribs };
      },
      // Keep single-H1 rule on article page by mapping author <h1> to <h2>
      h1: (_tagName, attribs) => ({
        tagName: 'h2',
        attribs,
      }),
      a: (_tagName, attribs) => {
        const next = { ...attribs };
        if (typeof next.href === 'string') {
          const rawHref = next.href.trim();
          const safeHref = sanitizeUrl(rawHref);
          if (rawHref === '#' || safeHref !== '#') {
            next.href = safeHref;
          } else {
            delete next.href;
          }
        }
        const isBlankTarget = typeof next.target === 'string' && next.target.trim().toLowerCase() === '_blank';
        if (isBlankTarget) {
          next.target = '_blank';
        } else {
          delete next.target;
        }
        const relTokens = new Set<string>();
        if (typeof next.rel === 'string') {
          for (const token of next.rel.trim().toLowerCase().split(/\s+/)) {
            if (SAFE_REL_TOKENS.has(token)) {
              relTokens.add(token);
            }
          }
        }
        if (isBlankTarget) {
          relTokens.add('noopener');
          relTokens.add('noreferrer');
        }
        if (relTokens.size > 0) {
          next.rel = Array.from(relTokens).join(' ');
        } else {
          delete next.rel;
        }
        return { tagName: 'a', attribs: next };
      },
      img: (_tagName, attribs) => {
        const next = { ...attribs };
        const safeSrc = typeof next.src === 'string' ? sanitizeImageUrl(next.src.trim()) : '';
        if (safeSrc) {
          next.src = safeSrc;
        } else {
          delete next.src;
        }
        if (typeof next.alt === 'string') {
          next.alt = next.alt.trim();
        }
        if (typeof next.width === 'string' && /^\d{1,5}(?:px|%)?$/i.test(next.width.trim())) {
          next.width = next.width.trim();
        } else {
          delete next.width;
        }
        if (typeof next.height === 'string' && /^\d{1,5}(?:px|%)?$/i.test(next.height.trim())) {
          next.height = next.height.trim();
        } else {
          delete next.height;
        }
        const loadingVal = typeof next.loading === 'string' ? next.loading.trim().toLowerCase() : '';
        next.loading = loadingVal === 'eager' ? 'eager' : 'lazy';
        next.decoding = 'async';
        return { tagName: 'img', attribs: next };
      },
      th: (tagName, attribs) => {
        const next = { ...attribs };
        if (!(typeof next.colspan === 'string' && /^[1-9]\d*$/.test(next.colspan.trim()))) {
          delete next.colspan;
        } else {
          next.colspan = next.colspan.trim();
        }
        if (!(typeof next.rowspan === 'string' && /^[1-9]\d*$/.test(next.rowspan.trim()))) {
          delete next.rowspan;
        } else {
          next.rowspan = next.rowspan.trim();
        }
        const scopeVal = typeof next.scope === 'string' ? next.scope.trim().toLowerCase() : '';
        if (['col', 'row', 'colgroup', 'rowgroup'].includes(scopeVal)) next.scope = scopeVal;
        else delete next.scope;
        const alignVal = typeof next.align === 'string' ? next.align.trim().toLowerCase() : '';
        if (['left', 'center', 'right'].includes(alignVal)) next.align = alignVal;
        else delete next.align;
        const valignVal = typeof next.valign === 'string' ? next.valign.trim().toLowerCase() : '';
        if (['top', 'middle', 'bottom'].includes(valignVal)) next.valign = valignVal;
        else delete next.valign;
        return { tagName, attribs: next };
      },
      td: (tagName, attribs) => {
        const next = { ...attribs };
        if (!(typeof next.colspan === 'string' && /^[1-9]\d*$/.test(next.colspan.trim()))) {
          delete next.colspan;
        } else {
          next.colspan = next.colspan.trim();
        }
        if (!(typeof next.rowspan === 'string' && /^[1-9]\d*$/.test(next.rowspan.trim()))) {
          delete next.rowspan;
        } else {
          next.rowspan = next.rowspan.trim();
        }
        const scopeVal = typeof next.scope === 'string' ? next.scope.trim().toLowerCase() : '';
        if (['col', 'row', 'colgroup', 'rowgroup'].includes(scopeVal)) next.scope = scopeVal;
        else delete next.scope;
        const alignVal = typeof next.align === 'string' ? next.align.trim().toLowerCase() : '';
        if (['left', 'center', 'right'].includes(alignVal)) next.align = alignVal;
        else delete next.align;
        const valignVal = typeof next.valign === 'string' ? next.valign.trim().toLowerCase() : '';
        if (['top', 'middle', 'bottom'].includes(valignVal)) next.valign = valignVal;
        else delete next.valign;
        return { tagName, attribs: next };
      },
      col: (tagName, attribs) => {
        const next = { ...attribs };
        if (typeof next.span === 'string' && /^[1-9]\d*$/.test(next.span.trim())) {
          next.span = next.span.trim();
        } else {
          delete next.span;
        }
        return { tagName, attribs: next };
      },
      colgroup: (tagName, attribs) => {
        const next = { ...attribs };
        if (typeof next.span === 'string' && /^[1-9]\d*$/.test(next.span.trim())) {
          next.span = next.span.trim();
        } else {
          delete next.span;
        }
        return { tagName, attribs: next };
      },
      ol: (_tagName, attribs) => {
        const next = { ...attribs };
        if (typeof next.start === 'string' && /^-?\d+$/.test(next.start.trim())) {
          next.start = next.start.trim();
        } else {
          delete next.start;
        }
        const typeVal = typeof next.type === 'string' ? next.type.trim() : '';
        if (['1', 'a', 'A', 'i', 'I'].includes(typeVal)) next.type = typeVal;
        else delete next.type;
        if (next.reversed !== undefined) next.reversed = '';
        return { tagName: 'ol', attribs: next };
      },
      details: (_tagName, attribs) => {
        const next = { ...attribs };
        if (next.open !== undefined) next.open = '';
        return { tagName: 'details', attribs: next };
      },
    },
  });

  // Ensure every H2/H3/H4 has an anchor id for Table of Contents navigation
  let autoHeadingIdx = 0;
  html = html.replace(/<h([234])\b([^>]*)>([\s\S]*?)<\/h\1>/gi, (full, level, attrs, inner) => {
    autoHeadingIdx += 1;
    if (/\bid\s*=\s*["'][^"']+["']/i.test(attrs)) {
      return full;
    }
    const plainText = decodeHtmlEntities(inner.replace(/<[^>]*>/g, '')).trim();
    const id = slugifyHeading(plainText) || `section-${autoHeadingIdx}`;
    return `<h${level} id="${escapeHtmlAttr(id)}"${attrs}>${inner}</h${level}>`;
  });

  return wrapBareHtmlTables(html);
}

/**
 * Strip either Markdown or HTML content down to readable plain text for word count & SEO keyword analysis.
 */
export function stripContentToPlainText(content: string): string {
  const raw = content || '';
  if (!raw.trim()) return '';

  if (isHtmlContent(raw)) {
    const withoutDanger = stripDangerousTagsAndComments(raw);
    const withLineBreaks = withoutDanger
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(?:p|div|section|article|aside|h[1-6]|li|tr|blockquote|figure|figcaption)>/gi, '\n')
      .replace(/<\/(?:th|td)>/gi, ' ');
    const stripped = decodeHtmlEntities(withLineBreaks.replace(/<[^>]*>/g, ' '));
    return stripped.replace(/[ \t]+/g, ' ').replace(/\n\s+/g, '\n').trim();
  }

  return raw
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/^\s*>\s+/gm, '')
    .replace(/\|/g, ' ')
    .trim();
}

/**
 * Extract H1, H2, and H3 plain heading strings from either HTML or Markdown content.
 */
export function extractAllHeadingTexts(content: string): HeadingTextGroups {
  const groups: HeadingTextGroups = { h1: [], h2: [], h3: [] };
  const raw = content || '';
  if (!raw.trim()) return groups;

  if (isHtmlContent(raw)) {
    const clean = stripDangerousTagsAndComments(raw);
    const re = /<h([123])\b[^>]*>([\s\S]*?)<\/h\1>/gi;
    let match: RegExpExecArray | null;
    while ((match = re.exec(clean)) !== null) {
      const level = match[1];
      const text = decodeHtmlEntities(match[2].replace(/<[^>]*>/g, ''))
        .replace(/\s+/g, ' ')
        .trim();
      if (!text) continue;
      if (level === '1') groups.h1.push(text);
      else if (level === '2') groups.h2.push(text);
      else if (level === '3') groups.h3.push(text);
    }
    return groups;
  }

  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    const m = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (!m) continue;
    const text = m[2].replace(/\*\*(.*?)\*\*/g, '$1').replace(/\[(.*?)\]\(.*?\)/g, '$1').trim();
    if (!text) continue;
    if (m[1].length === 1) groups.h1.push(text);
    else if (m[1].length === 2) groups.h2.push(text);
    else if (m[1].length === 3) groups.h3.push(text);
  }

  return groups;
}

/**
 * Extract links (anchor text + href) from either HTML or Markdown content.
 */
export function extractContentLinks(content: string): ContentLink[] {
  const links: ContentLink[] = [];
  const raw = content || '';
  if (!raw.trim()) return links;

  if (isHtmlContent(raw)) {
    const clean = stripDangerousTagsAndComments(raw);
    const linkRe = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
    let match: RegExpExecArray | null;
    while ((match = linkRe.exec(clean)) !== null) {
      const attrs = match[1] || '';
      const hrefMatch = attrs.match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/i);
      if (!hrefMatch) continue;
      const href = decodeHtmlEntities(hrefMatch[1] || hrefMatch[2] || hrefMatch[3] || '').trim();
      if (!href) continue;
      const anchor = decodeHtmlEntities(match[2].replace(/<[^>]*>/g, ''))
        .replace(/\s+/g, ' ')
        .trim();
      links.push({ anchor, href });
    }
    return links;
  }

  const mdLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match: RegExpExecArray | null;
  while ((match = mdLinkRegex.exec(raw)) !== null) {
    if (match.index > 0 && raw[match.index - 1] === '!') {
      continue;
    }
    links.push({
      anchor: match[1].trim(),
      href: match[2].trim(),
    });
  }

  return links;
}

/**
 * Extract image alt texts from either HTML or Markdown content.
 */
export function extractContentImageAlts(content: string): string[] {
  const alts: string[] = [];
  const raw = content || '';
  if (!raw.trim()) return alts;

  if (isHtmlContent(raw)) {
    const clean = stripDangerousTagsAndComments(raw);
    const imgRe = /<img\b([^>]*)>/gi;
    let match: RegExpExecArray | null;
    while ((match = imgRe.exec(clean)) !== null) {
      const attrs = match[1] || '';
      const altMatch = attrs.match(/\balt\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/i);
      if (!altMatch) continue;
      const alt = decodeHtmlEntities(altMatch[1] || altMatch[2] || altMatch[3] || '').trim();
      if (alt) alts.push(alt);
    }
    return alts;
  }

  for (const match of raw.matchAll(/!\[(.*?)\]\((.+?)\)/g)) {
    const alt = match[1].trim();
    if (alt) alts.push(alt);
  }

  return alts;
}

/**
 * Convert sanitized HTML article bodies into clean Markdown/text for /llms-full.txt.
 */
export function convertHtmlToCleanLlmText(content: string): string {
  const raw = (content || '').trim();
  if (!raw) return '';
  if (!isHtmlContent(raw)) return raw;

  let text = sanitizeArticleHtml(raw);

  text = text
    .replace(/<h[12]\b[^>]*>([\s\S]*?)<\/h[12]>/gi, '\n\n## $1\n\n')
    .replace(/<h3\b[^>]*>([\s\S]*?)<\/h3>/gi, '\n\n### $1\n\n')
    .replace(/<h[4-6]\b[^>]*>([\s\S]*?)<\/h[4-6]>/gi, '\n\n#### $1\n\n')
    .replace(/<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, label) => {
      const cleanLabel = label.replace(/<[^>]*>/g, '').trim();
      return cleanLabel ? `[${cleanLabel}](${href})` : href;
    })
    .replace(/<img\b[^>]*alt="([^"]*)"[^>]*>/gi, (_, alt) => {
      const cleanAlt = alt.trim();
      return cleanAlt ? `[Image: ${cleanAlt}]` : '';
    })
    .replace(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi, (_, rowHtml) => {
      const cells: string[] = [];
      const cellRe = /<t[hd]\b[^>]*>([\s\S]*?)<\/t[hd]>/gi;
      let cellMatch: RegExpExecArray | null;
      while ((cellMatch = cellRe.exec(rowHtml)) !== null) {
        cells.push(cellMatch[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());
      }
      return cells.length > 0 ? `\n| ${cells.join(' | ')} |` : '';
    })
    .replace(/<li\b[^>]*>([\s\S]*?)<\/li>/gi, (_, itemHtml) => {
      const cleanItem = itemHtml.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      return cleanItem ? `\n- ${cleanItem}` : '';
    })
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<hr\s*\/?>/gi, '\n\n---\n\n')
    .replace(/<\/(?:p|div|section|article|aside|blockquote|figure|figcaption|ul|ol|table)>/gi, '\n\n');

  text = decodeHtmlEntities(text.replace(/<[^>]*>/g, ''));

  return text
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Render Markdown or Sanitized HTML text into secure, structured semantic HTML
 */
export function renderMarkdownToHtml(markdown: string): string {
  if (isHtmlContent(markdown)) {
    return sanitizeArticleHtml(markdown);
  }

  const lines = markdown.split('\n');
  const htmlParts: string[] = [];

  let inList = false;
  let listType: 'ul' | 'ol' = 'ul';
  let inTable = false;
  let tableHeaderParsed = false;
  let inBlockquote = false;
  let blockquoteLines: string[] = [];

  const closeList = () => {
    if (inList) {
      htmlParts.push(`</${listType}>`);
      inList = false;
    }
  };

  const closeTable = () => {
    if (inTable) {
      htmlParts.push('</tbody></table></div>');
      inTable = false;
      tableHeaderParsed = false;
    }
  };

  const closeBlockquote = () => {
    if (inBlockquote) {
      htmlParts.push(`<blockquote class="article-quote">${blockquoteLines.join('<br />')}</blockquote>`);
      inBlockquote = false;
      blockquoteLines = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // 1. Empty lines
    if (!line) {
      closeList();
      closeTable();
      closeBlockquote();
      continue;
    }

    // 2. Standalone Semantic Image: ![alt text](url)
    const imageMatch = line.match(/^!\[(.*?)\]\((.+?)\)$/);
    if (imageMatch) {
      closeList();
      closeTable();
      closeBlockquote();
      const altText = imageMatch[1].trim();
      const rawUrl = imageMatch[2].trim();
      const safeSrc = sanitizeImageUrl(rawUrl);
      if (safeSrc) {
        const cleanSrc = escapeHtml(safeSrc);
        const cleanAlt = escapeHtml(altText);
        htmlParts.push(
          `<figure class="article-figure">` +
            `<div class="article-image-wrap">` +
              `<img src="${cleanSrc}" alt="${cleanAlt}" class="article-image" loading="lazy" decoding="async" />` +
            `</div>` +
            (cleanAlt ? `<figcaption class="article-figcaption">${cleanAlt}</figcaption>` : '') +
          `</figure>`
        );
      }
      continue;
    }

    // 3. Blockquote
    if (line.startsWith('>')) {
      closeList();
      closeTable();
      inBlockquote = true;
      const quoteText = line.replace(/^>\s?/, '');
      blockquoteLines.push(parseInline(quoteText));
      continue;
    } else {
      closeBlockquote();
    }

    // 4. Headings (H2, H3, H4)
    const headingMatch = line.match(/^(#{2,4})\s+(.+)$/);
    if (headingMatch) {
      closeList();
      closeTable();
      const level = headingMatch[1].length;
      const text = headingMatch[2].trim();
      const cleanLabel = text.replace(/\*\*(.*?)\*\*/g, '$1');
      const id = slugifyHeading(cleanLabel) || `section-${i}`;
      htmlParts.push(
        `<h${level} id="${id}" class="article-heading article-heading--h${level}">${parseInline(text)}</h${level}>`
      );
      continue;
    }

    // 4. Tables
    if (line.startsWith('|') && line.endsWith('|')) {
      closeList();
      const cells = line
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim());

      // Check if it's the separator row: | --- | :--- | ---: |
      if (cells.every((c) => /^:?-+:?$/.test(c))) {
        // Table header divider
        tableHeaderParsed = true;
        continue;
      }

      if (!inTable) {
        inTable = true;
        tableHeaderParsed = false;
        htmlParts.push('<div class="article-table-wrap"><table class="article-table"><thead><tr>');
        for (const headerCell of cells) {
          htmlParts.push(`<th>${parseInline(headerCell)}</th>`);
        }
        htmlParts.push('</tr></thead><tbody>');
      } else {
        htmlParts.push('<tr>');
        for (const dataCell of cells) {
          htmlParts.push(`<td>${parseInline(dataCell)}</td>`);
        }
        htmlParts.push('</tr>');
      }
      continue;
    } else {
      closeTable();
    }

    // 5. Unordered Lists (- or *)
    const ulMatch = line.match(/^[-*]\s+(.+)$/);
    if (ulMatch) {
      closeTable();
      if (!inList || listType !== 'ul') {
        closeList();
        inList = true;
        listType = 'ul';
        htmlParts.push('<ul class="article-list article-list--bullet">');
      }
      htmlParts.push(`<li>${parseInline(ulMatch[1])}</li>`);
      continue;
    }

    // 6. Ordered Lists (1., 2., etc.)
    const olMatch = line.match(/^(\d+)\.\s+(.+)$/);
    if (olMatch) {
      closeTable();
      if (!inList || listType !== 'ol') {
        closeList();
        inList = true;
        listType = 'ol';
        htmlParts.push('<ol class="article-list article-list--numbered">');
      }
      htmlParts.push(`<li>${parseInline(olMatch[2])}</li>`);
      continue;
    }

    // 7. Regular Paragraph
    closeList();
    closeTable();
    htmlParts.push(`<p class="article-paragraph">${parseInline(line)}</p>`);
  }

  // Final flushes
  closeList();
  closeTable();
  closeBlockquote();

  return htmlParts.join('\n');
}
