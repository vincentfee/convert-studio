import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { blogLanguages, loadMarkdownBlogPosts } from "./load-blog-posts.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const slugs = new Set();
let total = 0;

for (const language of blogLanguages) {
  const posts = await loadMarkdownBlogPosts({ contentRoot: join(root, "content"), language: language.code, fallbackPosts: [] });
  for (const post of posts) {
    const key = `${language.code}:${post.slug}`;
    if (slugs.has(key)) throw new Error(`Duplicate blog slug: ${key}`);
    slugs.add(key);
    total += 1;
    if (post.description.length < 50 || post.description.length > 220) {
      throw new Error(`${key} description should be 50-220 characters.`);
    }
    const wordCount = post.sections.flatMap((section) => section.body).join(" ").split(/\s+/).filter(Boolean).length;
    if (wordCount < 100) throw new Error(`${key} is too short. Add enough body content for a useful article.`);
  }
}

console.log(`Validated ${total} Markdown blog posts across ${blogLanguages.length} languages.`);
