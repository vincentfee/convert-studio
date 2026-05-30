import fs from "node:fs";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/validate_blog_post.js content/blog/en/example.md");
  process.exit(1);
}

const source = fs.readFileSync(file, "utf8");
const match = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
if (!match) throw new Error("Missing frontmatter.");

const frontmatter = match[1];
const body = match[2];
for (const key of ["slug", "title", "description", "date", "category", "relatedTools"]) {
  if (!frontmatter.includes(`${key}:`)) throw new Error(`Missing ${key}.`);
}
if ((body.match(/^##\s+/gm) || []).length < 4) throw new Error("Use at least 4 H2 sections.");
if (body.split(/\s+/).filter(Boolean).length < 450) throw new Error("Article is too short.");

console.log("Blog post looks valid.");
