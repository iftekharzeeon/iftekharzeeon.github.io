---
title: From spreadsheets to a fund-accounting system
order: 1
org: VIPB Asset Management
role: Sole developer, contract
period: May 2026 – Nov 2026
stack: [TypeScript, Fastify, Prisma, Next.js, PostgreSQL, Railway, Cloudflare]
summary: VIPB runs 6 mutual funds. The investor platform lived in MongoDB and the daily NAV came from Excel. I moved the platform to PostgreSQL, then moved the fund accounting into the app.
proof:
  kind: agree
  label: Growth Fund NAV per unit, 28 Sep 2026
  before: "13.094528"
  beforeLabel: "workbook"
  after: "13.094301"
  afterLabel: "app"
  note: Workbook value, then the app's own value. Both publish as 13.09.
measured:
  - "NAV: the app replayed 21 to 28 September 2026 through the new accounting services, and the result was compared with the business workbook."
  - "Missing rows: replay of the real page sequence of the production export, August 2026."
  - "Tests: API suite run, 1,531 passed, 0 failed."
---

## The problem

A mutual fund has two halves, and they must give the same answer. The investor side says who owns how many units. The fund side says what the fund bought with the money. NAV, the price of one unit, is the only number the two halves share.

At VIPB the investor side was a web platform on MongoDB and Express. The fund side was a set of Excel workbooks. Every day a person computed the NAV in a workbook and typed it into the platform. The platform then sold and bought units at that price. One hand-typed number was the whole join between the two systems.

## Constraints

- Real money and real investors, on 6 funds with about ৳242.5 crore under management (September 2026).
- The business team works from the workbooks. A new system must agree with them to the sixth decimal place before they trust it.
- No downtime window that investors would notice.

## My role

I was the only developer. I chose the stack, wrote the code, ran the migrations, and put each change to the business team for sign-off.

## Approach

1. I rebuilt the platform as a TypeScript monorepo: Fastify and Prisma for the API, Next.js for the public site, the investor portal and the staff admin. Money uses decimal arithmetic, and every write lands in an append-only audit log.
2. I moved the live data from MongoDB to PostgreSQL. The cutover went live on 9 June 2026. Reconciliation afterwards found 29 holdings with impossible negative gains. I traced them to the legacy data, not to the new code. They cleared when I re-imported each fund from the business's own source sheets.
3. I studied the workbooks cell by cell: trades, accruals, fees, the trial balance and the NAV. Then I built each one as a service inside the app.
4. I mirrored production data into staging. Every accounting phase ran end to end there, and the business team checked the numbers there before anything touched production.
5. I replayed a full week of history through the new services and compared each day with the workbook.

I chose to replay history instead of starting fresh from one opening balance. A replay is slower to build, but it shows every day where the two systems disagree, and it is the proof an accountant accepts.

## Result

- The computed NAV for 28 September was 13.094301. The workbook said 13.094528. Both publish as 13.09.
- Fund accounting now runs in the app on production for all 6 funds. The daily NAV no longer depends on a hand-typed number.
- A paged export lost 1,294 of 8,212 rows without any error, because the sort key was not unique. I found it by replaying the real page sequence, and fixed it by adding a unique key to every paged query. I wrote it up as [a note](/notes/limit-offset-drops-rows/).
- The API suite has 1,531 tests, all passing.

## What I would do differently

I would put the fund side into the design from the first week. For months the hand-typed NAV was the only link between the two halves. Starting there would have exposed the hardest questions earlier.
