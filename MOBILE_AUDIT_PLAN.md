# Mobile-Friendly Audit Plan

This plan covers every user-facing area of InvoiceFlow so we can systematically verify that each screen is "100% mobile friendly" and fix issues without overlooking any component.

## Target Devices & Breakpoints

- **Compact phones (≤375px)** – e.g., iPhone SE, Pixel 4a
- **Standard phones (390‑414px)** – e.g., iPhone 15/Plus, Galaxy S23
- **Large phones / small tablets (430‑600px)** – e.g., iPhone 15 Pro Max, Fold portrait
- **Tablets (601‑834px)** – iPad Mini/Air portrait; ensure layouts gracefully scale before desktop breakpoints kick in

For each breakpoint group we will check:

1. Layout flow (no horizontal scrolling, readable content hierarchy)
2. Tap targets (minimum 44px height and spacing)
3. Typography (legible body text ≥14px, heading scales)
4. Critical actions visible without awkward scrolling
5. Theme parity (light/dark) and component-specific states (loading, empty, error)

## Audit Order (High → Low Impact)

1. **Authenticated Dashboard Core**
   - `/dashboard` (overview)
   - `/dashboard/business` (BusinessDashboard + InvoiceTable, QuickActions, stats)
   - `/dashboard/invoices` (list + filters + modals)
   - `/dashboard/invoices/new` (InvoiceForm – already partially updated; reverify summary, items, date pickers)
   - `/dashboard/invoices/success` (InvoiceSuccessView)
   - `/dashboard/clients` (ClientManagement, forms, drawers)
   - `/dashboard/analytics` (charts/cards responsiveness)
   - `/dashboard/upgrade-hints` if any banner/plan CTA components appear elsewhere

2. **Shared Components embedded in many screens**
   - `components/Dashboard/*` cards and grids
   - `components/Business/*` widgets (BusinessStats, InvoiceTable, Modals)
   - `components/Clients/*` forms/cards
   - `components/Invoices/*` (InvoiceItems, dialogs, success widgets)
   - `components/ui/*` primitives (button, card, input, dialog, select) – confirm default classes adapt to `sm` breakpoints

3. **Public Marketing & Auth Flows**
   - `app/page.tsx` landing sections (Hero, Features, Pricing, CTA)
   - `/pricing`, `/blog`, `/blog/[id]`
   - `/contact`, `/help`, `/privacy-policy`, `/cookies`
   - `/sign-in`, `/sign-up` (Clerk overrides + theme toggles)

4. **Special Routes**
   - `/invoice/[token]` (public invoice view)
   - `/upgrade` (plan comparison, CTA stack)
   - `/app/api` generated assets such as PDF previews (validate rendering via download on mobile if possible)

## Detailed Checklist by Area

| Route / Component         | Key Subcomponents                                             | Known Risk Areas                                                                | Status |
| ------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------ |
| `/dashboard`              | `DashboardHeader`, `BusinessGrid`, `BusinessAvailability`     | Header CTA wrap, card gutters, plan banners stacking                            | ☐      |
| `/dashboard/business`     | `BusinessDashboard`, `InvoiceTable`, `RecentActivity`, modals | Stat grid overflow, tables requiring horizontal scroll, modal viewport on 360px | ☐      |
| `/dashboard/invoices`     | Filter toolbar, invoice cards, pagination                     | Filter row wrapping, consistent button sizing, card action buttons              | ☐      |
| `/dashboard/invoices/new` | `InvoiceForm`, date picker popover, items table               | Section padding, summary card width, table horizontal scroll                    | ☐      |
| `/dashboard/clients`      | `ClientManagement`, `ClientCard`, `ClientForm`                | Drawer width, form padding, action menu placement                               | ☐      |
| `/dashboard/analytics`    | Charts/cards                                                  | Chart canvas overflow, legend wrapping                                          | ☐      |
| Shared components         | `Navbar`, `PlanWatcher`, dialogs, toasts                      | Off-canvas nav toggles, safe-area insets, focus management                      | ☐      |
| Marketing pages           | Hero, Pricing, FAQs, Contact forms                            | Hero media scaling, pricing columns stacking, CTA spacing                       | ☐      |
| Auth                      | Clerk routes, theme toggle                                    | Logo scaling, keyboard-safe spacing                                             | ☐      |
| Public invoice            | `/invoice/[token]`, download CTA                              | Totals layout, share buttons, print/download button spacing                     | ☐      |

Use the Status column to mark ✅ when each screen meets the target criteria.

### Component-Level Spot Checks

- **Tables / Data grids:** confirm responsive collapse or provide horizontal scroll with visual cues.
- **Modals/Drawers:** ensure height fits <90vh, content scrollable, close buttons reachable.
- **Forms:** stack labels/inputs vertically under 400px, maintain consistent 16px padding.
- **Buttons:** verify `CustomButton` variants maintain full-width alignment on phones.
- **Icons:** cap at 24px on narrow screens to avoid crowding headings.

## Workflow Per Screen

For each route/component listed above:

1. **Capture screenshots or notes** for 360px, 390px, and 768px widths.
2. **Log issues** in a running checklist (e.g., `MOBILE_AUDIT_NOTES.md`) with:
   - Route + component name
   - Problem description
   - Severity (blocker / cosmetic)
3. **Patch fixes** grouped by route so PRs remain focused; re-run manual checks after each change.
4. **Regression checks**: confirm reusable components (buttons, cards, forms) stay consistent once updated.

## Immediate Next Steps

1. Start with `/dashboard` → `/dashboard/business` because they aggregate most widgets.
2. Use browser dev tools to simulate 360px & 414px widths; record spacing, overflow issues.
3. Create follow-up tasks per issue (e.g., "BusinessDashboard stats wrap on 360px, adjust grid to single column").
4. Iterate through the ordered list until all screens meet the criteria above.

### Tracking Artifacts

- `MOBILE_AUDIT_PLAN.md` (this file) — scope + checklist.
- `MOBILE_AUDIT_NOTES.md` — per-route findings, screenshots, before/after notes.
- GitHub issues or TODO board items per defect for visibility.

This document stays in the repo so we can track progress and mark sections complete as the audit advances.
