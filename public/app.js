const MAX_FILES = 5;
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const API_BASE = window.CONVERT_API_BASE || "http://localhost:8000";

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function replaceExtension(fileName, ext) {
  return `${fileName.replace(/\.[^/.]+$/, "")}.${ext}`;
}

function makeQueueItem(file, state, url, outputName) {
  const row = document.createElement("article");
  row.className = "queue-item";
  const meta = document.createElement("div");
  const name = document.createElement("div");
  name.className = "file-name";
  name.textContent = file.name;
  const fileState = document.createElement("div");
  fileState.className = "file-state";
  fileState.textContent = state;
  meta.append(name, fileState);
  row.append(meta);

  if (url) {
    const link = document.createElement("a");
    link.className = "download-btn";
    link.href = url;
    link.download = outputName;
    link.textContent = "Download";
    row.append(link);
  }
  return row;
}

function setQueue(panel, rows) {
  const queue = panel.querySelector(".queue-list");
  queue.replaceChildren(...rows);
}

function setStatus(panel, text) {
  panel.querySelector(".status-text").textContent = text;
}

function validateFiles(files, allowMultiple) {
  if (!files.length) throw new Error("Choose at least one file.");
  if (!allowMultiple && files.length > 1) throw new Error("This tool accepts one file at a time.");
  if (files.length > MAX_FILES) throw new Error(`Add up to ${MAX_FILES} files at a time.`);
  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) throw new Error(`${file.name} is larger than 50 MB.`);
  }
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("The image could not be read."));
    };
    img.src = url;
  });
}

async function imageToBlob(file, tool, panel) {
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  const maxWidthInput = panel.querySelector(".width-input");
  const maxWidth = maxWidthInput ? Number(maxWidthInput.value || 1600) : img.naturalWidth;
  const scale = tool.action === "image-resize" ? Math.min(1, maxWidth / img.naturalWidth) : 1;
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
  const ctx = canvas.getContext("2d");
  if (tool.target === "image/jpeg" || tool.action === "image-compress") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const type = tool.action === "image-compress" ? "image/jpeg" : tool.target;
  const quality = tool.action === "image-compress" ? 0.72 : 0.92;
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Conversion failed.")), type, quality);
  });
}

