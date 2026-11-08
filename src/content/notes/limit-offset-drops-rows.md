---
title: LIMIT and OFFSET with a non-unique sort key silently drop rows
date: 2026-08-05
summary: A paged export returned full pages and the right page count, and still lost 16% of the rows. The sort key had ties.
---

A paged export is complete only if its sort order is **total**: no two rows may tie.

`LIMIT` and `OFFSET` run the query again for each page. PostgreSQL does not promise a stable order for rows that tie. It can also choose a different plan for low and high offsets, for example a top-N heap sort for early pages and a full sort for later ones. So a list sorted on a non-unique column returns some rows twice and never returns others.

**Nothing shows the loss.** Every page comes back full. The total page count is right. The file looks plausible. Nothing errors.

## The measurement

On a production fund platform I replayed the real page sequence of two exports:

| Export | Rows | Delivered | Missing |
|---|---|---|---|
| Transaction history | 8,212 | 6,918 | 1,294 (16%) |
| One fund's register | 3,048 | 2,367 | 681 (22%) |

The cause was `ORDER BY date DESC`, where `date` was stored at midnight. Every transaction on the same day tied exactly. In production, 995 rows shared one timestamp.

## The fix

Add a unique column as the last sort key:

```ts
orderBy: [{ date: "desc" }, { id: "asc" }]
```

After the fix the export delivered 8,212 of 8,212 rows.

## A test that catches it

Seed about 250 rows that share one identical date. Page through to the end. Assert that the number of distinct IDs equals the total. On a 250-row local set, the old sort already lost 3 rows. The test fails on the old code, which is the point.
