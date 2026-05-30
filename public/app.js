const MAX_FILES = 5;
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const API_BASE = window.CONVERT_API_BASE || "http://localhost:8000";
const I18N = {
  en: {
    "nav.imageTools": "Image Tools",
    "nav.pdfTools": "PDF Tools",
    "nav.privacy": "Privacy",
    "footer.about": "About",
    "footer.terms": "Terms",
    "footer.contact": "Contact",
    "privacy.local": "Files stay on your device",
    "privacy.temporary": "Files deleted after 30 minutes",
    "upload.title": "Drop files here or choose files",
    "upload.local": "Files stay on this device.",
    "upload.server": "Maximum 50 MB per file. Files expire after 30 minutes.",
    "button.convert": "Convert now",
    "button.download": "Download",
    "status.choose": "Choose a file to start.",
    "status.selected": "{count} file(s) selected.",
    "status.starting": "Starting conversion.",
    "status.processing": "Processing",
    "status.ready": "Ready",
    "status.complete": "Conversion complete.",
    "status.uploading": "Uploading",
    "status.server": "Processing on the conversion server.",
    "status.expires": "Ready / expires in 30 minutes",
    "error.choose": "Choose at least one file.",
    "error.one": "This tool accepts one file at a time.",
    "error.max": "Add up to {max} files at a time.",
    "error.large": "{name} is larger than 50 MB.",
    "error.imageRead": "The image could not be read.",
    "error.failed": "Conversion failed.",
    "error.rejected": "The conversion server rejected this file.",
    "error.timeout": "Conversion failed or timed out.",
    "error.compareTwo": "Choose exactly two PDF files for comparison.",
  },
  es: {
    "nav.imageTools": "Herramientas de imagen", "nav.pdfTools": "Herramientas PDF", "nav.privacy": "Privacidad", "footer.about": "Acerca de", "footer.terms": "Términos", "footer.contact": "Contacto", "privacy.local": "Los archivos quedan en tu dispositivo", "privacy.temporary": "Archivos eliminados tras 30 minutos", "upload.title": "Suelta archivos aquí o elígelos", "upload.local": "Los archivos permanecen en este dispositivo.", "upload.server": "Máximo 50 MB por archivo. Se eliminan tras 30 minutos.", "button.convert": "Convertir ahora", "button.download": "Descargar", "status.choose": "Elige un archivo para empezar.", "status.selected": "{count} archivo(s) seleccionado(s).", "status.starting": "Iniciando conversión.", "status.processing": "Procesando", "status.ready": "Listo", "status.complete": "Conversión completada.", "status.uploading": "Subiendo", "status.server": "Procesando en el servidor.", "status.expires": "Listo / expira en 30 minutos", "error.choose": "Elige al menos un archivo.", "error.one": "Esta herramienta acepta un archivo cada vez.", "error.max": "Añade hasta {max} archivos cada vez.", "error.large": "{name} supera los 50 MB.", "error.imageRead": "No se pudo leer la imagen.", "error.failed": "La conversión falló.", "error.rejected": "El servidor rechazó este archivo.", "error.timeout": "La conversión falló o agotó el tiempo.",
  },
  fr: {
    "nav.imageTools": "Outils image", "nav.pdfTools": "Outils PDF", "nav.privacy": "Confidentialité", "footer.about": "À propos", "footer.terms": "Conditions", "footer.contact": "Contact", "privacy.local": "Les fichiers restent sur votre appareil", "privacy.temporary": "Fichiers supprimés après 30 minutes", "upload.title": "Déposez les fichiers ici ou choisissez-les", "upload.local": "Les fichiers restent sur cet appareil.", "upload.server": "50 Mo maximum par fichier. Suppression après 30 minutes.", "button.convert": "Convertir", "button.download": "Télécharger", "status.choose": "Choisissez un fichier pour commencer.", "status.selected": "{count} fichier(s) sélectionné(s).", "status.starting": "Démarrage de la conversion.", "status.processing": "Traitement", "status.ready": "Prêt", "status.complete": "Conversion terminée.", "status.uploading": "Envoi", "status.server": "Traitement sur le serveur.", "status.expires": "Prêt / expire dans 30 minutes", "error.choose": "Choisissez au moins un fichier.", "error.one": "Cet outil accepte un fichier à la fois.", "error.max": "Ajoutez jusqu'à {max} fichiers à la fois.", "error.large": "{name} dépasse 50 Mo.", "error.imageRead": "Impossible de lire l'image.", "error.failed": "La conversion a échoué.", "error.rejected": "Le serveur a refusé ce fichier.", "error.timeout": "La conversion a échoué ou a expiré.",
  },
  de: {
    "nav.imageTools": "Bild-Tools", "nav.pdfTools": "PDF-Tools", "nav.privacy": "Datenschutz", "footer.about": "Über uns", "footer.terms": "Bedingungen", "footer.contact": "Kontakt", "privacy.local": "Dateien bleiben auf Ihrem Gerät", "privacy.temporary": "Dateien nach 30 Minuten gelöscht", "upload.title": "Dateien hier ablegen oder auswählen", "upload.local": "Dateien bleiben auf diesem Gerät.", "upload.server": "Maximal 50 MB pro Datei. Löschung nach 30 Minuten.", "button.convert": "Jetzt konvertieren", "button.download": "Herunterladen", "status.choose": "Datei auswählen, um zu starten.", "status.selected": "{count} Datei(en) ausgewählt.", "status.starting": "Konvertierung startet.", "status.processing": "Verarbeitung", "status.ready": "Bereit", "status.complete": "Konvertierung abgeschlossen.", "status.uploading": "Hochladen", "status.server": "Verarbeitung auf dem Server.", "status.expires": "Bereit / läuft in 30 Minuten ab", "error.choose": "Wählen Sie mindestens eine Datei.", "error.one": "Dieses Tool akzeptiert jeweils eine Datei.", "error.max": "Fügen Sie bis zu {max} Dateien hinzu.", "error.large": "{name} ist größer als 50 MB.", "error.imageRead": "Das Bild konnte nicht gelesen werden.", "error.failed": "Konvertierung fehlgeschlagen.", "error.rejected": "Der Server hat diese Datei abgelehnt.", "error.timeout": "Konvertierung fehlgeschlagen oder abgelaufen.",
  },
  pt: {
    "nav.imageTools": "Ferramentas de imagem", "nav.pdfTools": "Ferramentas PDF", "nav.privacy": "Privacidade", "footer.about": "Sobre", "footer.terms": "Termos", "footer.contact": "Contato", "privacy.local": "Arquivos ficam no seu dispositivo", "privacy.temporary": "Arquivos excluídos após 30 minutos", "upload.title": "Solte arquivos aqui ou escolha arquivos", "upload.local": "Os arquivos ficam neste dispositivo.", "upload.server": "Máximo de 50 MB por arquivo. Expiram em 30 minutos.", "button.convert": "Converter agora", "button.download": "Baixar", "status.choose": "Escolha um arquivo para começar.", "status.selected": "{count} arquivo(s) selecionado(s).", "status.starting": "Iniciando conversão.", "status.processing": "Processando", "status.ready": "Pronto", "status.complete": "Conversão concluída.", "status.uploading": "Enviando", "status.server": "Processando no servidor.", "status.expires": "Pronto / expira em 30 minutos", "error.choose": "Escolha pelo menos um arquivo.", "error.one": "Esta ferramenta aceita um arquivo por vez.", "error.max": "Adicione até {max} arquivos por vez.", "error.large": "{name} tem mais de 50 MB.", "error.imageRead": "A imagem não pôde ser lida.", "error.failed": "Falha na conversão.", "error.rejected": "O servidor rejeitou este arquivo.", "error.timeout": "A conversão falhou ou expirou.",
  },
  ja: {
    "nav.imageTools": "画像ツール", "nav.pdfTools": "PDFツール", "nav.privacy": "プライバシー", "footer.about": "概要", "footer.terms": "利用規約", "footer.contact": "連絡先", "privacy.local": "ファイルは端末に残ります", "privacy.temporary": "ファイルは30分後に削除", "upload.title": "ここにファイルをドロップ、または選択", "upload.local": "ファイルはこの端末に残ります。", "upload.server": "1ファイル最大50MB。30分後に削除されます。", "button.convert": "変換する", "button.download": "ダウンロード", "status.choose": "ファイルを選択して開始します。", "status.selected": "{count} 件のファイルを選択しました。", "status.starting": "変換を開始しています。", "status.processing": "処理中", "status.ready": "準備完了", "status.complete": "変換が完了しました。", "status.uploading": "アップロード中", "status.server": "サーバーで処理中です。", "status.expires": "準備完了 / 30分後に期限切れ", "error.choose": "少なくとも1つのファイルを選択してください。", "error.one": "このツールは1回に1ファイルのみ対応します。", "error.max": "一度に最大{max}ファイルまで追加できます。", "error.large": "{name} は50MBを超えています。", "error.imageRead": "画像を読み込めませんでした。", "error.failed": "変換に失敗しました。", "error.rejected": "サーバーがこのファイルを拒否しました。", "error.timeout": "変換に失敗したかタイムアウトしました。",
  },
  ko: {
    "nav.imageTools": "이미지 도구", "nav.pdfTools": "PDF 도구", "nav.privacy": "개인정보", "footer.about": "소개", "footer.terms": "약관", "footer.contact": "문의", "privacy.local": "파일은 기기에 남습니다", "privacy.temporary": "파일은 30분 후 삭제됩니다", "upload.title": "파일을 여기로 놓거나 선택하세요", "upload.local": "파일은 이 기기에 남아 있습니다.", "upload.server": "파일당 최대 50MB. 30분 후 만료됩니다.", "button.convert": "지금 변환", "button.download": "다운로드", "status.choose": "시작하려면 파일을 선택하세요.", "status.selected": "{count}개 파일 선택됨.", "status.starting": "변환 시작 중.", "status.processing": "처리 중", "status.ready": "완료", "status.complete": "변환 완료.", "status.uploading": "업로드 중", "status.server": "서버에서 처리 중.", "status.expires": "완료 / 30분 후 만료", "error.choose": "파일을 하나 이상 선택하세요.", "error.one": "이 도구는 한 번에 하나의 파일만 허용합니다.", "error.max": "한 번에 최대 {max}개 파일을 추가하세요.", "error.large": "{name}은 50MB보다 큽니다.", "error.imageRead": "이미지를 읽을 수 없습니다.", "error.failed": "변환 실패.", "error.rejected": "서버가 이 파일을 거부했습니다.", "error.timeout": "변환 실패 또는 시간 초과.",
  },
  "zh-CN": {
    "nav.imageTools": "图片工具", "nav.pdfTools": "PDF 工具", "nav.privacy": "隐私", "footer.about": "关于", "footer.terms": "条款", "footer.contact": "联系", "privacy.local": "文件留在你的设备上", "privacy.temporary": "文件 30 分钟后删除", "upload.title": "拖入文件或选择文件", "upload.local": "文件会留在你的设备上。", "upload.server": "单个文件最大 50 MB，30 分钟后自动过期。", "button.convert": "开始转换", "button.download": "下载", "status.choose": "请选择文件开始。", "status.selected": "已选择 {count} 个文件。", "status.starting": "正在开始转换。", "status.processing": "处理中", "status.ready": "已完成", "status.complete": "转换完成。", "status.uploading": "上传中", "status.server": "正在服务器上处理。", "status.expires": "已完成 / 30 分钟后过期", "error.choose": "请至少选择一个文件。", "error.one": "这个工具一次只能处理一个文件。", "error.max": "一次最多添加 {max} 个文件。", "error.large": "{name} 超过 50 MB。", "error.imageRead": "无法读取这张图片。", "error.failed": "转换失败。", "error.rejected": "转换服务器拒绝了这个文件。", "error.timeout": "转换失败或超时。",
  },
  "zh-TW": {
    "nav.imageTools": "圖片工具", "nav.pdfTools": "PDF 工具", "nav.privacy": "隱私", "footer.about": "關於", "footer.terms": "條款", "footer.contact": "聯絡", "privacy.local": "檔案保留在你的裝置上", "privacy.temporary": "檔案 30 分鐘後刪除", "upload.title": "拖入檔案或選擇檔案", "upload.local": "檔案會保留在你的裝置上。", "upload.server": "單一檔案最大 50 MB，30 分鐘後自動過期。", "button.convert": "開始轉換", "button.download": "下載", "status.choose": "請選擇檔案開始。", "status.selected": "已選擇 {count} 個檔案。", "status.starting": "正在開始轉換。", "status.processing": "處理中", "status.ready": "已完成", "status.complete": "轉換完成。", "status.uploading": "上傳中", "status.server": "正在伺服器上處理。", "status.expires": "已完成 / 30 分鐘後過期", "error.choose": "請至少選擇一個檔案。", "error.one": "這個工具一次只能處理一個檔案。", "error.max": "一次最多加入 {max} 個檔案。", "error.large": "{name} 超過 50 MB。", "error.imageRead": "無法讀取這張圖片。", "error.failed": "轉換失敗。", "error.rejected": "轉換伺服器拒絕了這個檔案。", "error.timeout": "轉換失敗或逾時。",
  },
};
let currentLanguage = localStorage.getItem("fileforma-language") || "en";

