import playwright from "../.test_node/node_modules/playwright-core/index.js";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const fixtures = join(root, "test-artifacts", "fixtures");
const baseUrl = "https://convert-studio-web.onrender.com";
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

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
  ["HEIC to JPG page", "/heic-to-jpg/", ["sample.heic"], [0xff, 0xd8, 0xff]],
  ["TIFF to JPG page", "/tiff-to-jpg/", ["sample.tiff"], [0xff, 0xd8, 0xff]],
];

function hasMagic(bytes, expected) {
  return expected.every((value, index) => bytes[index] === value);
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
    return false;
  }

  console.log(`TEST ${name}`);
  await page.goto(`${baseUrl}${path}`, { waitUntil: "load", timeout: 60_000 });
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
  return true;
}

const { chromium } = playwright;
const browser = await chromium.launch({ executablePath: chromePath, headless: true });
const page = await browser.newPage();
const failures = [];

try {
  for (const item of cases) {
    try {
      await testCase(page, item);
    } catch (error) {
      failures.push(`${item[0]}: ${error.message}`);
      console.log(`FAIL ${item[0]}: ${error.message}`);
    }
  }
} finally {
  await browser.close();
}

if (failures.length) {
  console.log("\nFAILURES");
  failures.forEach((failure) => console.log(`- ${failure}`));
  process.exit(1);
}

console.log("\nAll browser converter checks passed.");
