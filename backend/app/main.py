from __future__ import annotations

import os
import shutil
import subprocess
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Annotated
from zipfile import ZIP_DEFLATED, ZipFile

import fitz
from fastapi import BackgroundTasks, FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from PIL import Image, ImageOps
from pillow_heif import register_heif_opener
from pdf2docx import Converter
from pypdf import PdfReader, PdfWriter

MAX_FILES = 5
MAX_FILE_SIZE = 50 * 1024 * 1024
EXPIRY_MINUTES = 30
STORAGE_DIR = Path(os.getenv("CONVERT_STORAGE_DIR", "/tmp/convert-studio"))
ALLOWED_TOOLS = {
    "heic-to-jpg",
    "tiff-to-jpg",
    "word-to-pdf",
    "powerpoint-to-pdf",
    "excel-to-pdf",
    "pdf-to-word",
    "compress-pdf",
    "repair-pdf",
    "pdf-to-jpg",
    "merge-pdf",
    "split-pdf",
    "remove-pdf-pages",
    "extract-pdf-pages",
    "organize-pdf",
    "rotate-pdf",
    "add-page-numbers",
    "add-watermark",
    "crop-pdf",
    "unlock-pdf",
    "protect-pdf",
}
ALLOWED_EXTENSIONS = {
    "heic-to-jpg": {".heic", ".heif"},
    "tiff-to-jpg": {".tif", ".tiff"},
    "word-to-pdf": {".doc", ".docx"},
    "powerpoint-to-pdf": {".ppt", ".pptx"},
    "excel-to-pdf": {".xls", ".xlsx"},
    "pdf-to-word": {".pdf"},
    "compress-pdf": {".pdf"},
    "repair-pdf": {".pdf"},
    "pdf-to-jpg": {".pdf"},
    "merge-pdf": {".pdf"},
    "split-pdf": {".pdf"},
    "remove-pdf-pages": {".pdf"},
    "extract-pdf-pages": {".pdf"},
    "organize-pdf": {".pdf"},
    "rotate-pdf": {".pdf"},
    "add-page-numbers": {".pdf"},
    "add-watermark": {".pdf"},
    "crop-pdf": {".pdf"},
    "unlock-pdf": {".pdf"},
    "protect-pdf": {".pdf"},
}
RATE_LIMIT_WINDOW_SECONDS = 60
RATE_LIMIT_MAX_JOBS = 12

