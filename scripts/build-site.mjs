import { mkdir, writeFile, copyFile, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { imageTools, pdfTools, legalPages, site } from "../src/site-data.mjs";
import { renderHome, renderToolPage, renderLegalPage } from "../src/templates.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");
const publicDir = join(root, "public");

const allTools = [...imageTools, ...pdfTools];

async function writePage(pathname, html) {
  const clean = pathname === "/" ? "index.html" : join(pathname.replace(/^\/|\/$/g, ""), "index.html");
  const target = join(dist, clean);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, html, "utf8");
}

async function main() {
  await rm(dist, { recursive: true, force: true });
  await mkdir(dist, { recursive: true });
  await mkdir(join(dist, "assets"), { recursive: true });
  await copyFile(join(publicDir, "app.css"), join(dist, "assets", "app.css"));
  await copyFile(join(publicDir, "app.js"), join(dist, "assets", "app.js"));
  const apiBase = process.env.CONVERT_API_BASE || "http://localhost:8000";
  await writeFile(join(dist, "assets", "config.js"), `window.CONVERT_API_BASE = ${JSON.stringify(apiBase)};\n`, "utf8");

  await writePage("/", renderHome({ site, imageTools, pdfTools }));

  for (const tool of allTools) {
    await writePage(`/${tool.slug}/`, renderToolPage({ site, tool, allTools }));
  }

  for (const page of legalPages) {
    await writePage(`/${page.slug}/`, renderLegalPage({ site, page, allTools }));
  }

  const sitemapUrls = ["/", ...allTools.map((tool) => `/${tool.slug}/`), ...legalPages.map((page) => `/${page.slug}/`)];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls
    .map((pathname) => `  <url><loc>${site.url}${pathname}</loc></url>`)
    .join("\n")}\n</urlset>\n`;
  await writeFile(join(dist, "sitemap.xml"), sitemap, "utf8");
  await writeFile(join(dist, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap.xml\n`, "utf8");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
