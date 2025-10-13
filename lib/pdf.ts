import jsPDF from "jspdf";
import html2canvas from "html2canvas";

type PdfOptions = {
  filename?: string;
  margin?: number; // in px for DOM, will convert to mm
  scale?: number; // html2canvas scale
  format?: "a4" | "letter";
};

// Capture a DOM node and export to a paginated PDF that matches the on-screen styling.
export async function downloadElementAsPDF(
  element: HTMLElement,
  {
    filename = "document.pdf",
    margin = 16,
    scale = 3, // higher scale for crisper output
    format = "a4",
  }: PdfOptions = {}
) {
  // Clamp scale to safe bounds
  const effectiveScale = Math.min(3.5, Math.max(1.5, Number(scale) || 2));
  // Ensure fonts are loaded for accurate rendering
  try {
    // Optional chaining for environments without FontFaceSet API
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyDoc: any = document as any;
    if (anyDoc?.fonts?.ready) {
      await anyDoc.fonts.ready;
    }
  } catch {
    // ignore font readiness errors
  }

  // Helper: wait for all images within a node to be fully loaded
  const waitForImages = async (root: HTMLElement) => {
    const imgs = Array.from(root.querySelectorAll("img"));
    await Promise.all(
      imgs.map((img) =>
        img.complete && img.naturalWidth > 0
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              const done = () => resolve();
              img.addEventListener("load", done, { once: true });
              img.addEventListener("error", done, { once: true });
            })
      )
    );
  };

  // Helper: inline images as data URIs to avoid cross-origin tainting
  const inlineImages = async (root: HTMLElement) => {
    const imgs = Array.from(root.querySelectorAll("img"));
    await Promise.all(
      imgs.map(async (img) => {
        try {
          const src = img.currentSrc || img.src;
          if (!src || src.startsWith("data:")) return;
          const res = await fetch(src, { mode: "cors", credentials: "omit" });
          if (!res.ok) return;
          const blob = await res.blob();
          const reader = new FileReader();
          await new Promise<void>((resolve) => {
            reader.onloadend = () => {
              try {
                const dataUrl = reader.result as string;
                img.src = dataUrl;
                img.removeAttribute("srcset");
                img.removeAttribute("sizes");
              } catch {
                // ignore
              }
              resolve();
            };
            reader.readAsDataURL(blob);
          });
        } catch {
          // Ignore failures; html2canvas will skip problematic images
        }
      })
    );
  };

  // Render a cloned, print-sized version of the node offscreen to improve fidelity
  const mmToPx = (mm: number) => Math.round((mm * 96) / 25.4);
  const initialMmMargin = (margin * 25.4) / 96; // keep mm-based margin value
  const pageFormat = format === "letter" ? "letter" : "a4";

  const pageWidthMm = pageFormat === "letter" ? 215.9 : 210; // Letter: 8.5in, A4: 210mm
  const targetContentWidthPx = mmToPx(pageWidthMm) - 2 * margin; // approx content width in px

  // Clone element into a hidden container to normalize layout for printing
  const wrapper = document.createElement("div");
  // Place the clone fixed in the viewport so html2canvas can render it reliably.
  // We keep pointer events off and a very high z-index so it doesn't interfere with UI.
  wrapper.style.position = "fixed";
  wrapper.style.left = "0";
  wrapper.style.top = "0";
  wrapper.style.zIndex = "999999";
  // force a white background for printable invoices to avoid transparent artifacts
  wrapper.style.background = "#ffffff";
  wrapper.style.padding = "0";
  wrapper.style.pointerEvents = "none";

  const clone = element.cloneNode(true) as HTMLElement;
  // Normalize width to A4/Letter printable width to minimize downscaling blurriness
  clone.style.width = `${targetContentWidthPx}px`;
  clone.style.maxWidth = `${targetContentWidthPx}px`;
  clone.style.boxShadow = "none";
  clone.style.transform = "none";
  clone.style.filter = "none";
  clone.style.background = "transparent";
  clone.style.height = "auto";
  clone.style.maxHeight = "none";
  clone.style.overflow = "visible";
  // Ensure cloned node is positioned inside the wrapper (reset offscreen coords)
  try {
    clone.style.position = "relative";
    clone.style.left = "0";
    clone.style.top = "0";
  } catch {}

  // Normalize <img> elements to avoid lazy loading and CORS issues for html2canvas
  const imgs = Array.from(clone.querySelectorAll("img"));
  imgs.forEach((img) => {
    try {
      img.setAttribute("loading", "eager");
      // Allow CORS fetching when possible
      // @ts-ignore - HTMLImageElement supports crossOrigin
      if (!img.crossOrigin) img.crossOrigin = "anonymous";
      // Some Next.js images use data URIs or same-origin; leave src as-is.
      // If using srcset, prefer current src for stability
      if (img.currentSrc) {
        img.src = img.currentSrc;
      }
      // Remove srcset sizes to force a single resolved source
      img.removeAttribute("srcset");
      img.removeAttribute("sizes");
    } catch {
      // ignore
    }
  });

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  // Expand height to full content to avoid clipping
  try {
    const fullHeight = clone.scrollHeight;
    if (Number.isFinite(fullHeight) && fullHeight > 0) {
      clone.style.height = `${fullHeight}px`;
    }
  } catch {}

  // Inline images to prevent CORS-tainted canvas
  await inlineImages(clone);
  await waitForImages(clone);

  // Remove Tailwind background utility classes (bg-*) to avoid white boxes around logos
  try {
    clone.querySelectorAll("[class]").forEach((el) => {
      const cls = (el as HTMLElement).className || "";
      if (typeof cls === "string" && /\bbg-[^\s]+\b/.test(cls)) {
        (el as HTMLElement).style.background = "transparent";
      }
    });
  } catch {
    // ignore
  }

  // html2canvas renders the DOM to a canvas bitmap respecting CSS; try with foreignObject first
  let canvas: HTMLCanvasElement | null = null;
  let lastError: unknown = null;
  try {
    canvas = await html2canvas(clone, {
      scale: effectiveScale,
      useCORS: true,
      allowTaint: true,
      scrollX: 0,
      scrollY: 0,
      backgroundColor: "#ffffff",
      foreignObjectRendering: true,
      windowWidth: targetContentWidthPx,
      windowHeight: Math.max(
        window.innerHeight,
        clone.scrollHeight || window.innerHeight
      ),
      imageTimeout: 5000,
      logging: process.env.NODE_ENV !== "production",
    });
  } catch (e) {
    lastError = e;
  }

  // Fallback: retry without foreignObjectRendering and with simpler styles
  if (!canvas || canvas.width < 2 || canvas.height < 2) {
    try {
      // Remove potential problematic styles
      clone.querySelectorAll("*").forEach((el) => {
        const style = (el as HTMLElement).style;
        if (!style) return;
        style.backdropFilter = "";
        style.filter = "";
        style.transform = "";
      });
    } catch {
      // ignore cleanup errors
    }
    try {
      canvas = await html2canvas(clone, {
        scale: effectiveScale,
        useCORS: true,
        allowTaint: true,
        scrollX: 0,
        scrollY: 0,
        backgroundColor: "#ffffff",
        foreignObjectRendering: false,
        windowWidth: targetContentWidthPx,
        imageTimeout: 5000,
        logging: process.env.NODE_ENV !== "production",
      });
    } catch (e2) {
      lastError = e2;
    }
  }

  // If clone attempts failed, try capturing the live element as a last resort
  if (!canvas || canvas.width < 2 || canvas.height < 2) {
    try {
      canvas = await html2canvas(element, {
        scale: effectiveScale,
        useCORS: true,
        allowTaint: true,
        scrollX: 0,
        scrollY: 0,
        backgroundColor: "#ffffff",
        foreignObjectRendering: false,
        windowWidth: Math.max(
          window.innerWidth,
          element.scrollWidth || window.innerWidth
        ),
        windowHeight: Math.max(
          window.innerHeight,
          element.scrollHeight || window.innerHeight
        ),
        imageTimeout: 5000,
        logging: process.env.NODE_ENV !== "production",
      });
    } catch (e3) {
      lastError = e3;
    }
  }

  // Basic blank-canvas detection: sample a few pixels to ensure content isn't fully transparent/white.
  const isCanvasBlank = (c: HTMLCanvasElement | null) => {
    if (!c) return true;
    try {
      const ctx = c.getContext("2d");
      if (!ctx) return true;
      const w = Math.min(10, c.width - 1);
      const h = Math.min(10, c.height - 1);
      const imgData = ctx.getImageData(0, 0, w, h).data;
      for (let i = 0; i < imgData.length; i += 4) {
        const r = imgData[i];
        const g = imgData[i + 1];
        const b = imgData[i + 2];
        const a = imgData[i + 3];
        // if any sampled pixel has non-white or non-transparent content, consider non-blank
        if (a !== 0 && !(r === 255 && g === 255 && b === 255)) return false;
      }
      return true;
    } catch {
      return false; // if we can't read, assume not blank to avoid false positive
    }
  };

  // If we got a canvas but it looks blank, try fallback capture on the live element once.
  if (canvas && isCanvasBlank(canvas)) {
    lastError = lastError || new Error("canvas appears blank");
    try {
      const live = await html2canvas(element, {
        scale: effectiveScale,
        useCORS: true,
        allowTaint: true,
        scrollX: 0,
        scrollY: 0,
        backgroundColor: "#ffffff",
        foreignObjectRendering: false,
        windowWidth: Math.max(
          window.innerWidth,
          element.scrollWidth || window.innerWidth
        ),
        windowHeight: Math.max(
          window.innerHeight,
          element.scrollHeight || window.innerHeight
        ),
        imageTimeout: 5000,
        logging: process.env.NODE_ENV !== "production",
      });
      if (!isCanvasBlank(live)) {
        canvas = live;
      }
    } catch (fb) {
      // ignore fallback failure
    }
  }

  // Cleanup DOM
  document.body.removeChild(wrapper);
  if (!canvas || canvas.width < 2 || canvas.height < 2) {
    // As a last resort, throw a helpful error to the caller
    console.error("PDF generation failed", lastError);
    throw new Error("Failed to render PDF content. Please try again.");
  }

  // PDF sizes in mm — single page approach: scale the whole canvas to fit A4 (width and height)
  const pdf = new jsPDF({
    unit: "mm",
    format: pageFormat,
    orientation: "portrait",
  });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const pxToMm = (px: number) => (px * 25.4) / 96; // 96dpi CSS pixel
  const imgWidthMm = pxToMm(canvas.width);
  const imgHeightMm = pxToMm(canvas.height);

  if (
    !isFinite(imgWidthMm) ||
    !isFinite(imgHeightMm) ||
    imgWidthMm <= 0 ||
    imgHeightMm <= 0
  ) {
    throw new Error("Invalid canvas dimensions for PDF generation");
  }

  let mmMargin = initialMmMargin;
  if (!isFinite(mmMargin) || mmMargin < 0) mmMargin = 0;
  const availWidth = pageWidth - 2 * mmMargin;
  const availHeight = pageHeight - 2 * mmMargin;

  // Compute uniform scale factor to fit both width and height into one page
  const scaleFactorWidth = availWidth / imgWidthMm;
  const scaleFactorHeight = availHeight / imgHeightMm;
  let finalScale = Math.min(scaleFactorWidth, scaleFactorHeight);
  // Don't upscale beyond 1 to avoid blurring tiny content
  if (finalScale > 1) finalScale = 1;

  const targetWidth = imgWidthMm * finalScale;
  const targetHeight = imgHeightMm * finalScale;

  // Center vertically
  const posX = (pageWidth - targetWidth) / 2;
  const posY = (pageHeight - targetHeight) / 2;

  // Use PNG to preserve transparency (logo transparency won't be forced to white)
  const fullImg = canvas.toDataURL("image/png");
  pdf.addImage(
    fullImg,
    "PNG",
    posX,
    posY,
    targetWidth,
    targetHeight,
    undefined,
    "FAST"
  );
  pdf.save(filename);
}