app = FastAPI(title="FileForma PDF API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

jobs: dict[str, dict] = {}
rate_limits: dict[str, list[datetime]] = {}
register_heif_opener()


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def safe_name(name: str) -> str:
    cleaned = "".join(char for char in name if char.isalnum() or char in {".", "-", "_"}).strip(".")
    return cleaned or "file"


def job_dir(job_id: str) -> Path:
    return STORAGE_DIR / job_id


def set_failed(job_id: str, error: str) -> None:
    jobs[job_id]["status"] = "failed"
    jobs[job_id]["error"] = error


def check_rate_limit(client_id: str) -> None:
    cutoff = now_utc() - timedelta(seconds=RATE_LIMIT_WINDOW_SECONDS)
    recent = [stamp for stamp in rate_limits.get(client_id, []) if stamp > cutoff]
    if len(recent) >= RATE_LIMIT_MAX_JOBS:
        raise HTTPException(status_code=429, detail="Too many conversion requests. Please try again in a minute.")
    recent.append(now_utc())
    rate_limits[client_id] = recent


def validate_file_names(tool: str, files: list[UploadFile]) -> None:
    allowed = ALLOWED_EXTENSIONS[tool]
    for file in files:
        suffix = Path(file.filename or "").suffix.lower()
        if suffix not in allowed:
            raise HTTPException(status_code=400, detail=f"{file.filename or 'file'} is not supported for this tool.")


async def save_uploads(job_id: str, files: list[UploadFile]) -> list[Path]:
    folder = job_dir(job_id)
    folder.mkdir(parents=True, exist_ok=True)
    saved: list[Path] = []
    for file in files:
        target = folder / safe_name(file.filename or "upload")
        size = 0
        with target.open("wb") as output:
            while chunk := await file.read(1024 * 1024):
                size += len(chunk)
                if size > MAX_FILE_SIZE:
                    raise HTTPException(status_code=413, detail=f"{file.filename} is larger than 50 MB.")
                output.write(chunk)
        saved.append(target)
    return saved


def run_command(command: list[str], cwd: Path) -> None:
    result = subprocess.run(command, cwd=cwd, capture_output=True, text=True, timeout=180)
    if result.returncode != 0:
        raise RuntimeError((result.stderr or result.stdout or "Command failed").strip())


def convert_office_to_pdf(inputs: list[Path], folder: Path) -> Path:
    source = inputs[0]
    run_command(["libreoffice", "--headless", "--convert-to", "pdf", "--outdir", str(folder), str(source)], folder)
    output = folder / f"{source.stem}.pdf"
    if not output.exists():
        raise RuntimeError("LibreOffice did not create a PDF.")
    return output


def convert_pdf_to_word(inputs: list[Path], folder: Path) -> Path:
    source = inputs[0]
    output = folder / f"{source.stem}.docx"
    converter = Converter(str(source))
    try:
        converter.convert(str(output), start=0, end=None)
    finally:
        converter.close()
    return output


def compress_pdf(inputs: list[Path], folder: Path) -> Path:
    source = inputs[0]
    output = folder / f"{source.stem}-compressed.pdf"
    run_command(
        [
            "gs",
            "-sDEVICE=pdfwrite",
            "-dCompatibilityLevel=1.4",
            "-dPDFSETTINGS=/ebook",
            "-dNOPAUSE",
            "-dQUIET",
            "-dBATCH",
            f"-sOutputFile={output}",
            str(source),
        ],
        folder,
    )
    return output


def pdf_to_jpg(inputs: list[Path], folder: Path) -> Path:
    source = inputs[0]
    output_zip = folder / f"{source.stem}-jpg.zip"
    document = fitz.open(source)
    try:
        with ZipFile(output_zip, "w", ZIP_DEFLATED) as archive:
            for index, page in enumerate(document, start=1):
                pixmap = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
                image_path = folder / f"{source.stem}-page-{index}.jpg"
                pixmap.save(image_path)
                archive.write(image_path, image_path.name)
    finally:
        document.close()
    return output_zip


def image_to_jpg(inputs: list[Path], folder: Path) -> Path:
    source = inputs[0]
    output = folder / f"{source.stem}.jpg"
    with Image.open(source) as image:
        image = ImageOps.exif_transpose(image)
        if image.mode not in {"RGB", "L"}:
            background = Image.new("RGB", image.size, (255, 255, 255))
            if "A" in image.getbands():
                background.paste(image, mask=image.getchannel("A"))
                image = background
            else:
                image = image.convert("RGB")
        else:
            image = image.convert("RGB")
        image.save(output, "JPEG", quality=92, optimize=True)
    return output


def merge_pdf(inputs: list[Path], folder: Path) -> Path:
    writer = PdfWriter()
    for source in inputs:
        reader = PdfReader(str(source))
        for page in reader.pages:
            writer.add_page(page)
    output = folder / "merged.pdf"
    with output.open("wb") as handle:
        writer.write(handle)
    return output


def copy_reader_pages(reader: PdfReader, page_indexes: list[int], output: Path) -> Path:
    writer = PdfWriter()
    for page_index in page_indexes:
        writer.add_page(reader.pages[page_index])
    with output.open("wb") as handle:
        writer.write(handle)
    return output


def parse_pages(spec: str, total: int) -> list[int]:
    pages: list[int] = []
    for part in spec.replace(" ", "").split(","):
        if not part:
            continue
        if "-" in part:
            start, end = part.split("-", 1)
            pages.extend(range(int(start), int(end) + 1))
        else:
            pages.append(int(part))
    normalized = [page - 1 for page in pages if 1 <= page <= total]
    if not normalized:
        raise RuntimeError("No valid pages were selected.")
    return normalized


def split_pdf(inputs: list[Path], folder: Path, page_spec: str) -> Path:
    source = inputs[0]
    reader = PdfReader(str(source))
    output = folder / f"{source.stem}-pages.pdf"
    return copy_reader_pages(reader, parse_pages(page_spec, len(reader.pages)), output)


def remove_pdf_pages(inputs: list[Path], folder: Path, page_spec: str) -> Path:
    source = inputs[0]
    reader = PdfReader(str(source))
    remove = set(parse_pages(page_spec, len(reader.pages)))
    keep = [index for index in range(len(reader.pages)) if index not in remove]
    if not keep:
        raise RuntimeError("You cannot remove every page from a PDF.")
    output = folder / f"{source.stem}-removed-pages.pdf"
    return copy_reader_pages(reader, keep, output)


def organize_pdf(inputs: list[Path], folder: Path, page_spec: str) -> Path:
    source = inputs[0]
    reader = PdfReader(str(source))
    output = folder / f"{source.stem}-organized.pdf"
    return copy_reader_pages(reader, parse_pages(page_spec, len(reader.pages)), output)


def rotate_pdf(inputs: list[Path], folder: Path, rotation: str | None) -> Path:
    source = inputs[0]
    angle = int(rotation or "90")
    if angle not in {90, 180, 270}:
        raise RuntimeError("Rotation must be 90, 180, or 270 degrees.")
    reader = PdfReader(str(source))
    writer = PdfWriter()
    for page in reader.pages:
        page.rotate(angle)
        writer.add_page(page)
    output = folder / f"{source.stem}-rotated.pdf"
    with output.open("wb") as handle:
        writer.write(handle)
    return output


def repair_pdf(inputs: list[Path], folder: Path) -> Path:
    source = inputs[0]
    reader = PdfReader(str(source))
    output = folder / f"{source.stem}-repaired.pdf"
    return copy_reader_pages(reader, list(range(len(reader.pages))), output)


def add_page_numbers(inputs: list[Path], folder: Path) -> Path:
    source = inputs[0]
    output = folder / f"{source.stem}-numbered.pdf"
    document = fitz.open(source)
    try:
        total = document.page_count
        for index, page in enumerate(document, start=1):
            rect = page.rect
            page.insert_text(
                fitz.Point(rect.width / 2 - 18, rect.height - 24),
                f"{index} / {total}",
                fontsize=10,
                color=(0.18, 0.18, 0.18),
            )
        document.save(output)
    finally:
        document.close()
    return output


def add_watermark(inputs: list[Path], folder: Path, text: str | None) -> Path:
    source = inputs[0]
    label = (text or "DRAFT").strip()[:80] or "DRAFT"
    output = folder / f"{source.stem}-watermarked.pdf"
    document = fitz.open(source)
    try:
        for page in document:
            rect = page.rect
            page.insert_text(
                fitz.Point(rect.width * 0.16, rect.height * 0.52),
                label,
                fontsize=max(28, rect.width / 12),
                color=(0.75, 0.15, 0.12),
                fill_opacity=0.18,
            )
        document.save(output)
    finally:
        document.close()
    return output


def crop_pdf(inputs: list[Path], folder: Path, margin: str | None) -> Path:
    source = inputs[0]
    amount = max(0, min(144, int(float(margin or "24"))))
    reader = PdfReader(str(source))
    writer = PdfWriter()
    for page in reader.pages:
        box = page.cropbox
        if float(box.right) - float(box.left) <= amount * 2 or float(box.top) - float(box.bottom) <= amount * 2:
            raise RuntimeError("Crop margin is too large for this PDF.")
        box.left = float(box.left) + amount
        box.right = float(box.right) - amount
        box.bottom = float(box.bottom) + amount
        box.top = float(box.top) - amount
        writer.add_page(page)
    output = folder / f"{source.stem}-cropped.pdf"
    with output.open("wb") as handle:
        writer.write(handle)
    return output


def unlock_pdf(inputs: list[Path], folder: Path, password: str | None) -> Path:
    source = inputs[0]
    reader = PdfReader(str(source))
    if reader.is_encrypted:
        if not password:
            raise RuntimeError("This PDF requires a password.")
        if reader.decrypt(password) == 0:
            raise RuntimeError("The password did not unlock this PDF.")
    output = folder / f"{source.stem}-unlocked.pdf"
    return copy_reader_pages(reader, list(range(len(reader.pages))), output)


def protect_pdf(inputs: list[Path], folder: Path, password: str | None) -> Path:
    if not password:
        raise RuntimeError("Enter a password to protect this PDF.")
    source = inputs[0]
    reader = PdfReader(str(source))
    writer = PdfWriter()
    for page in reader.pages:
        writer.add_page(page)
    writer.encrypt(password)
    output = folder / f"{source.stem}-protected.pdf"
    with output.open("wb") as handle:
        writer.write(handle)
    return output


def process_job(
    job_id: str,
    tool: str,
    inputs: list[Path],
    pages: str | None,
    rotation: str | None,
    text: str | None,
    margin: str | None,
    password: str | None,
) -> None:
    folder = job_dir(job_id)
    jobs[job_id]["status"] = "processing"
    try:
        if tool in {"heic-to-jpg", "tiff-to-jpg"}:
            output = image_to_jpg(inputs, folder)
        elif tool in {"word-to-pdf", "powerpoint-to-pdf", "excel-to-pdf"}:
            output = convert_office_to_pdf(inputs, folder)
        elif tool == "pdf-to-word":
            output = convert_pdf_to_word(inputs, folder)
        elif tool == "compress-pdf":
            output = compress_pdf(inputs, folder)
        elif tool == "repair-pdf":
            output = repair_pdf(inputs, folder)
        elif tool == "pdf-to-jpg":
            output = pdf_to_jpg(inputs, folder)
        elif tool == "merge-pdf":
            output = merge_pdf(inputs, folder)
        elif tool in {"split-pdf", "extract-pdf-pages"}:
            output = split_pdf(inputs, folder, pages or "1")
        elif tool == "remove-pdf-pages":
            output = remove_pdf_pages(inputs, folder, pages or "1")
        elif tool == "organize-pdf":
            output = organize_pdf(inputs, folder, pages or "1")
        elif tool == "rotate-pdf":
            output = rotate_pdf(inputs, folder, rotation)
        elif tool == "add-page-numbers":
            output = add_page_numbers(inputs, folder)
        elif tool == "add-watermark":
            output = add_watermark(inputs, folder, text)
        elif tool == "crop-pdf":
            output = crop_pdf(inputs, folder, margin)
        elif tool == "unlock-pdf":
            output = unlock_pdf(inputs, folder, password)
        elif tool == "protect-pdf":
            output = protect_pdf(inputs, folder, password)
        else:
            raise RuntimeError("Unsupported tool.")
        jobs[job_id].update(status="done", output=str(output), outputName=output.name)
    except Exception as exc:
        set_failed(job_id, str(exc))


def cleanup_expired() -> None:
    cutoff = now_utc()
    expired = [job_id for job_id, job in jobs.items() if job["expiresAt"] <= cutoff]
    for job_id in expired:
        shutil.rmtree(job_dir(job_id), ignore_errors=True)
        jobs.pop(job_id, None)


@app.get("/health")
def health() -> dict:
    cleanup_expired()
    return {"ok": True, "jobs": len(jobs)}


@app.post("/api/jobs")
async def create_job(
    request: Request,
    background_tasks: BackgroundTasks,
    tool: Annotated[str, Form()],
    targetFormat: Annotated[str, Form()],
    files: Annotated[list[UploadFile], File()],
    pages: Annotated[str | None, Form()] = None,
    rotation: Annotated[str | None, Form()] = None,
    text: Annotated[str | None, Form()] = None,
    margin: Annotated[str | None, Form()] = None,
    password: Annotated[str | None, Form()] = None,
) -> dict:
    cleanup_expired()
    if tool not in ALLOWED_TOOLS:
        raise HTTPException(status_code=400, detail="Unsupported conversion tool.")
    if not files or len(files) > MAX_FILES:
        raise HTTPException(status_code=400, detail=f"Upload between 1 and {MAX_FILES} files.")
    if tool != "merge-pdf" and len(files) > 1:
        raise HTTPException(status_code=400, detail="This tool accepts one file at a time.")
    validate_file_names(tool, files)
    check_rate_limit(request.client.host if request.client else "unknown")

    job_id = uuid.uuid4().hex
    jobs[job_id] = {
        "status": "queued",
        "tool": tool,
        "targetFormat": targetFormat,
        "createdAt": now_utc(),
        "expiresAt": now_utc() + timedelta(minutes=EXPIRY_MINUTES),
    }
    try:
        inputs = await save_uploads(job_id, files)
    except Exception:
        shutil.rmtree(job_dir(job_id), ignore_errors=True)
        jobs.pop(job_id, None)
        raise

    background_tasks.add_task(process_job, job_id, tool, inputs, pages, rotation, text, margin, password)
    return {"jobId": job_id, "status": "queued", "expiresInMinutes": EXPIRY_MINUTES}


@app.get("/api/jobs/{job_id}")
def get_job(job_id: str) -> dict:
    cleanup_expired()
    job = jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Task not found or expired.")
    return {
        "jobId": job_id,
        "status": job["status"],
        "error": job.get("error"),
        "outputName": job.get("outputName"),
    }


@app.get("/api/jobs/{job_id}/download")
def download_job(job_id: str) -> FileResponse:
    cleanup_expired()
    job = jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Task not found or expired.")
    if job["status"] != "done":
        raise HTTPException(status_code=409, detail="Task is not ready.")
    output = Path(job["output"])
    if not output.exists():
        raise HTTPException(status_code=404, detail="Output file expired.")
    return FileResponse(output, filename=job.get("outputName") or output.name)
