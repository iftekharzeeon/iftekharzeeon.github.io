---
title: A national farmer registry under load
order: 2
org: Farmers Card, Department of Agricultural Extension (via Pridesys IT Ltd)
role: Production operations and database performance, in a larger team
period: Jun 2026 – present
stack: [PostgreSQL 18, Patroni, Kafka, Spring Boot, Kubernetes, Helm]
summary: Farmers Card is Bangladesh's national farmer registry. It holds 1,873,505 active farmers and drives vouchers, subsidies and bank payments. In September 2026 the database was close to saturated. I found the cause and fixed it on production in one evening.
proof:
  kind: improve
  label: Slowest update on the farmer table
  before: "60,668 ms"
  beforeLabel: "before"
  after: "1.7 ms"
  afterLabel: "after"
  note: Measured on production before and after the change, 30 Sep 2026.
measured:
  - "Query times: EXPLAIN ANALYZE on production, 30 September 2026."
  - "Kafka lag and CPU idle: production monitoring, 29 September to 1 October 2026."
  - "Staging rehearsal: 40 production statements replayed with JIT on and off."
---

## The problem

Farmers Card runs on about 14 Spring Boot services, Kafka and a 3-node PostgreSQL cluster managed by Patroni, on Kubernetes in the national data centre. Agricultural officers register farmers. Dealers redeem vouchers. Banks receive the incentive payments.

On 29 September 2026 the database server had only 10% CPU idle during business hours. One update on the farmer table took 60,668 ms. The Kafka consumer that keeps the services in step had fallen 53,845 messages behind. Saving a farmer was slow, and some requests failed with 503 errors.

## Constraints

- 1,873,505 active farmers in 64 districts, with officers working on the system all day.
- The farmer table has 64 partitions. Building an index on it takes locks on every partition.
- The system had to stay online during the change.

## My role

I worked on production operations and database performance inside a larger Pridesys team. Other developers own most of the service code. I diagnosed the database side, wrote the change, and ran it on production. I also added tests and a consumer setting to a teammate's open pull request.

## Approach

1. I read the query plans for the slowest statements on production.
2. Two causes stood out. PostgreSQL's JIT compiler spent more time compiling plans than running them, because a 64-partition plan has many nodes. And four indexes that the queries needed did not exist.
3. I replayed 40 production statements on staging with JIT on and off. JIT off was faster in all 20 statements where JIT fired, and never slower.
4. I built the four indexes on staging. The slow update fell from 45,148 ms to between 68 and 78 ms. I rehearsed the build and the rollback there, then restored staging.
5. On production, between 22:06 and 23:27 on 30 September, I turned JIT off for the cluster with a configuration reload and built the four indexes with `CREATE INDEX CONCURRENTLY`, so no application session was blocked. A Flyway migration records the indexes so the next release does not fight them.
6. I watched the Kafka backlog drain to 0.

## Result

| Measure | Before | After |
|---|---|---|
| Slowest farmer update | 60,668 ms | 1.7 ms |
| Second national-ID lookup | 643 ms | 0.7 ms |
| Bank lookup | 71.5 ms | under 0.1 ms |
| Kafka consumer lag | 53,845 | 0 by 22:15 |
| CPU idle, business hours | 10% | 81% |
| Slow farmer saves, 10:00 to 12:20 | 2,240 | 368 |
| 503 errors, same window | 26 | 2 |

## Other work on the same system

- **Search.** An admin search took 46 seconds. One branch of an `OR` read a second table, so PostgreSQL could not use its indexes and walked the table in sort order instead. A `UNION` of the branches brought it to 57 ms. [The note](/notes/or-across-tables/) has the details.
- **ID allocation.** Each new farmer ID ran an `INSERT … ON CONFLICT DO NOTHING` whose `SELECT` scanned all 64 partitions, even though the row always existed. A cheap existence check first took it from 535 ms to 0.19 ms. Bulk approval of 100 farmers had spent about 55 seconds on this alone.
- **Cluster recovery.** A replica diverged while Patroni still reported it healthy. I rebuilt it from the leader: a 52 GB database in 21 minutes.
- **Staging drift.** Staging had 638 indexes against production's 2,044, while the migration tool said every migration was applied. I repaired staging so its benchmarks mean something again.

## What I would do differently

I would add JIT time and missing-index checks to the regular monitoring. Both causes were visible in the query plans weeks before the server saturated.
