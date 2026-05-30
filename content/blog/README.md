# FileForma Blog Content Interface

Add English blog posts as Markdown files in:

```text
content/blog/en/
```

Each public article must use a lowercase hyphenated filename, for example:

```text
content/blog/en/reduce-pdf-size-without-losing-quality.md
```

Files starting with `_` are templates or drafts and are not published.

The site build automatically reads Markdown posts, generates `/blog/{slug}/`, updates `/blog/`, and adds the article to `sitemap.xml`.

