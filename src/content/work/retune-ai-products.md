---
title: AI products, and a production rescue
order: 4
org: Retune AI Inc
role: Software engineer, remote
period: Sep 2023 – present
stack: [Deno, TypeScript, Next.js, Pinecone, OpenAI, Prisma, MySQL, GCP, WordPress]
summary: At Retune I am building re:frame, and before that I built AI products. I also keep client systems running. Hybrid search lifted retrieval by 40% in the chatbot product. On a client's website I recovered a production outage without changing a single row.
proof:
  kind: single
  label: Retrieval quality, hybrid search against vector search alone
  after: "+40%"
  afterLabel: "better retrieval"
  note: BM25 keyword search added to vector search. retune.so made USD 700K+ in its first 2 months on AppSumo.
measured:
  - "Retrieval: Retune's internal evaluation."
  - "Outage: MariaDB process list, Apache access log and load average on the production VM, 14 September 2026."
  - "Mail analysis: 2,495 received messages in 2,130 conversations, read through Microsoft Graph."
---

## re:frame

I am now building [re:frame](https://reframe.so), a platform where people and AI agents write apps that run as soon as the code is saved. There is no build step and no deploy step. Each user can run a different version of an app, and every version of the code and data is kept.

## Hybrid search for retune.so

retune.so lets businesses build chatbots on their own documents. Pure vector search often missed exact terms: product names, codes, numbers.

I built the embedding pipeline with OpenAI's `text-embedding-ada-002` and Pinecone, then added BM25 keyword search beside it and merged the two result lists. Retrieval improved by 40%. The product made more than USD 700K in its first 2 months on AppSumo.

## awaken.is and the AlterCall Virtual Coach

- **awaken.is** is an AI coaching product. I worked with the founder to turn business needs into features, and ran a beta group to shape the experience. Retention reached 78% across more than 500 users.
- **AlterCall Virtual Coach** brings AI coaching to a leadership-coaching company's clients. It contributed to a 40 to 50% increase in the company's sales.

## TELE: recovering a production outage

TELE is a client with a multilingual WordPress site on GCP, in German, English, French and Spanish. I run its production and security work.

On 14 September 2026 the site accepted connections but returned no pages. DNS, the firewall and the VM were fine. In the database, 15 WordPress searches had been running for 93 to 122 minutes. Each one joined against about 8.25 million rows. All 16 PHP workers were waiting on them, and the load average was about 15 on 2 CPUs.

The access log showed 33 requests from one source in 20 minutes, each a search for `1` or a longer term starting with `1`.

1. I stopped Apache and PHP-FPM, so no new requests could arrive during the cleanup.
2. I cancelled the 30 application `SELECT` queries. I cancelled no write query, so no data could be lost.
3. I started PHP-FPM and Apache again and checked every language version of the site.

The site came back with no database row changed and no database restart. The load average fell to 1.82. The follow-up is a limit on very short search terms and a time limit on public searches.

## Turning an inbox into a task list

For the same client I built a Microsoft Graph tool that reads an executive's mailbox with app-only access. It reduced 2,495 received messages in 2,130 conversations to 120 distinct business actions, each linked to its source email.
