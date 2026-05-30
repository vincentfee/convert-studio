# FileForma

FileForma is a first-stage SEO-focused image and PDF converter site.

The frontend is generated as static HTML with no npm dependencies, so it can be built and served without network access. Browser-safe tools run locally in the user's browser. Server-only PDF and Office tools call the FastAPI backend in `backend/`.

## Run the frontend

```powershell
npm run build
npm run dev
```

The static site is served from `dist/` at `http://localhost:4173`.

## Google Analytics

The static build reads `GA_MEASUREMENT_ID` at build time and injects the GA4 Google tag when the value is present.

```powershell
$env:GA_MEASUREMENT_ID="G-XXXXXXXXXX"
npm run build
```

On Render, add `GA_MEASUREMENT_ID` to the `convert-studio-web` environment variables, then redeploy the static site.

## Run the PDF backend

The backend is designed for Docker because PDF/Office conversion needs system tools such as LibreOffice and Ghostscript.

```powershell
cd backend
docker compose up --build
```

The API listens on `http://localhost:8000`.

## First-stage tools

- Image: HEIC to JPG, PNG to JPG, JPG to PNG, JPG to WebP, WebP to PNG, WebP to JPG, PNG to WebP, AVIF to JPG, TIFF to JPG, Compress Image, Resize Image, Image to PDF
- PDF: Word to PDF, PDF to Word, Compress PDF, PDF to JPG, JPG to PDF, Merge PDF, Split PDF

## Test converters

Install local test-only dependencies once:

```powershell
npm.cmd install playwright-core --prefix .test_node --no-save
& 'C:\Users\totof\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' -m pip install pillow-heif --target .test_deps --upgrade
```

Then run:

```powershell
& 'C:\Users\totof\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' scripts\test-online-converters.py
& 'C:\Users\totof\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts\test-browser-converters.mjs
```

Server-backed tools are marked in the page data. Browser-backed tools never upload files.
