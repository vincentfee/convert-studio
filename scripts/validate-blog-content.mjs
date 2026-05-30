import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadMarkdownBlogPosts } from "./load-blog-posts.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const posts = await loadMarkdownBlogPosts({ contentRoot: join(root, "content"), fallbackPosts: [] });
const slugs = new Set();

for (const post of posts) {
  if (slugs.has(post.slug)) throw new Error(`Duplicate blog slug: ${post.slug}`);
  slugs.add(post.slug);
  if (post.description.length < 80 || post.description.length > 180) {
    throw new Error(`${post.slug} description should be 80-180 characters.`);
  }
  const wordCount = post.sections.flatMap((section) => section.body).join(" ").split(/\s+/).filter(Boolean).length;
  if (wordCount < 450) throw new Error(`${post.slug} is too short. Aim for at least 450 words.`);
}

console.log(`Validated ${posts.length} Markdown blog posts.`);
