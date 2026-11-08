import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const work = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/work" }),
  schema: z.object({
    title: z.string(),
    order: z.number(),
    org: z.string(),
    role: z.string(),
    period: z.string(),
    stack: z.array(z.string()),
    summary: z.string(),
    proof: z.object({
      label: z.string(),
      kind: z.enum(["improve", "agree", "single"]).default("improve"),
      before: z.string().default(""),
      beforeLabel: z.string().default(""),
      after: z.string(),
      afterLabel: z.string(),
      note: z.string(),
    }),
    measured: z.array(z.string()),
  }),
});

const notes = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/notes" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
  }),
});

export const collections = { work, notes };
