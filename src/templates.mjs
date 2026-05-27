function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
}

function iconSvg(name = "file") {
  const icons = {
    "camera": '<path d="M8 10h4l2-3h8l2 3h4v17H8z"/><circle cx="18" cy="18" r="5"/><path d="M24 13h.01"/>',
    "image-convert": '<rect x="7" y="8" width="18" height="15" rx="2"/><path d="M10 20l4-4 3 3 2-2 4 4"/><path d="M25 12h3v14H12v-3"/><path d="M20 5h5v5"/><path d="M19 11l6-6"/>',
    "image-stack": '<rect x="7" y="7" width="17" height="14" rx="2"/><path d="M10 24h17V10"/><path d="M10 19l4-4 3 3 2-2 3 3"/>',
    "compress": '<path d="M13 7v6H7"/><path d="M19 7v6h6"/><path d="M13 7l-7 7"/><path d="M19 7l7 7"/><path d="M13 25v-6H7"/><path d="M19 25v-6h6"/><path d="M13 25l-7-7"/><path d="M19 25l7-7"/>',
    "resize": '<rect x="8" y="8" width="16" height="16" rx="2"/><path d="M13 13h6v6"/><path d="M12 20l7-7"/>',
    "image-pdf": '<rect x="8" y="7" width="12" height="15" rx="2"/><path d="M11 18l3-3 2 2 2-2 2 2"/><path d="M22 12h4v13H12v-2"/><path d="M17 26h8"/>',
    "merge": '<path d="M8 8h6v6H8z"/><path d="M18 8h6v6h-6z"/><path d="M13 14v4c0 2 1 3 3 3h3"/><path d="M21 18l3 3-3 3"/>',
    "split": '<path d="M8 8h16v6H8z"/><path d="M16 14v5"/><path d="M11 24l5-5 5 5"/><path d="M11 24h10"/>',
    "remove": '<path d="M9 10h14"/><path d="M13 10V7h6v3"/><path d="M12 13l1 12h6l1-12"/><path d="M14 17h4"/>',
    "extract": '<rect x="8" y="7" width="12" height="18" rx="2"/><path d="M20 12h5"/><path d="M22 9l3 3-3 3"/><path d="M11 14h6M11 18h6"/>',
    "organize": '<rect x="8" y="7" width="7" height="7" rx="1"/><rect x="17" y="7" width="7" height="7" rx="1"/><rect x="8" y="17" width="7" height="7" rx="1"/><rect x="17" y="17" width="7" height="7" rx="1"/>',
    "repair": '<path d="M21 8l3 3-8 8-4 1 1-4z"/><path d="M8 24h16"/><path d="M10 10h5"/>',
    "word": '<path d="M8 7h13l4 4v14H8z"/><path d="M21 7v5h4"/><path d="M11 15l2 6 2-6 2 6 2-6"/>',
    "slides": '<path d="M8 7h16v18H8z"/><path d="M12 12h8"/><path d="M12 16h8"/><path d="M12 20h5"/>',
    "sheet": '<path d="M8 7h16v18H8z"/><path d="M8 13h16M8 19h16M14 7v18M19 7v18"/>',
    "pdf-image": '<path d="M8 7h13l4 4v14H8z"/><path d="M21 7v5h4"/><path d="M11 21l4-4 2 2 2-3 3 5"/>',
    "doc": '<path d="M9 7h11l4 4v14H9z"/><path d="M20 7v5h4"/><path d="M12 15h8M12 19h8M12 23h5"/>',
    "rotate": '<path d="M10 11a8 8 0 1 1-1 10"/><path d="M10 6v5h5"/>',
    "number": '<path d="M12 9l-2 14"/><path d="M20 9l-2 14"/><path d="M9 14h14"/><path d="M8 19h14"/>',
    "watermark": '<path d="M8 23l6-16h4l6 16"/><path d="M11 17h10"/><path d="M7 26h18"/>',
    "crop": '<path d="M10 6v16h16"/><path d="M6 10h16v16"/><path d="M16 10v12"/><path d="M10 16h12"/>',
    "unlock": '<rect x="9" y="14" width="15" height="11" rx="2"/><path d="M13 14v-3a5 5 0 0 1 9-3"/>',
    "lock": '<rect x="9" y="14" width="15" height="11" rx="2"/><path d="M13 14v-3a4 4 0 0 1 8 0v3"/>',
    "upload": '<path d="M16 22V8"/><path d="M10 14l6-6 6 6"/><path d="M8 24v3h16v-3"/>',
    "file": '<path d="M9 7h12l4 4v14H9z"/><path d="M21 7v5h4"/><path d="M12 16h9M12 20h6"/>',
  };
  return `<svg viewBox="0 0 32 32" aria-hidden="true">${icons[name] || icons.file}</svg>`;
}

function languageSwitcher(className = "") {
  return `<label class="language-switcher ${className}">
    <span class="visually-hidden">Language</span>
    <select class="language-select" aria-label="Language">
      <option value="en">English</option>
      <option value="es">Español</option>
      <option value="fr">Français</option>
      <option value="de">Deutsch</option>
      <option value="pt">Português</option>
      <option value="ja">日本語</option>
      <option value="ko">한국어</option>
      <option value="zh-CN">中文简体</option>
      <option value="zh-TW">中文繁體</option>
    </select>
  </label>`;
}

