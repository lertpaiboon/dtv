---
trigger: always_on
---

# Deethavorn SDLC & One-Man Business Subagent Team

This workspace (`deethavorn-web` / `deethavorn.com`) is equipped with **9 specialized subagents** organized across two axes: **Core SDLC Engineering (6 roles)** and **One-Man Business Studio (3 roles)**.

When delegating or orchestrating tasks via `invoke_subagent` (or defining them via `define_subagent` if not yet registered in a new session, reading their full prompts from `.agents/agents/<name>.md`), route tasks to the appropriate specialist:

## 1. Core SDLC Engineering Team
1. **`ba-domain-analyst`** (`.agents/agents/ba-domain-analyst.md`) — *Phase 1: Planning & Analysis*
   - Thai accounting/tax rules (`VAT_PP30`, `WHT_PND1/3/53`, `PND51`), billing statuses, aging debtors, and editorial E-E-A-T workflows.
2. **`system-architect`** (`.agents/agents/system-architect.md`) — *Phase 2: System & DB Design*
   - `prisma/schema.prisma`, Next.js 15 App Router RSC boundaries, API contracts, and RBAC security architecture.
3. **`frontend-ui-engineer`** (`.agents/agents/frontend-ui-engineer.md`) — *Phase 3A: Frontend Implementation*
   - Public pages & Admin workspaces, Navy & Gold CPA brand styling, responsive design, WCAG accessibility, and Blob URL memory safety.
4. **`backend-api-engineer`** (`.agents/agents/backend-api-engineer.md`) — *Phase 3B: Backend Implementation*
   - Next.js API routes, consolidated billing accumulation, batch Prisma transactions, quote-aware CSV import/export, and protected slip storage (`storage/uploads/slips`).
5. **`seo-eeat-specialist`** (`.agents/agents/seo-eeat-specialist.md`) — *Phase 3C: Technical SEO & AEO*
   - JSON-LD structured data, Rank Math-style SEO engine, server-side 301/302 redirects, dynamic sitemap, and IndexNow.
6. **`qa-security-auditor`** (`.agents/agents/qa-security-auditor.md`) — *Phase 4–6: Testing, Security & Release*
   - End-to-end code path scrutiny, OWASP & RBAC auditing, `npm run build` verification, and Playwright E2E testing.

## 2. One-Man Business Studio Team
7. **`cpa-content-writer`** (`.agents/agents/cpa-content-writer.md`) — *Content & E-E-A-T Authority*
   - Researches RD/DBD laws and writes 90+ SEO-score tax/accounting articles with Quick Answers, comparison tables, FAQs, and citations.
8. **`brand-graphic-designer`** (`.agents/agents/brand-graphic-designer.md`) — *Visual & Infographic Design*
   - Designs article covers (`coverImage`), OG images, tax infographics, and SVG illustrations in Deethavorn's Deep Navy (`#091c3a`) & Luxury Gold (`#c5a059`) palette.
9. **`growth-cro-marketer`** (`.agents/agents/growth-cro-marketer.md`) — *Marketing, Copywriting & CRO*
   - Optimizes landing page copy, CTAs, lead generation funnels, and client LINE/email communication templates.
