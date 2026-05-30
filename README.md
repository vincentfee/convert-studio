# FileForma

FileForma is a first-stage SEO-focused image and PDF converter site at [fileforma.com](https://fileforma.com).

The frontend is generated as static HTML with no npm dependencies, so it can be built and served without network access. Browser-safe tools run locally in the user's browser. Server-only PDF and Office tools call the FastAPI backend in `backend/`.

See [docs/MAINTENANCE.md](docs/MAINTENANCE.md) for ongoing maintenance priorities and [docs/FEATURE-MATRIX.md](docs/FEATURE-MATRIX.md) for the iLovePDF feature comparison.

## Run the frontend

```bash
npm run build
npm run dev
```

The static site is served from `dist/` at `http://localhost:4173`.

Point the frontend at a local API during development:

```bash
CONVERT_API_BASE=http://localhost:8000 npm run build
npm run dev
```

## Google Analytics

The static build reads `GA_MEASUREMENT_ID` at build time and injects the GA4 Google tag when the value is present.

```bash
# Linux / macOS
GA_MEASUREMENT_ID="G-XXXXXXXXXX" npm run build

# Windows PowerShell
$env:GA_MEASUREMENT_ID="G-XXXXXXXXXX"; npm run build
```

On Render, add `GA_MEASUREMENT_ID` to the `convert-studio-web` environment variables, then redeploy the static site.

## Run the PDF backend

The backend is designed for Docker because PDF/Office conversion needs system tools such as LibreOffice and Ghostscript.

```bash
cd backend
docker compose up --build
```

The API listens on `http://localhost:8000`. Health check: `GET /health`

## Tools

- **Image (12):** HEIC to JPG, PNG to JPG, JPG to PNG, JPG to WebP, WebP to PNG, WebP to JPG, PNG to WebP, AVIF to JPG, TIFF to JPG, Compress Image, Resize Image, Image to PDF
- **PDF (25):** Merge, Split, Remove/Extract/Organize pages, Compress, Repair, Compare, Word/PowerPoint/Excel to PDF, PDF to JPG/Word, Edit, Rotate, Page numbers, Watermark, Crop, Redact, Sign, OCR, Translate, Unlock, Protect, JPG to PDF

Browser-backed tools never upload files. Server-backed tools use temporary storage and expire after 30 minutes.

## Test converters

Install local test-only dependencies once:

```bash
npm install playwright-core --prefix .test_node --no-save
pip install pillow-heif pypdf python-docx Pillow --target .test_deps --upgrade
```

Run tests (override URLs with environment variables if needed):

```bash
# Server API tests (default: production API)
python3 scripts/test-online-converters.py

# Browser tool tests (default: fileforma.com; builds dist first if missing)
npm run build
node scripts/test-browser-converters.mjs
```

Environment variables:

| Variable | Default | Purpose |
|----------|---------|---------|
| `API_BASE` | `https://convert-studio-pdf-api.onrender.com` | Backend API for server tests |
| `SITE_BASE` | `https://fileforma.com` | Static site for browser tests |
| `CONVERT_API_BASE` | production API | Written into `dist/assets/config.js` at build time |
