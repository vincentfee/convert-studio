# FileForma Blog Content Interface

Add blog posts as Markdown files in language-specific folders:

```text
content/blog/en/
content/blog/zh-CN/
content/blog/es/
```

Each public article must use a lowercase hyphenated filename, for example:

```text
content/blog/en/reduce-pdf-size-without-losing-quality.md
```

Files starting with `_` are templates or drafts and are not published.

The site build automatically reads Markdown posts and generates:

```text
/blog/{slug}/
/zh-CN/blog/{slug}/
/es/blog/{slug}/
```

It also updates blog index pages and `sitemap.xml`.
