---
title: When PostgreSQL's JIT costs more than the query
date: 2026-09-14
summary: On a 64-partition table, PostgreSQL compiled 829 functions for one query and spent 1.7 seconds on it. With JIT off, the page went from 1,562 ms to 496 ms, with no new index.
related:
  title: "A national farmer registry under load"
  href: "/work/farmers-card-database/"
---

A query over a table of 1.68 million rows in 64 partitions took 3,514 ms on its first run. The scans were not the cost:

```
JIT:
  Functions: 829
  Timing: Generation 163 ms, Optimization 167 ms, Emission 1,381 ms, Total 1,711 ms
Planning Time: 96 ms
Execution Time: 3,514 ms
```

**Half the time went to compiling the query, not running it.** Warm and measured again, the same query took 1,562 ms with JIT on and 496 ms with JIT off. The work was the same. Only the compile step changed.

## Why partitions trigger it

The planner makes JIT functions for each plan node. A scan of every partition multiplies the number of nodes. 64 partitions plus a wide select list pushed the function count past the point where compiling costs more than interpreting.

The query returned only 196 rows. Row count does not matter here. The `jit_above_cost` threshold (default 100,000) compares against the planner's **cost estimate**, and a 64-partition plan passes it easily while the real work stays small.

## What I do now

1. **Read the JIT block in `EXPLAIN (ANALYZE)` before adding an index.** A slow query on a partitioned table may not be doing slow work. Compare with JIT off before you judge the plan.
2. **Turn it off for the statement, not the connection.** `SET LOCAL jit = off` ends with the transaction, so a pooled connection goes back unchanged. A plain `SET` stays on the connection and affects the next request that gets it.
3. **Check whether you still need the index.** In this case the planned partial index was not needed. Building it would have taken locks across all 64 partitions for no gain.

Later the same finding, applied to the whole cluster, was one of two changes that took a national registry's busiest update from 60,668 ms to 1.7 ms. [The case study](/work/farmers-card-database/) has that story.
