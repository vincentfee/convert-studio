# Convert Studio

Convert Studio is a first-stage SEO-focused image and PDF converter site.

The frontend is generated as static HTML with no npm dependencies, so it can be built and served without network access. Browser-safe tools run locally in the user's browser. Server-only PDF and Office tools call the FastAPI backend in `backend/`.

## Run the frontend

```powershell
npm run build
npm run dev
```

The static site is served from `dist/` at `http://localhost:4173`.

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

Server-backed tools are marked in the page data. Browser-backed tools never upload files.
