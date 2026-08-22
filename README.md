# Cartigo — Slice 1: Foundation

This is the base of a reseller-only marketplace built in vertical slices (see
project plan). This slice gives you a working project you can run locally,
not a finished app.

## What's here

- **Next.js 14 (App Router) + TypeScript + Tailwind**, with Cartigo's own
  design tokens in `tailwind.config.ts` (navy/amber, Fraunces + Inter) —
  deliberately not the generic cream/terracotta AI-default palette.
- **Prisma schema** (`prisma/schema.prisma`) covering: users & roles,
  reseller onboarding (profile, application, documents, status history),
  catalog (category, product, variant, image, attribute), inventory,
  cart/wishlist, an order skeleton, and a universal `AuditLog`.
- **Auth**: NextAuth with a credentials provider, JWT sessions carrying
  `role`, and `src/middleware.ts` gating `/admin` and `/reseller/dashboard`
  by role.
- **Server-side authorization** (`src/lib/authz.ts`): every server action
  re-checks role itself — middleware is a first line of defense, never the
  only one, per the "seller permissions are server-enforced" requirement.
- **Reference server action** (`src/server/reseller-applications.ts`):
  shows the pattern every moderation/decision action in later slices will
  follow — Zod validation, role check, transaction, status history row,
  audit log row, typed `{ ok, error, code }` result instead of thrown
  errors leaking to the client.
- **Seed script** (`prisma/seed.ts`): bootstraps a super-admin from env
  vars, two demo categories, one demo approved reseller, one demo product.
  Fictional data only, easy to re-run.
- Minimal UI kit started: `Button`, `StatusBadge` (plain-language status
  labels, not raw enum values).

## Running it

```bash
cp .env.example .env       # fill in DATABASE_URL, NEXTAUTH_SECRET at minimum
npm install
npm run db:migrate         # creates tables from schema.prisma
npm run db:seed            # bootstraps admin + demo data
npm run dev
```

## Deliberately not in this slice

Payments, payouts, reviews, search, notifications, CMS, promotions, support
tickets, and most admin pages aren't built yet — the schema has room for
them but the UI/API layer doesn't exist. Building all of that at once
would produce code nobody could verify; each slice below adds one working,
testable loop.

## Next slices (in order)

1. **Reseller onboarding UI** — application form (multi-step, draft-saving)
   → status page (pending/approved/rejected/suspended) → admin review queue
   using `decideResellerApplication` as the approve/reject/request-info
   action.
2. **Product submission + moderation** — reseller listing wizard (the
   10-step flow from the spec) → admin moderation queue, reusing the same
   transaction+audit pattern.
3. **Storefront + cart + checkout + orders** — public browse/search
   (published products only), cart, checkout with server-verified payment,
   order state machine.
4. **Payouts, commissions, reviews, notifications, remaining admin tooling**.

Each slice will extend `schema.prisma` (migrations, not rewrites) and
follow the same authz/audit/transaction conventions established here.
