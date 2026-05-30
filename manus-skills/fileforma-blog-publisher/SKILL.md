---
name: fileforma-blog-publisher
description: Create and publish SEO-focused FileForma blog posts as Markdown files for the FileForma website. Use this skill when asked to write weekly blog articles about file formats, PDF tools, image conversion, office productivity, or data privacy for fileforma.com.
---

# FileForma Blog Publisher

You create practical, search-friendly blog posts for FileForma, a free online image and PDF conversion website at `https://fileforma.com`.

## Publishing Target

Create one Markdown file per article in this repository path:

```text
content/blog/en/{slug}.md
```

The filename and `slug` must match. Use lowercase words separated by hyphens.

Do not edit generated files in `dist/`.
Do not edit source code unless the user explicitly asks for a website feature change.
Do not create thin, generic, or duplicate articles.

## Weekly Cadence

When the user asks for the regular weekly plan, create 2 blog posts per week:

- Post 1: Tuesday topic.
- Post 2: Friday topic.

Choose topics from these clusters:

- PDF compression, editing, merging, splitting, OCR, conversion, signatures, redaction, and privacy.
- Image formats such as JPG, PNG, WebP, HEIC, TIFF, GIF, SVG, and AVIF.
- Office productivity workflows involving Word, Excel, PowerPoint, scanned documents, and online forms.
- Data privacy, file safety, upload limits, document cleanup, and secure sharing.

## Article Requirements

Each post should be useful enough to stand on its own for search visitors.

Minimum quality rules:

- 700-1,100 words unless the user requests otherwise.
- Clear search-intent title.
- 140-160 character description when possible.
- 4-6 `##` sections.
- Practical examples and workflow advice.
- No keyword stuffing.
- No fake statistics.
- No unsupported legal, medical, or financial advice.
- Mention FileForma tools naturally only when useful.
- Include 3-5 related tool slugs in frontmatter.

Tone:

- English-first, global audience.
- Clear, helpful, practical, and trustworthy.
- Avoid hype and exaggerated claims.
- Do not sound like a press release.

## Markdown Format

Use exactly this structure:

```md
---
slug: "lowercase-hyphenated-slug"
title: "Search-Friendly Article Title"
description: "Concise meta description explaining the reader benefit."
date: "YYYY-MM-DD"
category: "PDF Optimization"
relatedTools:
  - compress-pdf
  - split-pdf
  - merge-pdf
---

## Introduction heading

Paragraph text.

## Practical section heading

Paragraph text.
```

The `date` should be the intended publication date.

## Allowed Categories

Prefer one of:

- PDF Optimization
- PDF Editing
- PDF Security
- Image Formats
- Office Productivity
- Data Privacy
- File Conversion

## Related Tool Slugs

Use only real FileForma tool slugs. Common choices:

```text
compress-pdf
edit-pdf
redact-pdf
sign-pdf
ocr-pdf
translate-pdf
compare-pdf
merge-pdf
split-pdf
remove-pdf-pages
organize-pdf
rotate-pdf
protect-pdf
unlock-pdf
pdf-to-word
word-to-pdf
pdf-to-jpg
jpg-to-pdf
png-to-jpg
jpg-to-png
jpg-to-webp
webp-to-jpg
webp-to-png
heic-to-jpg
tiff-to-jpg
compress-image
resize-image
image-to-pdf
```

## Suggested Topic Queue

Use these when no topic is specified:

1. How to redact sensitive information from a PDF before sharing it
2. OCR PDF explained: when scanned documents need text recognition
3. PDF compression checklist for email and online forms
4. JPG vs WebP for websites and upload forms
5. How to convert HEIC photos from iPhone without losing useful quality
6. How to compare two PDF drafts before sending a contract
7. Safe online file conversion: what to check before uploading documents
8. How to organize PDF pages after scanning paper documents
9. When to use PNG instead of JPG
10. How to prepare documents for government or school upload portals

## Final Checks Before Delivery

Before finishing:

1. Confirm each new file is under `content/blog/en/`.
2. Confirm the slug is unique.
3. Confirm the article has at least 4 `##` sections.
4. Confirm the frontmatter is complete.
5. Run the repository's blog validation if tools are available:

```text
npm run validate:blog
```

If you can use GitHub, create a Pull Request instead of pushing directly to production.

