import playwright from "../.test_node/node_modules/playwright-core/index.js";
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const fixtures = join(root, "test-artifacts", "fixtures");
const distDir = join(root, "dist");
const siteBase = process.env.SITE_BASE || "http://localhost:4173";
const useLocal = siteBase.includes("localhost") || siteBase.includes("127.0.0.1");

const cases = [
  ["PNG to JPG", "/png-to-jpg/", ["sample.png"], [0xff, 0xd8, 0xff]],
  ["JPG to PNG", "/jpg-to-png/", ["sample.jpg"], [0x89, 0x50, 0x4e, 0x47]],
  ["JPG to WebP", "/jpg-to-webp/", ["sample.jpg"], [0x52, 0x49, 0x46, 0x46]],
  ["WebP to PNG", "/webp-to-png/", ["sample.webp"], [0x89, 0x50, 0x4e, 0x47]],
  ["WebP to JPG", "/webp-to-jpg/", ["sample.webp"], [0xff, 0xd8, 0xff]],
  ["PNG to WebP", "/png-to-webp/", ["sample.png"], [0x52, 0x49, 0x46, 0x46]],
  ["AVIF to JPG", "/avif-to-jpg/", ["sample.avif"], [0xff, 0xd8, 0xff]],
  ["Compress Image", "/compress-image/", ["sample.png"], [0xff, 0xd8, 0xff]],
  ["Resize Image", "/resize-image/", ["sample.png"], [0xff, 0xd8, 0xff]],
  ["Image to PDF", "/image-to-pdf/", ["sample.png", "sample.jpg"], [0x25, 0x50, 0x44, 0x46]],
  ["JPG to PDF", "/jpg-to-pdf/", ["sample.jpg"], [0x25, 0x50, 0x44, 0x46]],
];

function hasMagic(bytes, expected) {
  return expected.every((value, index) => bytes[index] === value);
}

async function ensureFixtures() {
  if (existsSync(join(fixtures, "sample.png"))) return;
  console.log("Generating fixtures via Python helper ...");
  const result = spawnSync("python3", [join(root, "scripts", "test-online-converters.py"), "--fixtures-only"], {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, API_BASE: process.env.API_BASE || "http://127.0.0.1:1" },
  });
  if (result.status !== 0) {
    spawnSync("python3", ["-c", `
from pathlib import Path
from PIL import Image
from pypdf import PdfWriter
root = Path("${fixtures.replace(/\\/g, "\\\\")}")
root.mkdir(parents=True, exist_ok=True)
img = Image.new("RGB", (80, 60), (16, 124, 102))
img.save(root / "sample.png")
img.save(root / "sample.jpg", "JPEG")
img.save(root / "sample.webp", "WEBP")
try: img.save(root / "sample.avif", "AVIF")
except: pass
writer = PdfWriter()
writer.add_blank_page(width=144, height=144)
with (root / "sample.pdf").open("wb") as f: writer.write(f)
`], { cwd: root, stdio: "inherit" });
  }
}

async function ensureLocalSite() {
  if (!useLocal) return;
  if (!existsSync(distDir)) {
    console.log("Building local dist/ ...");
    const result = spawnSync("npm", ["run", "build"], { cwd: root, stdio: "inherit", shell: true });
    if (result.status !== 0) throw new Error("npm run build failed");
  }
}

async function readDownloadBytes(page, href) {
  if (href.startsWith("blob:")) {
    return page.evaluate(async (blobHref) => {
      const response = await fetch(blobHref);
      const buffer = await response.arrayBuffer();
      return Array.from(new Uint8Array(buffer.slice(0, 12)));
    }, href);
  }

  const response = await fetch(href);
  const buffer = await response.arrayBuffer();
  return Array.from(new Uint8Array(buffer.slice(0, 12)));
}

async function testCase(page, [name, path, fileNames, magic]) {
  const filePaths = fileNames.map((file) => join(fixtures, file));
  if (filePaths.some((file) => !existsSync(file))) {
    console.log(`SKIP ${name}: fixture missing`);
    return "skip";
  }

  console.log(`TEST ${name}`);
  await page.goto(`${siteBase}${path}`, { waitUntil: "load", timeout: 60_000 });
  await page.setInputFiles('input[type="file"]', filePaths);
  await page.click(".convert-btn");
  await page.waitForSelector(".download-btn", { timeout: 120_000 });
  const href = await page.getAttribute(".download-btn", "href");
  if (!href) throw new Error(`${name}: missing download href`);
  const bytes = await readDownloadBytes(page, href);
  if (!hasMagic(bytes, magic)) {
    throw new Error(`${name}: wrong output magic ${bytes.join(",")}`);
  }
  console.log(`PASS ${name}`);
  return "pass";
}

await ensureFixtures();
await ensureLocalSite();

const { chromium } = playwright;
const launchOptions = { headless: true };
if (process.env.CHROME_PATH) {
  launchOptions.executablePath = process.env.CHROME_PATH;
}

const browser = await chromium.launch(launchOptions);
const page = await browser.newPage();
const failures = [];
let passed = 0;
let skipped = 0;

try {
  for (const item of cases) {
    try {
      const result = await testCase(page, item);
      if (result === "skip") skipped += 1;
      else passed += 1;
    } catch (error) {
      failures.push(`${item[0]}: ${error.message}`);
      console.log(`FAIL ${item[0]}: ${error.message}`);
    }
  }
} finally {
  await browser.close();
}

console.log(`\nBrowser tests: ${passed} passed, ${skipped} skipped, ${failures.length} failed`);
if (failures.length) {
  console.log("\nFAILURES");
  failures.forEach((failure) => console.log(`- ${failure}`));
  process.exit(1);
}

console.log("\nAll browser converter checks passed.");