function t(key, values = {}) {
  const message = (I18N[currentLanguage] && I18N[currentLanguage][key]) || I18N.en[key] || key;
  return message.replace(/\{(\w+)\}/g, (_, name) => values[name] ?? "");
}

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
    link.textContent = t("button.download");
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

function isPdfFile(file) {
  return file.type === "application/pdf" || /\.pdf$/i.test(file.name);
}

function clearPdfPreview(panel) {
  const preview = panel.querySelector(".pdf-preview");
  if (!preview) return;
  const previousUrl = preview.dataset.objectUrl;
  if (previousUrl) URL.revokeObjectURL(previousUrl);
  preview.dataset.objectUrl = "";
  preview.hidden = true;
  const frame = preview.querySelector(".pdf-preview-frame");
  if (frame) frame.removeAttribute("src");
  preview.querySelector(".pdf-preview-name").textContent = "";
  preview.querySelector(".preview-file-list").replaceChildren();
}

function renderPdfPreview(panel, files) {
  const preview = panel.querySelector(".pdf-preview");
  if (!preview) return;
  clearPdfPreview(panel);
  const pdfFiles = files.filter(isPdfFile);
  if (!pdfFiles.length) return;

  const list = preview.querySelector(".preview-file-list");
  list.replaceChildren(...pdfFiles.slice(0, 2).map((file, index) => {
    const item = document.createElement("span");
    item.textContent = `${index + 1}. ${file.name}`;
    return item;
  }));

  const url = URL.createObjectURL(pdfFiles[0]);
  preview.dataset.objectUrl = url;
  preview.querySelector(".pdf-preview-name").textContent = pdfFiles[0].name;
  preview.querySelector(".pdf-preview-frame").src = `${url}#toolbar=0&navpanes=0`;
  preview.hidden = false;
}

