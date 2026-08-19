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
import { PDFDocument } from "pdf-lib";
import { readFile, writeFile } from "fs/promises";
import { existsSync, mkdirSync } from "fs";
import { join, extname } from "path";

const MAX_PAGES = +(process.env.CV_MAX_PAGES || 3);
const ROOT = join(process.cwd(), "out");
const PUBLIC_DOCS = join(process.cwd(), "public", "documents");
const OUT_DOCS = join(ROOT, "documents");

const AUTHOR = "Gil Lopes Bueno";

// `title` and `keywords` are stamped into the PDF's document information
// dictionary after Chrome renders it. Chrome ignores `<meta name="author">`,
// so without this pass every CV ships with an empty Author — a field a lot of
// applicant tracking systems read before they read the page text. `keywords`
// is deliberately the role's vocabulary, matching what the skill blocks
// already claim on the page; it is not a place to smuggle in terms the CV
// itself does not support (see content/career-gaps.md).
const VERSIONS = [
  {
    route: "/",
    file: "Gil-Lopes-Bueno-Principal-Software-Engineer.pdf",
    title: `${AUTHOR} — Principal Software Engineer`,
    keywords: [
      "Principal Software Engineer", "Backend Engineer", "AI Engineering",
      "Node.js", "TypeScript", "Java", "Kotlin", "PostgreSQL", "AWS",
      "Microservices", "Distributed Systems", "Solution Architecture",
      "Agent Development", "MCP", "RAG", "Blockchain", "Solidity",
    ],
  },
  {
    route: "/web3",
    file: "Gil-Lopes-Bueno-Senior-Blockchain-Engineer.pdf",
    title: `${AUTHOR} — Senior Blockchain Engineer`,
    keywords: [
      "Blockchain Engineer", "Smart Contract Engineer", "Solidity", "EVM",
      "Ethereum", "DeFi", "Protocol Architecture", "Foundry", "Hardhat",
      "Uniswap", "AMM", "DEX", "Gas Optimization", "Fuzzing", "Audit Prep",
      "Account Abstraction", "wagmi", "viem", "TypeScript",
    ],
  },
  {
    route: "/webdev",
    file: "Gil-Lopes-Bueno-Senior-Full-Stack-Engineer.pdf",
    title: `${AUTHOR} — Senior Full-Stack Engineer`,
    keywords: [
      "Full-Stack Engineer", "Frontend Engineer", "React", "Next.js",
      "TypeScript", "JavaScript", "Node.js", "Tailwind", "GraphQL", "REST",
      "PostgreSQL", "AWS", "Playwright", "Jest", "Storybook",
    ],
  },
  {
    route: "/project-manager",
    file: "Gil-Lopes-Bueno-Technical-Project-Manager.pdf",
    title: `${AUTHOR} — Technical Project Manager`,
    keywords: [
      "Technical Project Manager", "Project Manager", "Delivery Manager",
      "Engineering Manager", "Project Delivery", "Scrum", "Kanban",
      "Sprint Planning", "Backlog Refinement", "Estimation",
      "Project Scheduling", "Budget Management", "Risk Management",
      "Stakeholder Management", "People Management", "Jira", "YouTrack",
      "ZenHub", "ClickUp", "Linear",
    ],
  },
  {
    route: "/enterprise",
    file: "Gil-Lopes-Bueno-Principal-Backend-Engineer.pdf",
    title: `${AUTHOR} — Principal Backend Engineer`,
    keywords: [
      "Principal Backend Engineer", "Java", "Kotlin", "Node.js", "TypeScript",
      "Microservices", "Distributed Systems", "Solution Architecture",
      "PostgreSQL", "MySQL", "Redis", "ElasticSearch", "AWS", "Docker",
      "Terraform", "CI/CD", "REST", "GraphQL",
    ],
  },
  {
    route: "/product",
    file: "Gil-Lopes-Bueno-Technical-Product-Owner.pdf",
    title: `${AUTHOR} — Technical Product Owner`,
    keywords: [
      "Technical Product Owner", "Product Owner", "Business Analyst",
      "Discovery", "Requirements", "Backlog Management", "Roadmap",
      "Prioritization", "User Stories", "Acceptance Criteria",
      "Functional Specs", "Stakeholder Management", "Scope Negotiation",
      "Scrum", "Kanban", "Jira", "ClickUp", "Figma",
    ],
  },
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

for (const { route, file, title, keywords } of VERSIONS) {
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

  // Chrome leaves Author, Title and Keywords empty — it has no way to know
  // them — so they get stamped on here. Re-saving through pdf-lib preserves
  // the structure tree emitted by `tagged: true` above.
  const doc = await PDFDocument.load(pdf);
  doc.setTitle(title, { showInWindowTitleBar: true });
  doc.setAuthor(AUTHOR);
  doc.setSubject(title);
  // pdf-lib joins the array with spaces, which makes multi-word keywords
  // run together ("Project Manager Delivery Manager"). Pre-joining with
  // commas gives a parser separable terms.
  doc.setKeywords([keywords.join(", ")]);
  doc.setCreator("gil.solutions");
  const stamped = await doc.save();

  const pages = doc.getPageCount();

  for (const dir of targets) await writeFile(join(dir, file), stamped);
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
