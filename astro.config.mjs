import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://iftekharzeeon.github.io",
  trailingSlash: "ignore",
  build: { format: "directory" },
  markdown: { syntaxHighlight: false },
});