function pageShell({ site, title, description, pathname, children }) {
  const canonical = `${site.url}${pathname}`;
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${canonical}" />
    <link rel="stylesheet" href="/assets/app.css" />
  </head>
  <body>
    <header class="topbar">
      <a class="brand" href="/" aria-label="${escapeHtml(site.name)} home">
        <span class="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 40 40" role="img">
            <path class="logo-page" d="M11 5h13l7 7v23H11z" />
            <path class="logo-fold" d="M24 5v8h7" />
            <path class="logo-form" d="M16 18h12M16 24h9M16 30h6" />
          </svg>
        </span>
        <span>${escapeHtml(site.name)}</span>
      </a>
      <div class="nav-actions">
        <nav class="nav" aria-label="Primary navigation">
          <a href="/#image-tools" data-i18n="nav.imageTools">Image Tools</a>
          <a href="/#pdf-tools" data-i18n="nav.pdfTools">PDF Tools</a>
          <a href="/privacy/" data-i18n="nav.privacy">Privacy</a>
        </nav>
        ${languageSwitcher()}
      </div>
    </header>
    ${children}
    <footer class="footer">
      <div>
        <strong>${escapeHtml(site.name)}</strong>
        <p>Free image and PDF tools for practical file conversion.</p>
      </div>
      <nav aria-label="Footer navigation">
        <a href="/about/" data-i18n="footer.about">About</a>
        <a href="/privacy/" data-i18n="nav.privacy">Privacy</a>
        <a href="/terms/" data-i18n="footer.terms">Terms</a>
        <a href="/contact/" data-i18n="footer.contact">Contact</a>
      </nav>
      ${languageSwitcher("footer-language")}
    </footer>
    <script src="/assets/config.js"></script>
    <script src="/assets/app.js"></script>
  </body>
</html>`;
}

function toolCard(tool) {
  return `<a class="tool-card" href="/${tool.slug}/">
    <span class="tool-icon" aria-hidden="true">${iconSvg(tool.icon)}</span>
    <strong>${escapeHtml(tool.title)}</strong>
    <span>${escapeHtml(tool.description)}</span>
  </a>`;
}

function converterBox(tool) {
  const multiple = tool.action === "merge-pdf" || tool.action === "image-to-pdf";
  return `<section class="converter-panel" data-tool='${escapeHtml(JSON.stringify(tool))}'>
    <div class="mode-pill" data-i18n="${tool.mode === "browser" ? "privacy.local" : "privacy.temporary"}">${tool.mode === "browser" ? "Files stay on your device" : "Files deleted after 30 minutes"}</div>
    <label class="dropzone">
      <input class="file-input" type="file" ${multiple ? "multiple" : ""} accept="${escapeHtml(tool.accept)}" />
      <span class="upload-icon" aria-hidden="true">${iconSvg("upload")}</span>
      <strong data-i18n="upload.title">Drop files here or choose files</strong>
      <small data-i18n="${tool.mode === "browser" ? "upload.local" : "upload.server"}">${tool.mode === "browser" ? "Files stay on this device." : "Maximum 50 MB per file. Files expire after 30 minutes."}</small>
    </label>
    ${["split-pdf", "extract-pdf-pages"].includes(tool.action) ? '<label class="option-row">Pages to keep <input class="pages-input" type="text" placeholder="Example: 1-3,5" /></label>' : ""}
    ${tool.action === "remove-pdf-pages" ? '<label class="option-row">Pages to remove <input class="pages-input" type="text" placeholder="Example: 2,4-6" /></label>' : ""}
    ${tool.action === "organize-pdf" ? '<label class="option-row">New page order <input class="pages-input" type="text" placeholder="Example: 3,1,2,4-6" /></label>' : ""}
    ${tool.action === "rotate-pdf" ? '<label class="option-row">Rotation <select class="rotation-input"><option value="90">90 degrees</option><option value="180">180 degrees</option><option value="270">270 degrees</option></select></label>' : ""}
    ${tool.action === "add-watermark" ? '<label class="option-row">Watermark text <input class="text-input" type="text" value="DRAFT" maxlength="80" /></label>' : ""}
    ${tool.action === "crop-pdf" ? '<label class="option-row">Crop margin in points <input class="margin-input" type="number" min="0" max="144" value="24" /></label>' : ""}
    ${["protect-pdf", "unlock-pdf"].includes(tool.action) ? '<label class="option-row">Password <input class="password-input" type="password" placeholder="Enter password" /></label>' : ""}
    ${tool.action === "resize-image" ? '<label class="option-row">Max width <input class="width-input" type="number" min="100" max="5000" value="1600" /></label>' : ""}
    <button class="primary-btn convert-btn" type="button" data-i18n="button.convert">Convert now</button>
    <p class="status-text" data-i18n="status.choose">Choose a file to start.</p>
    <div class="queue-list"></div>
  </section>`;
}

function guideSections(tool, related) {
  return `<section class="content-grid">
    <article>
      <h2>How to convert ${escapeHtml(tool.input)} to ${escapeHtml(tool.output)}</h2>
      <ol>
        <li>Choose your ${escapeHtml(tool.input)} file.</li>
        <li>Start the conversion and wait for the result.</li>
        <li>Download the converted ${escapeHtml(tool.output)} file.</li>
      </ol>
    </article>
    <article>
      <h2>About this tool</h2>
      <p>${escapeHtml(tool.useCase)}</p>
      <p>${tool.mode === "browser" ? "This conversion is handled locally in your browser where possible, which keeps the workflow fast and private." : tool.category === "PDF" ? "This conversion needs server processing because PDF and Office files often require dedicated document engines." : "This conversion needs server processing because this image format is not consistently supported by browsers."}</p>
    </article>
  </section>
  <div class="ad-slot" aria-label="Advertisement">Advertisement</div>
  <section class="faq-section">
    <h2>Frequently asked questions</h2>
    ${tool.faq.map(([q, a]) => `<details><summary>${escapeHtml(q)}</summary><p>${escapeHtml(a)}</p></details>`).join("")}
  </section>
  <section class="related-tools">
    <h2>Related tools</h2>
    <div class="tool-list compact">${related.map(toolCard).join("")}</div>
  </section>`;
}

export function renderHome({ site, imageTools, pdfTools }) {
  const pdfGroups = [...new Set(pdfTools.map((tool) => tool.group || "PDF Tools"))];
  return pageShell({
    site,
    title: "Free Image and PDF Converter Tools | FileForma",
    description: site.description,
    pathname: "/",
    children: `<main>
      <section class="hero">
        <div class="hero-copy">
          <p class="eyebrow">Free PDF and image tools</p>
          <h1>Everyday PDF tools, made obvious.</h1>
          <p class="lede">FileForma brings the most common PDF and image jobs into one clean workspace: merge, split, compress, convert, rotate, watermark, protect, and more.</p>
          <div class="hero-actions">
            <a class="primary-link" href="/merge-pdf/">Merge PDF</a>
            <a class="secondary-link" href="/compress-pdf/">Compress PDF</a>
          </div>
        </div>
        <div class="hero-panel">
          <span class="panel-label">Popular PDF tools</span>
          ${["merge-pdf", "compress-pdf", "pdf-to-word", "jpg-to-pdf"].map((slug) => pdfTools.find((tool) => tool.slug === slug)).filter(Boolean).map(toolCard).join("")}
        </div>
      </section>
      <section class="tool-section" id="pdf-tools">
        <p class="eyebrow">All PDF tools</p>
        <h2>Choose the PDF task you need</h2>
        <div class="tool-tabs" aria-label="PDF tool categories">
          <a href="#pdf-tools">All</a>
          ${pdfGroups.map((group) => `<a href="#${group.toLowerCase().replace(/[^a-z0-9]+/g, "-")}">${escapeHtml(group)}</a>`).join("")}
        </div>
        ${pdfGroups.map((group) => `<section class="tool-group" id="${group.toLowerCase().replace(/[^a-z0-9]+/g, "-")}">
          <h3>${escapeHtml(group)}</h3>
          <div class="tool-list">${pdfTools.filter((tool) => tool.group === group).map(toolCard).join("")}</div>
        </section>`).join("")}
      </section>
      <div class="ad-slot" aria-label="Advertisement">Advertisement</div>
      <section class="tool-section" id="image-tools">
        <p class="eyebrow">Image converter</p>
        <h2>Image tools</h2>
        <div class="tool-list">${imageTools.map(toolCard).join("")}</div>
      </section>
    </main>`,
  });
}

export function renderToolPage({ site, tool, allTools }) {
  const related = allTools.filter((item) => item.slug !== tool.slug && item.category === tool.category).slice(0, 4);
  return pageShell({
    site,
    title: `${tool.title} Online Free | FileForma`,
    description: tool.description,
    pathname: `/${tool.slug}/`,
    children: `<main>
      <section class="tool-hero">
        <div>
          <p class="eyebrow">${tool.category} converter</p>
          <h1>${escapeHtml(tool.title)}</h1>
          <p class="lede">${escapeHtml(tool.description)}</p>
        </div>
        ${converterBox(tool)}
      </section>
      ${guideSections(tool, related)}
    </main>`,
  });
}

export function renderLegalPage({ site, page, allTools }) {
  return pageShell({
    site,
    title: `${page.title} | FileForma`,
    description: page.description,
    pathname: `/${page.slug}/`,
    children: `<main>
      <section class="plain-page">
        <p class="eyebrow">FileForma</p>
        <h1>${escapeHtml(page.title)}</h1>
        <p class="lede">${escapeHtml(page.description)}</p>
        ${page.body.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
      </section>
      <section class="related-tools">
        <h2>Popular tools</h2>
        <div class="tool-list compact">${allTools.slice(0, 4).map(toolCard).join("")}</div>
      </section>
    </main>`,
  });
}