function validateFiles(files, tool, allowMultiple) {
  if (!files.length) throw new Error(t("error.choose"));
  if (tool.action === "compare-pdf" && files.length !== 2) throw new Error(t("error.compareTwo"));
  if (!allowMultiple && files.length > 1) throw new Error(t("error.one"));
  if (files.length > MAX_FILES) throw new Error(t("error.max", { max: MAX_FILES }));
  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) throw new Error(t("error.large", { name: file.name }));
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
      reject(new Error(t("error.imageRead")));
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
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error(t("error.failed"))), type, quality);
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
    rows.push(makeQueueItem(file, `${formatBytes(file.size)} / ${t("status.processing")}`));
  }
  setQueue(panel, rows);

  if (tool.action === "image-to-pdf") {
    const blob = await imagesToPdf(files);
    const url = URL.createObjectURL(blob);
    const first = files[0];
    setQueue(panel, [makeQueueItem(first, `${formatBytes(blob.size)} / ${t("status.ready")}`, url, replaceExtension(first.name, "pdf"))]);
    setStatus(panel, t("status.complete"));
    return;
  }

  const resultRows = [];
  for (const file of files) {
    try {
      const blob = await imageToBlob(file, tool, panel);
      const url = URL.createObjectURL(blob);
      resultRows.push(makeQueueItem(file, `${formatBytes(blob.size)} / ${t("status.ready")}`, url, replaceExtension(file.name, tool.extension)));
    } catch (error) {
      resultRows.push(makeQueueItem(file, error.message || t("error.failed")));
    }
    setQueue(panel, resultRows);
  }
  setStatus(panel, t("status.complete"));
}

