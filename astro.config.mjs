import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const SITE = "https://iftekharzeeon.github.io";

// After the build, make every link that leaves the site (and the résumé PDF) open in a new tab.
function externalLinksNewTab() {
  const opensNewTab = (href) =>
    (/^https?:\/\//i.test(href) && !href.startsWith(SITE)) || /\.pdf($|[?#])/i.test(href);

  async function walk(dir) {
    const out = [];
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const p = join(dir, entry.name);
      if (entry.isDirectory()) out.push(...(await walk(p)));
      else if (entry.name.endsWith(".html")) out.push(p);
    }
    return out;
  }

  return {
    name: "external-links-new-tab",
    hooks: {
      "astro:build:done": async ({ dir }) => {
        const root = fileURLToPath(dir);
        for (const file of await walk(root)) {
          const html = await readFile(file, "utf8");
          const next = html.replace(/<a\b([^>]*?)\shref="([^"]+)"([^>]*)>/gi, (tag, before, href, after) => {
            if (!opensNewTab(href) || /\starget=/i.test(tag)) return tag;
            return `<a${before} href="${href}"${after} target="_blank" rel="noopener">`;
          });
          if (next !== html) await writeFile(file, next);
        }
      },
    },
  };
}

export default defineConfig({
  site: SITE,
  trailingSlash: "ignore",
  build: { format: "directory" },
  markdown: { syntaxHighlight: false },
  integrations: [sitemap({ filter: (page) => !page.includes("/404") }), externalLinksNewTab()],
});
