# Windows Development & Next.js Concurrency Rules

This workspace operates on **Windows OS** with **Next.js 15 (App Router)** and **Prisma ORM (MySQL)**.
Due to Windows file-system locking behavior and Next.js `.next` cache architecture, all developers and AI agents MUST strictly observe the following rules:

## 1. Never Run Concurrent Builds
- **PROHIBITED:** Never run `npm run build` or `npx next build` while `npm run dev` is running concurrently on port 3000.
- **Why:** On Windows, running `next build` mutates the `.next/` cache directory and overwrites chunk manifests while `next dev` holds in-memory references to older chunks. This immediately produces an uncaught HTTP 500 `Internal Server Error` across all pages.
- **Allowed Safe Alternative:** To validate TypeScript or linting while `npm run dev` is running, use:
  ```bash
  npx tsc --noEmit && npm run lint
  ```
  This is 100% read-only with respect to `.next/` and will never corrupt the dev server.

## 2. Prisma Engine File Locking
- **PROHIBITED:** Do not run `npx prisma generate` while the application is running if there is a risk of `EPERM` on `query_engine-windows.dll.node`.
- **Proper Procedure:**
  1. Stop `npm run dev`.
  2. Run `npx prisma generate` / `npx prisma db push`.
  3. Restart `npm run dev`.

## 3. Emergency Recovery from Internal Server Error / Corrupted `.next`
If an `Internal Server Error` (500) occurs due to cache collision or stale processes, execute this standard 3-step recovery sequence in PowerShell:
```powershell
# 1. Terminate conflicting node processes
Get-Process -Name node | Stop-Process -Force

# 2. Delete corrupted build cache
Remove-Item -Path '.next' -Recurse -Force

# 3. Start clean development server
npm run dev
```