async function runServerTool(panel, tool, files) {
  const form = new FormData();
  form.append("tool", tool.action);
  form.append("targetFormat", tool.output);
  const pagesInput = panel.querySelector(".pages-input");
  if (pagesInput) form.append("pages", pagesInput.value || "1");
  const rotationInput = panel.querySelector(".rotation-input");
  if (rotationInput) form.append("rotation", rotationInput.value || "90");
  const textInput = panel.querySelector(".text-input");
  if (textInput) form.append("text", textInput.value || "DRAFT");
  const pageInput = panel.querySelector(".page-input");
  if (pageInput) form.append("page", pageInput.value || "1");
  const targetLanguageInput = panel.querySelector(".target-language-input");
  if (targetLanguageInput) form.append("targetLanguage", targetLanguageInput.value || "English");
  const marginInput = panel.querySelector(".margin-input");
  if (marginInput) form.append("margin", marginInput.value || "24");
  const passwordInput = panel.querySelector(".password-input");
  if (passwordInput) form.append("password", passwordInput.value || "");
  files.forEach((file) => form.append("files", file));

  setQueue(panel, files.map((file) => makeQueueItem(file, `${formatBytes(file.size)} / ${t("status.uploading")}`)));
  const createResponse = await fetch(`${API_BASE}/api/jobs`, { method: "POST", body: form });
  if (!createResponse.ok) {
    const error = await createResponse.json().catch(() => ({}));
    throw new Error(error.detail || t("error.rejected"));
  }
  const job = await createResponse.json();
  setStatus(panel, t("status.server"));

  let current = job;
  for (let attempt = 0; attempt < 120; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const response = await fetch(`${API_BASE}/api/jobs/${job.jobId}`);
    current = await response.json();
    setQueue(panel, files.map((file) => makeQueueItem(file, `${formatBytes(file.size)} / ${current.status}`)));
    if (current.status === "done" || current.status === "failed") break;
  }

  if (current.status !== "done") throw new Error(current.error || t("error.timeout"));
  const downloadUrl = `${API_BASE}/api/jobs/${job.jobId}/download`;
  setQueue(panel, [makeQueueItem(files[0], t("status.expires"), downloadUrl, current.outputName || "converted-file")]);
  setStatus(panel, t("status.complete"));
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
    renderPdfPreview(panel, Array.from(input.files || []));
    setStatus(panel, t("status.selected", { count: input.files.length }));
  });
  input.addEventListener("change", () => {
    renderPdfPreview(panel, Array.from(input.files || []));
    setStatus(panel, t("status.selected", { count: input.files.length }));
  });

  button.addEventListener("click", async () => {
    button.disabled = true;
    try {
      const files = Array.from(input.files || []);
      validateFiles(files, tool, input.multiple);
      setStatus(panel, t("status.starting"));
      if (tool.mode === "browser") {
        await runBrowserTool(panel, tool, files);
      } else {
        await runServerTool(panel, tool, files);
      }
    } catch (error) {
      setStatus(panel, error.message || t("error.failed"));
    } finally {
      button.disabled = false;
    }
  });
}

function applyLanguage(language) {
  currentLanguage = I18N[language] ? language : "en";
  localStorage.setItem("fileforma-language", currentLanguage);
  document.documentElement.lang = currentLanguage;
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  document.querySelectorAll(".language-select").forEach((select) => {
    select.value = currentLanguage;
  });
}

document.querySelectorAll(".language-select").forEach((select) => {
  select.addEventListener("change", () => applyLanguage(select.value));
});

applyLanguage(currentLanguage);
document.querySelectorAll(".converter-panel").forEach(setupPanel);
