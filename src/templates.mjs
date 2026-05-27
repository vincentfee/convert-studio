function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
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
      <nav class="nav" aria-label="Primary navigation">
        <a href="/#image-tools">Image Tools</a>
        <a href="/#pdf-tools">PDF Tools</a>
        <a href="/privacy/">Privacy</a>
      </nav>
    </header>
    ${children}
    <footer class="footer">
      <div>
        <strong>${escapeHtml(site.name)}</strong>
        <p>Free image and PDF tools for practical file conversion.</p>
      </div>
      <nav aria-label="Footer navigation">
        <a href="/about/">About</a>
        <a href="/privacy/">Privacy</a>
        <a href="/terms/">Terms</a>
        <a href="/contact/">Contact</a>
      </nav>
    </footer>
    <script src="/assets/config.js"></script>
    <script src="/assets/app.js"></script>
  </body>
</html>`;
}

function toolCard(tool) {
  return `<a class="tool-card" href="/${tool.slug}/">
    <span class="tool-kicker">${tool.category} / ${tool.mode === "browser" ? "Private browser tool" : "Secure server tool"}</span>
    <strong>${escapeHtml(tool.title)}</strong>
    <span>${escapeHtml(tool.description)}</span>
  </a>`;
}

function converterBox(tool) {
  return `<section class="converter-panel" data-tool='${escapeHtml(JSON.stringify(tool))}'>
    <div class="mode-pill">${tool.mode === "browser" ? "Runs in your browser" : "Uses secure temporary processing"}</div>
    <label class="dropzone">
      <input class="file-input" type="file" ${tool.action === "merge-pdf" || tool.action === "image-to-pdf" ? "multiple" : ""} accept="${escapeHtml(tool.accept)}" />
      <span class="upload-icon" aria-hidden="true">Up</span>
      <strong>Drop files here or choose files</strong>
      <small>${tool.mode === "browser" ? "Files stay on this device." : "Maximum 50 MB per file. Files expire after 30 minutes."}</small>
    </label>
    ${tool.action === "split-pdf" ? '<label class="option-row">Pages to keep <input class="pages-input" type="text" placeholder="Example: 1-3,5" /></label>' : ""}
    ${tool.action === "resize-image" ? '<label class="option-row">Max width <input class="width-input" type="number" min="100" max="5000" value="1600" /></label>' : ""}
    <button class="primary-btn convert-btn" type="button">Convert now</button>
    <p class="status-text">Choose a file to start.</p>
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
  return pageShell({
    site,
    title: "Free Image and PDF Converter Tools | FileForma",
    description: site.description,
    pathname: "/",
    children: `<main>
      <section class="hero">
        <div class="hero-copy">
          <p class="eyebrow">Free file conversion tools</p>
          <h1>Convert images and PDFs without the clutter.</h1>
          <p class="lede">FileForma gives you fast browser tools for images, practical server tools for PDFs, and clear pages built for people who just need the file converted.</p>
          <div class="hero-actions">
            <a class="primary-link" href="/jpg-to-pdf/">Convert JPG to PDF</a>
            <a class="secondary-link" href="/compress-pdf/">Compress PDF</a>
          </div>
        </div>
        <div class="hero-panel">
          <span class="panel-label">Popular now</span>
          ${[pdfTools[0], pdfTools[2], pdfTools[4], imageTools[2]].map(toolCard).join("")}
        </div>
      </section>
      <section class="tool-section" id="image-tools">
        <p class="eyebrow">Image converter</p>
        <h2>Image tools</h2>
        <div class="tool-list">${imageTools.map(toolCard).join("")}</div>
      </section>
      <div class="ad-slot" aria-label="Advertisement">Advertisement</div>
      <section class="tool-section" id="pdf-tools">
        <p class="eyebrow">PDF converter</p>
        <h2>PDF tools</h2>
        <div class="tool-list">${pdfTools.map(toolCard).join("")}</div>
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
