/**
 * Restricted Markdown Parser & Heading Extractor for Deethavorn Knowledge Hub
 * Zero-dependency, fast, secure HTML sanitization tailored for Server Components.
 */

export interface TocHeading {
  id: string;
  text: string;
  level: number;
}

// Generate URL-friendly, stable anchor slug from Thai and English text
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\u0E00-\u0E7Fa-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/**
 * Extract H2 and H3 headings for the Table of Contents (TOC)
 */
export function extractHeadings(markdown: string): TocHeading[] {
  const headings: TocHeading[] = [];
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

/**
 * Render Markdown text into secure, structured semantic HTML
 */
export function renderMarkdownToHtml(markdown: string): string {
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
        const cleanAlt = escapeHtml(altText);
        htmlParts.push(
          `<figure class="article-figure">` +
            `<div class="article-image-wrap">` +
              `<img src="${safeSrc}" alt="${cleanAlt}" class="article-image" loading="lazy" decoding="async" />` +
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
        `<h${level} id="${id}" class="article-heading article-heading--h${level}"><a href="#${id}" class="heading-anchor" aria-hidden="true">#</a>${parseInline(text)}</h${level}>`
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
