import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

function parseFrontmatter(source, filePath) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) throw new Error(`${filePath} is missing YAML frontmatter.`);
  const [, rawFrontmatter, markdown] = match;
  const data = {};
  let currentListKey = null;

  for (const rawLine of rawFrontmatter.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line.startsWith("- ")) {
      if (!currentListKey) throw new Error(`${filePath} has a list item without a key.`);
      data[currentListKey].push(line.slice(2).trim().replace(/^["']|["']$/g, ""));
      continue;
    }
    const keyMatch = line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/);
    if (!keyMatch) throw new Error(`${filePath} has invalid frontmatter line: ${line}`);
    const [, key, value] = keyMatch;
    if (!value) {
      data[key] = [];
      currentListKey = key;
      continue;
    }
    currentListKey = null;
    const cleanValue = value.trim().replace(/^["']|["']$/g, "");
    if (cleanValue.startsWith("[") && cleanValue.endsWith("]")) {
      data[key] = cleanValue.slice(1, -1).split(",").map((item) => item.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
    } else {
      data[key] = cleanValue;
    }
  }

  return { data, markdown };
}

function markdownToSections(markdown) {
  const sections = [];
  let current = null;

  function flush() {
    if (current && current.body.length) sections.push(current);
  }

  for (const block of markdown.split(/\r?\n\s*\r?\n/)) {
    const text = block.trim();
    if (!text) continue;
    if (text.startsWith("# ")) continue;
    if (text.startsWith("## ")) {
      flush();
      current = { heading: text.replace(/^##\s+/, "").trim(), body: [] };
      continue;
    }
    if (!current) current = { heading: "Overview", body: [] };
    current.body.push(text.replace(/\r?\n/g, " "));
  }
  flush();
  return sections;
}

function validatePost(post, filePath) {
  const required = ["slug", "title", "description", "category", "date"];
  for (const key of required) {
    if (!post[key]) throw new Error(`${filePath} is missing required field: ${key}`);
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug)) {
    throw new Error(`${filePath} has an invalid slug. Use lowercase words separated by hyphens.`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(post.date)) {
    throw new Error(`${filePath} has an invalid date. Use YYYY-MM-DD.`);
  }
  if (!post.sections.length) throw new Error(`${filePath} needs at least one ## section.`);
}

export async function loadMarkdownBlogPosts({ contentRoot, fallbackPosts = [] }) {
  const blogDir = join(contentRoot, "blog", "en");
  let files = [];
  try {
    files = await readdir(blogDir);
  } catch {
    return fallbackPosts;
  }

  const posts = [];
  for (const file of files) {
    if (!file.endsWith(".md") || file.startsWith("_") || file.toLowerCase() === "readme.md") continue;
    const filePath = join(blogDir, file);
    const source = await readFile(filePath, "utf8");
    const { data, markdown } = parseFrontmatter(source, filePath);
    const post = {
      slug: data.slug || file.replace(/\.md$/, ""),
      title: data.title,
      description: data.description,
      category: data.category,
      date: data.date,
      relatedTools: Array.isArray(data.relatedTools) ? data.relatedTools : [],
      sections: markdownToSections(markdown),
    };
    validatePost(post, filePath);
    posts.push(post);
  }

  const existingSlugs = new Set(posts.map((post) => post.slug));
  const merged = [...posts, ...fallbackPosts.filter((post) => !existingSlugs.has(post.slug))];
  return merged.sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
}
