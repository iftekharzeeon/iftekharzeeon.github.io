---
title: An OR across two tables cost 46 seconds. UNION cost 57 ms.
date: 2026-07-31
summary: PostgreSQL can combine indexes for an OR on one table. Add a branch that reads a second table, plus ORDER BY and LIMIT, and the planner walks the whole table in sort order.
related:
  title: "A national farmer registry under load"
  href: "/work/farmers-card-database/"
---

PostgreSQL can combine several indexes on **the same table** with a `BitmapOr`. When one branch of the `OR` reads a **different** table, through a subquery or a join, the whole `OR` can no longer use indexes as a unit.

On its own, that is slow. With `ORDER BY … LIMIT n` it becomes much worse. The `LIMIT` makes an ordered index walk look cheap to the planner. So it scans the table in sort order and tests each row until it finds `n` matches. On a partitioned table, it does that across every partition.

## The measurement

A farmer search on a national registry: 648,000 rows in 64 partitions.

| Query | Time |
|---|---|
| 5 columns on `farmers` OR `user_id IN (SELECT … FROM auth.users WHERE mobile = ?)`, with `ORDER BY … LIMIT 10` | 46,779 ms |
| The same, without the mobile branch | 57 ms |
| All six branches, without `ORDER BY` | 111 ms |
| Name-only trigram search, with `ORDER BY` | 59 ms |

Each part is fine alone. Only the cross-table `OR` together with `ORDER BY … LIMIT` is a problem.

## The fix

Write each branch as its own query and `UNION` them. Each branch then stays on one table and uses its own index. The worst case fell to 778 ms.

Dropping branches that a search term cannot match helps too. A term with a letter in it cannot equal a numeric ID or a phone number. But that is not enough alone: a numeric term keeps the phone branch and stays at 51 seconds.

## How I found it

I removed one branch at a time and tested each shape in `psql` before blaming the environment. Planner settings and missing statistics were both plausible causes, and both were wrong.

## Why production looked healthy

Officers only search inside their own district. At district scope the same query ran in 50 ms. Only an unrestricted admin searched every partition. **Always benchmark the unscoped case**, and benchmark at more than one scope. The ranking of the candidate query shapes changed between national scope and division scope.
