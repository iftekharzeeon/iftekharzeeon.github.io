---
title: From manual spreadsheets to a scalable fund platform
order: 1
org: VIPB Asset Management
role: Only developer, frontend and backend, contract
period: May 2026 – Nov 2026
stack: [Next.js, React, TypeScript, Fastify, Prisma, PostgreSQL, Railway, Cloudflare]
summary: VIPB ran its mutual funds on manual Excel work. I replaced it with one scalable system, a customer portal and an admin portal on the same backend, and automated the whole flow from a customer's purchase to the fund's accounting books. All 6 funds now run on it.
proof:
  kind: single
  label: Funds moved from Excel to the new system
  after: "6 of 6"
  afterLabel: "funds"
  note: Investor registers and fund accounting for every fund now run in the app on production.
measured:
  - "Fund count and production status: VIPB production, November 2026."
  - "NAV check: 21 to 28 September 2026 replayed through the new accounting services and compared with the business workbook."
  - "Missing rows: replay of the real page sequence of the production export, August 2026."
  - "Tests: API suite, 1,531 passed, 0 failed."
---

## The problem

VIPB Asset Management runs 6 mutual funds. When I started, most of the work behind them was manual Excel work:

- The investor registers of the older funds lived in spreadsheets.
- The fund accounting lived in workbooks: trades, accruals, fees, the trial balance and the daily unit price (NAV).
- A web platform on MongoDB sold units to investors. Every day a person computed the NAV in a workbook and typed it into the platform by hand.

Spreadsheets do not scale. Each new fund, investor or report meant more manual work, and nothing checked that the spreadsheets and the platform agreed.

## Constraints

- Real money and real investors, with about ৳242.5 crore under management (September 2026).
- The business team trusts its workbooks. The new system had to give the same answers before they would switch.
- Investors had to keep buying and selling units during the move.

## My role

I was the only developer, frontend and backend. I chose the stack, wrote the code, ran the migrations and the data imports, and put each change to the business team for sign-off.

## Approach

1. **One system instead of many files.** I rebuilt the platform as a TypeScript monorepo: Next.js for the public website, the customer portal and the admin portal, and Fastify with Prisma for the API. Money uses decimal arithmetic, and every write lands in an append-only audit log.
2. **Move the platform to PostgreSQL.** The cutover from MongoDB went live on 9 June 2026.
3. **Import each fund's spreadsheet register.** I imported the investor registers fund by fund, and checked units and amounts against the source sheets before each import went live. Reconciliation found 29 holdings with impossible negative gains. I traced them to the legacy data, and they cleared when I re-imported each fund from the business's own sheets.
4. **Move the fund accounting into the app.** I studied the workbooks cell by cell, then built trades, accruals, fees, the trial balance and the NAV as services.
5. **Test on a copy of production.** I mirrored production data into staging. Every phase ran there first, and the business team checked the numbers there before it reached production.
6. **Replay history.** I replayed a full week through the new services and compared each day with the workbook.
7. **Connect the two portals end to end.** A customer buys or sells units in the customer portal. Staff review and approve it in the admin portal. The system then issues or redeems the units at that day's NAV and posts the accounting voucher to the fund's books at the approval time, with no spreadsheet step in between.

## The two portals

- **Customer portal.** Customers sign up, complete their KYC, buy and sell units, set up SIPs, choose their dividend option per fund, download tax certificates and receive weekly statements by email.
- **Admin portal.** Staff review customer transactions, approve them into the books, and run the fund side: trades, accruals, fees, the general ledger, the trial balance and the daily NAV.

## Result

- All 6 funds now run in the app on production: investor registers and fund accounting. The daily NAV no longer depends on a hand-typed number.
- The flow from a customer's purchase to the fund's accounting books is automated from end to end.
- The new system matched the workbook. On 28 September it computed a NAV of 13.094301 against the workbook's 13.094528. Both publish as 13.09.
- A paged export lost 1,294 of 8,212 rows without any error, because the sort key was not unique. I fixed it by adding a unique key to every paged query. I wrote it up as [a note](/notes/limit-offset-drops-rows/).
- The API suite has 1,531 tests, all passing.

## What I would do differently

I would put the fund accounting into the design from the first week. For months the hand-typed NAV was the only link between the spreadsheets and the platform. Starting there would have exposed the hardest questions earlier.
