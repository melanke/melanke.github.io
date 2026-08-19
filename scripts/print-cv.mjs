// Generates the CV PDFs from the site's own print stylesheet, with the exact
// settings used in Chrome's print dialog: Letter, 0.31" top/left/right
// margin, 0 bottom margin. The site is the source of truth for the CV, so
// the PDFs are build output — not hand-made exports.
//
// Runs as `postbuild`, so `npm run build` refreshes them. CI calls `next build`
// directly (see .github/workflows/nextjs.yml), so this never runs on deploy.
//
// Usage:
//   node scripts/print-cv.mjs            # -> public/documents + out/documents
//   node scripts/print-cv.mjs <dir>      # -> <dir> only (for experiments)
//
// Fails the build if any version exceeds MAX_PAGES: the whole point of the
// print layout is that a recruiter gets a 3-page CV.
import { createServer } from "http";
import { readFile, writeFile } from "fs/promises";
import { existsSync, mkdirSync } from "fs";
import { join, extname } from "path";

const MAX_PAGES = +(process.env.CV_MAX_PAGES || 3);
const ROOT = join(process.cwd(), "out");
const PUBLIC_DOCS = join(process.cwd(), "public", "documents");
const OUT_DOCS = join(ROOT, "documents");

const VERSIONS = [
  { route: "/", file: "Gil-Lopes-Bueno-Principal-Software-Engineer.pdf" },
  { route: "/web3", file: "Gil-Lopes-Bueno-Senior-Blockchain-Engineer.pdf" },
  { route: "/webdev", file: "Gil-Lopes-Bueno-Senior-Full-Stack-Engineer.pdf" },
  { route: "/project-manager", file: "Gil-Lopes-Bueno-Technical-Project-Manager.pdf" },
  { route: "/enterprise", file: "Gil-Lopes-Bueno-Principal-Backend-Engineer.pdf" },
  { route: "/product", file: "Gil-Lopes-Bueno-Technical-Product-Owner.pdf" },
];

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter(Boolean);

const skip = (why) => {
  console.log(`\n  CV PDFs skipped: ${why}`);
  process.exit(0);
};

if (process.env.SKIP_CV_PDF) skip("SKIP_CV_PDF is set");
if (process.env.CI) skip("running in CI");
if (!existsSync(ROOT)) skip("no out/ directory — run `next build` first");

const chrome = CHROME_CANDIDATES.find((p) => existsSync(p));
if (!chrome) skip("no Chrome found (set CHROME_PATH to override)");

let chromium;
try {
  ({ chromium } = await import("playwright-core"));
} catch {
  skip("playwright-core is not installed");
}

// Static file server over out/, mirroring how GitHub Pages serves the export.
const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".ico": "image/x-icon",
  ".xml": "application/xml",
  ".txt": "text/plain",
  ".pdf": "application/pdf",
};

const server = createServer(async (req, res) => {
  const path = decodeURIComponent(req.url.split("?")[0]);
  let file = join(ROOT, path);
  if (!extname(file)) {
    file = existsSync(join(file, "index.html"))
      ? join(file, "index.html")
      : `${file}.html`;
  }
  try {
    const body = await readFile(file);
    res.writeHead(200, {
      "content-type": MIME[extname(file)] || "application/octet-stream",
    });
    res.end(body);
  } catch {
    res.writeHead(404).end("not found");
  }
});

await new Promise((resolve) => server.listen(0, resolve));
const port = server.address().port;

// A single output dir can be passed for experiments; otherwise write the two
// places that matter: the repo copy and the just-built export.
const targets = process.argv[2] ? [process.argv[2]] : [PUBLIC_DOCS, OUT_DOCS];
targets.forEach((dir) => mkdirSync(dir, { recursive: true }));

const browser = await chromium.launch({ executablePath: chrome });
const page = await browser.newPage();
const oversized = [];

for (const { route, file } of VERSIONS) {
  await page.goto(`http://localhost:${port}${route}`, { waitUntil: "networkidle" });
  await page.emulateMedia({ media: "print" });
  // `networkidle` only guarantees requests were kicked off, not that every
  // @font-face weight finished parsing. Without this wait, Chrome's PDF
  // snapshot can catch some weights (e.g. font-semibold headings) before
  // they've swapped in, embedding just the Regular weight and faking the
  // rest with synthetic bold — which renders visibly heavier than a real
  // browser print of the same page.
  await page.evaluate(() => document.fonts.ready);
  const pdf = await page.pdf({
    format: "Letter",
    printBackground: false,
    // Emits the PDF structure tree (headings, lists, links) from the page's
    // own semantics. Screen readers need it, and it gives a resume parser a
    // real outline instead of a flat bag of text runs.
    tagged: true,
    margin: { top: "0.31in", bottom: "0", left: "0.31in", right: "0.31in" },
  });

  // Chrome writes the page count into the page-tree root's /Count.
  const counts = [...pdf.toString("latin1").matchAll(/\/Count\s+(\d+)/g)];
  const pages = counts.length ? Math.max(...counts.map((m) => +m[1])) : 0;

  for (const dir of targets) await writeFile(join(dir, file), pdf);
  console.log(`  ${pages} pages  ${file}`);
  if (pages > MAX_PAGES) oversized.push({ file, pages });
}

await browser.close();
server.close();

if (oversized.length) {
  console.error(
    `\n  CV over budget (max ${MAX_PAGES} pages):\n` +
      oversized.map((o) => `    ${o.pages} pages  ${o.file}`).join("\n") +
      `\n\n  Trim content, or tighten the print styles in components/TimelineItem.tsx\n` +
      `  and app/globals.css (see the @media print block).\n`
  );
  process.exit(1);
}
