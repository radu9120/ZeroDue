#!/usr/bin/env node
/*
  Usage: node scripts/generate-invoice-pdf.js --url http://localhost:3000/dashboard/invoices/31/success --out ./invoice.pdf
  This script launches headless Chromium, navigates to the page, waits for #invoice-capture and prints a PDF using the page's print CSS.
*/
const puppeteer = require("puppeteer-core");

// Minimal argv parsing (avoid extra dependency)
const argvRaw = process.argv.slice(2);
const argv = {};
for (let i = 0; i < argvRaw.length; i++) {
  const a = argvRaw[i];
  if (a.startsWith("--")) {
    const key = a.replace(/^--/, "");
    const val =
      argvRaw[i + 1] && !argvRaw[i + 1].startsWith("--") ? argvRaw[++i] : true;
    argv[key] = val;
  }
}

// Auto-detect Chrome/Chromium path on macOS/Linux/Windows
function detectChromeExecutable() {
  const { platform } = process;
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  if (argv.chrome) return argv.chrome;
  if (platform === "darwin") {
    const candidates = [
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Chromium.app/Contents/MacOS/Chromium",
    ];
    return candidates.find((p) => require("fs").existsSync(p));
  }
  if (platform === "linux") {
    const candidates = [
      "/usr/bin/google-chrome",
      "/usr/bin/chromium-browser",
      "/usr/bin/chromium",
    ];
    return candidates.find((p) => require("fs").existsSync(p));
  }
  if (platform === "win32") {
    const candidates = [
      process.env.PROGRAMFILES + "\\Google\\Chrome\\Application\\chrome.exe",
      process.env["PROGRAMFILES(X86)"] +
        "\\Google\\Chrome\\Application\\chrome.exe",
    ];
    return candidates.find((p) => p && require("fs").existsSync(p));
  }
  return null;
}
async function run() {
  const url = argv.url;
  const out = argv.out || "./invoice.pdf";
  const format = argv.format || "A4";

  if (!url) {
    console.error(
      "Usage: node scripts/generate-invoice-pdf.js --url <URL> [--out ./invoice.pdf] [--format A4] [--chrome /path/to/chrome]"
    );
    process.exit(2);
  }

  const chromePath = detectChromeExecutable();
  if (!chromePath) {
    console.error(
      "Could not auto-detect Chrome/Chromium binary. Set CHROME_PATH or pass --chrome."
    );
    process.exit(2);
  }

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: chromePath,
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 1600, deviceScaleFactor: 2 });
    await page.goto(argv.url, { waitUntil: "networkidle2", timeout: 60000 });

    // Wait for invoice container
    await page.waitForSelector("#invoice-capture, [data-invoice-preview]", {
      timeout: 20000,
    });

    // Give the page a moment to stabilize (fonts, images)
    await page.waitForTimeout(800);

    // Print to PDF using print CSS for professional layout
    await page.pdf({
      path: argv.out,
      format: argv.format,
      printBackground: true,
      margin: { top: "12mm", bottom: "12mm", left: "12mm", right: "12mm" },
    });

    console.log("PDF saved to", argv.out);
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
