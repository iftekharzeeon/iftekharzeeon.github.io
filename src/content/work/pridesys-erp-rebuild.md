---
title: Rebuilding a 7,143-screen ERP by replaying its history
order: 3
org: Pridesys IT Ltd
role: Architect and owner of the rebuild
period: Oct 2026 – present
stack: [Java 25, Spring Boot 4, PostgreSQL 18, React 19, TypeScript, Docker]
summary: Pridesys ERP runs accounting, inventory, sales, HR, attendance and payroll for many companies. It is built on Oracle Forms and PL/SQL. I lead its rebuild on Spring Boot and PostgreSQL, and I prove each engine by replaying real history against the old system.
proof:
  kind: agree
  label: Attendance replay against Oracle, rows
  before: "7,781,353"
  beforeLabel: "Oracle rows"
  after: "7,781,343"
  afterLabel: "reproduced exactly"
  note: Rows in the old system, then rows the new engine reproduced exactly. Each of the other 10 has a counted cause.
measured:
  - "Attendance: full replay of stored history against the Oracle 19c source."
  - "Payroll: 29,395 of 29,395 stored salary rows equal, or explained by a counted cause."
  - "Tests: backend suite 1,345 passed, end-to-end 71 of 71."
---

## The problem

Pridesys ERP grew over many years on Oracle Forms, Oracle Reports, APEX, Angular and Oracle 19c, with most of the business rules in PL/SQL. The rules are spread across database routines, forms and reports.

The goal is to replace all of it with a React and Spring Boot system on PostgreSQL, with every business flow and data flow intact.

## Constraints

- Scope is every active menu entry: 7,143 items, made of 2,423 entry screens, 530 process screens and 4,135 reports.
- Full or nothing. Clients move only when the whole system is ready. There is no partial delivery.
- The old system's results are the standard. Where the new system disagrees, the new system is wrong until proven otherwise.

## My role

I own the architecture and the decisions, and I lead the build. I mapped the legacy system, chose the stack, and set the rules for how we prove the new system matches the old one.

## Approach

1. **Map first.** I read the Oracle schema, the menus and the PL/SQL to find the shared engines: posting, stock, attendance, payroll.
2. **One product for every client.** One codebase and one schema. Each client gets its own PostgreSQL database, and features are switched per client.
3. **Rules in Java, not in the database.** Each business rule is a named service with a visible order of steps. Batch work such as attendance and payroll runs as set-based SQL sent from Java.
4. **Prove parity three ways.** Data checks (row counts, checksums, business totals). Replay of history through each new engine. Then a live parallel run per client for at least one full month, including a payroll run and a month-end close.
5. **Record every Oracle trap.** For example, Oracle stores empty text as NULL, a product of two NUMBER values keeps 40 digits, and a unique key created with NOVALIDATE can hold duplicates.

## Result so far

- The attendance engine reproduced 7,781,343 of 7,781,353 rows exactly. Each of the other 10 has a counted cause.
- The payroll engine agreed on 29,395 of 29,395 stored salary rows, each equal or explained by a counted cause.
- The backend suite has 1,345 passing tests. The end-to-end suite passes 71 of 71 in a real browser.

## What I would do differently

I would ask for the Oracle Forms and Reports source files on day one. The database explains most screens, but some reports exist only in those files.
