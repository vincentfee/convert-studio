from __future__ import annotations

import json
import mimetypes
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from uuid import uuid4

ROOT = Path(__file__).resolve().parents[1]
TEST_DEPS = ROOT / ".test_deps"
if TEST_DEPS.exists():
    sys.path.insert(0, str(TEST_DEPS))

from PIL import Image
from docx import Document
from pypdf import PdfReader, PdfWriter

try:
    from pillow_heif import register_heif_opener

    register_heif_opener()
except Exception:
    pass

API_BASE = "https://convert-studio-pdf-api.onrender.com"
ARTIFACTS = ROOT / "test-artifacts"
FIXTURES = ARTIFACTS / "fixtures"
OUTPUTS = ARTIFACTS / "outputs"


def request_json(url: str, *, method: str = "GET", body: bytes | None = None, headers: dict | None = None) -> dict:
    request = urllib.request.Request(url, data=body, headers=headers or {}, method=method)
    with urllib.request.urlopen(request, timeout=120) as response:
        return json.loads(response.read().decode("utf-8"))


def multipart(fields: dict[str, str], files: list[Path]) -> tuple[bytes, str]:
    boundary = f"----convert-studio-{uuid4().hex}"
    chunks: list[bytes] = []

    for name, value in fields.items():
        chunks.append(f"--{boundary}\r\n".encode())
        chunks.append(f'Content-Disposition: form-data; name="{name}"\r\n\r\n'.encode())
        chunks.append(str(value).encode())
        chunks.append(b"\r\n")

    for path in files:
        mime = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
        chunks.append(f"--{boundary}\r\n".encode())
        chunks.append(f'Content-Disposition: form-data; name="files"; filename="{path.name}"\r\n'.encode())
        chunks.append(f"Content-Type: {mime}\r\n\r\n".encode())
        chunks.append(path.read_bytes())
        chunks.append(b"\r\n")

    chunks.append(f"--{boundary}--\r\n".encode())
    return b"".join(chunks), f"multipart/form-data; boundary={boundary}"


def create_fixtures() -> dict[str, Path]:
    FIXTURES.mkdir(parents=True, exist_ok=True)
    OUTPUTS.mkdir(parents=True, exist_ok=True)

    image = Image.new("RGB", (80, 60), (16, 124, 102))
    png = FIXTURES / "sample.png"
    jpg = FIXTURES / "sample.jpg"
    webp = FIXTURES / "sample.webp"
    avif = FIXTURES / "sample.avif"
    tiff = FIXTURES / "sample.tiff"
    heic = FIXTURES / "sample.heic"
    image.save(png)
    image.save(jpg, "JPEG")
    image.save(webp, "WEBP")
    image.save(tiff, "TIFF")
    try:
        image.save(avif, "AVIF")
    except Exception:
        pass
    try:
        image.save(heic, "HEIF")
    except Exception as exc:
        print(f"SKIP fixture HEIC generation: {exc}")

    pdf = FIXTURES / "sample.pdf"
    writer = PdfWriter()
    writer.add_blank_page(width=144, height=144)
    with pdf.open("wb") as handle:
        writer.write(handle)

    pdf2 = FIXTURES / "sample-two.pdf"
    writer = PdfWriter()
    writer.add_blank_page(width=100, height=100)
    with pdf2.open("wb") as handle:
        writer.write(handle)

    docx = FIXTURES / "sample.docx"
    document = Document()
    document.add_heading("FileForma test", level=1)
    document.add_paragraph("This document verifies Word to PDF conversion.")
    document.save(docx)

    return {
        "heic": heic,
        "tiff": tiff,
        "pdf": pdf,
        "pdf2": pdf2,
        "docx": docx,
    }


def create_job(tool: str, target: str, files: list[Path], extra: dict[str, str] | None = None) -> dict:
    fields = {"tool": tool, "targetFormat": target}
    if extra:
        fields.update(extra)
    body, content_type = multipart(fields, files)
    return request_json(
        f"{API_BASE}/api/jobs",
        method="POST",
        body=body,
        headers={"Content-Type": content_type},
    )


def wait_for_job(job_id: str) -> dict:
    for _ in range(120):
        result = request_json(f"{API_BASE}/api/jobs/{job_id}")
        if result["status"] in {"done", "failed"}:
            return result
        time.sleep(1)
    raise TimeoutError(f"{job_id} timed out")


def download(job_id: str, output_name: str) -> Path:
    output_path = OUTPUTS / output_name
    with urllib.request.urlopen(f"{API_BASE}/api/jobs/{job_id}/download", timeout=120) as response:
        output_path.write_bytes(response.read())
    return output_path


def assert_magic(path: Path, expected: bytes) -> None:
    actual = path.read_bytes()[: len(expected)]
    if actual != expected:
        raise AssertionError(f"{path.name} magic {actual!r} != {expected!r}")


def run_case(name: str, tool: str, target: str, files: list[Path], expected_magic: bytes, extra: dict[str, str] | None = None) -> None:
    print(f"TEST {name}")
    job = create_job(tool, target, files, extra)
    result = wait_for_job(job["jobId"])
    if result["status"] != "done":
        raise AssertionError(f"{name} failed: {result.get('error')}")
    output = download(job["jobId"], result.get("outputName") or f"{name}.out")
    assert_magic(output, expected_magic)
    print(f"PASS {name}: {output.name} {output.stat().st_size} bytes")


def main() -> None:
    fixtures = create_fixtures()
    print("HEALTH", request_json(f"{API_BASE}/health"))

    cases = [
        ("HEIC to JPG", "heic-to-jpg", "JPG", [fixtures["heic"]], b"\xff\xd8\xff"),
        ("TIFF to JPG", "tiff-to-jpg", "JPG", [fixtures["tiff"]], b"\xff\xd8\xff"),
        ("Word to PDF", "word-to-pdf", "PDF", [fixtures["docx"]], b"%PDF"),
        ("PDF to Word", "pdf-to-word", "DOCX", [fixtures["pdf"]], b"PK"),
        ("Compress PDF", "compress-pdf", "Smaller PDF", [fixtures["pdf"]], b"%PDF"),
        ("PDF to JPG", "pdf-to-jpg", "JPG", [fixtures["pdf"]], b"PK"),
        ("Merge PDF", "merge-pdf", "Merged PDF", [fixtures["pdf"], fixtures["pdf2"]], b"%PDF"),
        ("Split PDF", "split-pdf", "Split PDF", [fixtures["pdf"]], b"%PDF", {"pages": "1"}),
    ]

    failures: list[str] = []
    for case in cases:
        if not all(path.exists() for path in case[3]):
            failures.append(f"{case[0]}: fixture missing")
            continue
        try:
            run_case(*case)
        except Exception as exc:
            failures.append(f"{case[0]}: {exc}")
            print(f"FAIL {case[0]}: {exc}")

    if failures:
        print("\nFAILURES")
        for failure in failures:
            print(f"- {failure}")
        raise SystemExit(1)
    print("\nAll server converter checks passed.")


if __name__ == "__main__":
    main()
