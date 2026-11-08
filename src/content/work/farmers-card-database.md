---
title: Farmers Card, a national farmer registry
order: 2
org: Farmers Card, Department of Agricultural Extension (at Pridesys IT Ltd)
role: System architect, and builder of most of the identity and platform services
period: Ongoing
stack: [Spring Boot, Kafka, PostgreSQL 18, Patroni, Kubernetes, Helm, React, Flutter]
summary: Farmers Card is Bangladesh's national farmer registry, run by the Department of Agricultural Extension. It serves 2.5M+ farmers and connects 4 mobile apps. I architected the whole system and built most of the identity and platform services.
proof:
  kind: single
  label: Farmers in the registry
  after: "2.5M+"
  afterLabel: "farmers, 4 mobile apps"
  note: One backend serves all 4 mobile apps and the web back office.
measured:
  - "Query times: EXPLAIN ANALYZE on production, 30 September 2026."
  - "Kafka lag and CPU idle: production monitoring, 29 September to 1 October 2026."
  - "Staging rehearsal: 40 production statements replayed with JIT on and off."
---

## The system

Farmers Card registers farmers and gives each one a card. Through it, the government delivers vouchers, subsidies and incentive payments to farmers through banks. Agricultural officers register and approve farmers. Dealers redeem vouchers. Farmers see their own records.

All of this runs on one backend that 4 mobile apps and a web back office share. The backend is about 14 Spring Boot services that talk through Kafka, on a 3-node PostgreSQL cluster managed by Patroni, on Kubernetes in the national data centre.

## My role

I architected the whole system: how it splits into services, how the services share data through Kafka, and how the mobile apps and the back office reach them. I built most of the identity service, which holds farmers, their national IDs and their accounts, and most of the platform service. I also run production database performance.

## Constraints

- 2.5M+ farmers in 64 districts, with officers working on the system all day.
- National ID data, so access and audit matter as much as speed.
- The farmer table has 64 partitions. Any change to it takes locks on every partition.
- The system has to stay online during changes.

## A production slowdown, fixed in one evening

On 29 September 2026 the database server had only 10% CPU idle during business hours. One update on the farmer table took 60,668 ms. The Kafka consumer that keeps the services in step had fallen 53,845 messages behind. Saving a farmer was slow, and some requests failed with 503 errors.

1. I read the query plans for the slowest statements on production.
2. Two causes stood out. PostgreSQL's JIT compiler spent more time compiling plans than running them, because a 64-partition plan has many nodes. And four indexes that the queries needed did not exist.
3. I replayed 40 production statements on staging with JIT on and off. JIT off was faster in all 20 statements where JIT fired, and never slower.
4. I built the four indexes on staging. The slow update fell from 45,148 ms to between 68 and 78 ms. I rehearsed the build and the rollback there, then restored staging.
5. On production, between 22:06 and 23:27 on 30 September, I turned JIT off for the cluster and built the four indexes with `CREATE INDEX CONCURRENTLY`, so no application session was blocked. A Flyway migration records the indexes so the next release does not fight them.
6. I watched the Kafka backlog drain to 0.

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

- **Search.** An admin search took 46 seconds. One branch of an `OR` read a second table, so PostgreSQL could not use its indexes. A `UNION` of the branches brought it to 57 ms. [The note](/notes/or-across-tables/) has the details.
- **ID allocation.** Each new farmer ID ran an `INSERT … ON CONFLICT DO NOTHING` whose `SELECT` scanned all 64 partitions, even though the row always existed. A cheap existence check first took it from 535 ms to 0.19 ms.
- **Cluster recovery.** A replica diverged while Patroni still reported it healthy. I rebuilt it from the leader: a 52 GB database in 21 minutes.
- **Staging drift.** Staging had 638 indexes against production's 2,044, while the migration tool said every migration was applied. I repaired staging so its benchmarks mean something again.

## What I would do differently

I would add JIT time and missing-index checks to the regular monitoring from the start. Both causes were visible in the query plans weeks before the server saturated.