async function imagesToPdf(files) {
  const pages = [];
  for (const file of files) {
    const img = await loadImage(file);
    const canvas = document.createElement("canvas");
    const maxWidth = 1240;
    const scale = Math.min(1, maxWidth / img.naturalWidth);
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    const binary = atob(dataUrl.split(",")[1]);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    pages.push({ width: canvas.width, height: canvas.height, imageBytes: bytes });
  }

  const chunks = [];
  const offsets = [0];
  let length = 0;

  function append(part) {
    const bytes = typeof part === "string" ? new TextEncoder().encode(part) : part;
    chunks.push(bytes);
    length += bytes.length;
  }

  function markObject() {
    offsets.push(length);
  }

  append("%PDF-1.4\n");
  markObject();
  append(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`);
  markObject();
  append(`2 0 obj\n<< /Type /Pages /Kids [${pages.map((_, index) => `${3 + index * 3} 0 R`).join(" ")}] /Count ${pages.length} >>\nendobj\n`);

  pages.forEach((page, index) => {
    const pageObject = 3 + index * 3;
    const imageObject = pageObject + 1;
    const contentObject = pageObject + 2;
    const width = Math.round(page.width * 0.75);
    const height = Math.round(page.height * 0.75);

    markObject();
    append(`${pageObject} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /XObject << /Im${index} ${imageObject} 0 R >> >> /Contents ${contentObject} 0 R >>\nendobj\n`);
    markObject();
    append(`${imageObject} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${page.width} /Height ${page.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${page.imageBytes.length} >>\nstream\n`);
    append(page.imageBytes);
    append("\nendstream\nendobj\n");
    const content = `q\n${width} 0 0 ${height} 0 0 cm\n/Im${index} Do\nQ\n`;
    markObject();
    append(`${contentObject} 0 obj\n<< /Length ${content.length} >>\nstream\n${content}endstream\nendobj\n`);
  });

  const xrefStart = length;
  append(`xref\n0 ${offsets.length}\n0000000000 65535 f \n`);
  offsets.slice(1).forEach((offset) => append(`${String(offset).padStart(10, "0")} 00000 n \n`));
  append(`trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`);
  return new Blob(chunks, { type: "application/pdf" });
}

async function runBrowserTool(panel, tool, files) {
  const rows = [];
  for (const file of files) {
    rows.push(makeQueueItem(file, `${formatBytes(file.size)} · Processing`));
  }
  setQueue(panel, rows);

  if (tool.action === "image-to-pdf") {
    const blob = await imagesToPdf(files);
    const url = URL.createObjectURL(blob);
    const first = files[0];
    setQueue(panel, [makeQueueItem(first, `${formatBytes(blob.size)} · Ready`, url, replaceExtension(first.name, "pdf"))]);
    setStatus(panel, "Conversion complete.");
    return;
  }

  const resultRows = [];
  for (const file of files) {
    try {
      const blob = await imageToBlob(file, tool, panel);
      const url = URL.createObjectURL(blob);
      resultRows.push(makeQueueItem(file, `${formatBytes(blob.size)} · Ready`, url, replaceExtension(file.name, tool.extension)));
    } catch (error) {
      resultRows.push(makeQueueItem(file, error.message || "Conversion failed."));
    }
    setQueue(panel, resultRows);
  }
  setStatus(panel, "Conversion complete.");
}

async function runServerTool(panel, tool, files) {
  const form = new FormData();
  form.append("tool", tool.action);
  form.append("targetFormat", tool.output);
  const pagesInput = panel.querySelector(".pages-input");
  if (pagesInput) form.append("pages", pagesInput.value || "1");
  files.forEach((file) => form.append("files", file));

  setQueue(panel, files.map((file) => makeQueueItem(file, `${formatBytes(file.size)} · Uploading`)));
  const createResponse = await fetch(`${API_BASE}/api/jobs`, { method: "POST", body: form });
  if (!createResponse.ok) {
    const error = await createResponse.json().catch(() => ({}));
    throw new Error(error.detail || "The conversion server rejected this file.");
  }
  const job = await createResponse.json();
  setStatus(panel, "Processing on the conversion server.");

  let current = job;
  for (let attempt = 0; attempt < 120; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const response = await fetch(`${API_BASE}/api/jobs/${job.jobId}`);
    current = await response.json();
    setQueue(panel, files.map((file) => makeQueueItem(file, `${formatBytes(file.size)} · ${current.status}`)));
    if (current.status === "done" || current.status === "failed") break;
  }

  if (current.status !== "done") throw new Error(current.error || "Conversion failed or timed out.");
  const downloadUrl = `${API_BASE}/api/jobs/${job.jobId}/download`;
  setQueue(panel, [makeQueueItem(files[0], "Ready · expires in 30 minutes", downloadUrl, current.outputName || "converted-file")]);
  setStatus(panel, "Conversion complete.");
}

function setupPanel(panel) {
  const tool = JSON.parse(panel.dataset.tool);
  const input = panel.querySelector(".file-input");
  const dropzone = panel.querySelector(".dropzone");
  const button = panel.querySelector(".convert-btn");

  dropzone.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropzone.classList.add("is-dragging");
  });
  dropzone.addEventListener("dragleave", () => dropzone.classList.remove("is-dragging"));
  dropzone.addEventListener("drop", (event) => {
    event.preventDefault();
    dropzone.classList.remove("is-dragging");
    input.files = event.dataTransfer.files;
    setStatus(panel, `${input.files.length} file(s) selected.`);
  });
  input.addEventListener("change", () => setStatus(panel, `${input.files.length} file(s) selected.`));

  button.addEventListener("click", async () => {
    button.disabled = true;
    try {
      const files = Array.from(input.files || []);
      validateFiles(files, input.multiple);
      setStatus(panel, "Starting conversion.");
      if (tool.mode === "browser") {
        await runBrowserTool(panel, tool, files);
      } else {
        await runServerTool(panel, tool, files);
      }
    } catch (error) {
      setStatus(panel, error.message || "Conversion failed.");
    } finally {
      button.disabled = false;
    }
  });
}

document.querySelectorAll(".converter-panel").forEach(setupPanel);
