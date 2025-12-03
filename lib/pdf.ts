import jsPDF from "jspdf";
import html2canvas from "html2canvas";

type PdfOptions = {
  filename?: string;
  margin?: number; // in px for DOM, will convert to mm
  scale?: number; // html2canvas scale
  format?: "a4" | "letter";
};

// Convert oklch/oklab colors to rgb - html2canvas doesn't support modern CSS color functions
function convertModernColorsToRgb(element: HTMLElement): void {
  const colorProperties = [
    "color",
    "backgroundColor",
    "borderColor",
    "borderTopColor",
    "borderRightColor",
    "borderBottomColor",
    "borderLeftColor",
    "outlineColor",
    "textDecorationColor",
    "fill",
    "stroke",
    "boxShadow",
    "textShadow",
  ];

  const convertColor = (colorValue: string): string => {
    if (!colorValue) return colorValue;
    // Check if it's an oklch, oklab, lab, lch, or color() function
    if (
      colorValue.includes("oklch") ||
      colorValue.includes("oklab") ||
      colorValue.includes("lab(") ||
      colorValue.includes("lch(") ||
      colorValue.includes("color(")
    ) {
      // Create a temporary element to let the browser convert it
      const temp = document.createElement("div");
      temp.style.color = colorValue;
      document.body.appendChild(temp);
      const computed = getComputedStyle(temp).color;
      document.body.removeChild(temp);
      // If browser returned a valid rgb value, use it; otherwise fallback to a safe color
      if (computed && computed.startsWith("rgb")) {
        return computed;
      }
      // Fallback to black for text-like properties, transparent for backgrounds
      return "rgb(0, 0, 0)";
    }
    return colorValue;
  };

  // Process the element itself
  const processElement = (el: HTMLElement) => {
    try {
      const computed = getComputedStyle(el);
      colorProperties.forEach((prop) => {
        try {
          // Get computed value
          const computedValue = computed.getPropertyValue(
            prop.replace(/([A-Z])/g, "-$1").toLowerCase()
          );
          const value = computedValue || (computed as any)[prop];
          if (value && typeof value === "string") {
            const converted = convertColor(value);
            if (converted !== value) {
              (el.style as any)[prop] = converted;
            }
          }
        } catch {
          // skip this property
        }
      });

      // Force set computed colors directly on the element to override CSS
      try {
        const bgColor = computed.backgroundColor;
        const textColor = computed.color;
        const borderColor = computed.borderColor;

        if (bgColor && bgColor.startsWith("rgb")) {
          el.style.backgroundColor = bgColor;
        }
        if (textColor && textColor.startsWith("rgb")) {
          el.style.color = textColor;
        }
        if (borderColor && borderColor.startsWith("rgb")) {
          el.style.borderColor = borderColor;
        }
      } catch {
        // ignore
      }
    } catch {
      // Ignore errors for individual elements
    }
  };

  processElement(element);
  element.querySelectorAll("*").forEach((child) => {
    if (child instanceof HTMLElement) {
      processElement(child);
    }
  });

  // Also add a style tag to override any oklch in CSS custom properties/variables
  try {
    const styleOverride = document.createElement("style");
    styleOverride.textContent = `
      * {
        --tw-ring-color: rgb(59, 130, 246) !important;
        --tw-shadow-color: rgb(0, 0, 0) !important;
      }
    `;
    element.prepend(styleOverride);
  } catch {
    // ignore
  }
}

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
  const sleep = (ms: number) =>
    new Promise<void>((resolve) => setTimeout(resolve, ms));

  const ensureFontsLoaded = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const docWithFonts = document as any;
    const fonts: FontFaceSet | undefined = docWithFonts?.fonts;
    if (!fonts) {
      await sleep(150);
      return;
    }

    const samples = [
      "400 14px Inter",
      "500 16px Inter",
      "600 20px Inter",
      "400 14px 'Space Grotesk'",
    ];

    const loaders = samples.map((sample) =>
      fonts
        .load(sample)
        .then(() => undefined)
        .catch(() => undefined)
    );

    if (fonts.ready) {
      loaders.push(fonts.ready.then(() => undefined).catch(() => undefined));
    }

    await Promise.race([Promise.all(loaders), sleep(1200)]);
  };

  // Clamp scale to safe bounds
  const effectiveScale = Math.min(3.5, Math.max(1.5, Number(scale) || 2));
  await ensureFontsLoaded();

  // Helper: wait for all images within a node to be fully loaded
  const waitForImages = async (root: HTMLElement) => {
    const imgs = Array.from(root.querySelectorAll("img"));
    await Promise.all(
      imgs.map((img) =>
        img.complete && img.naturalWidth > 0
          ? typeof img.decode === "function"
            ? img
                .decode()
                .catch(() => undefined)
                .then(() => undefined)
            : Promise.resolve()
          : new Promise<void>((resolve) => {
              const done = () => resolve();
              img.addEventListener("load", done, { once: true });
              img.addEventListener("error", done, { once: true });
            })
      )
    );
  };

  // Helper: inline images as data URIs to avoid cross-origin tainting
  const buildFetchConfig = (src: string): RequestInit => {
    try {
      const url = new URL(src, window.location.href);
      const sameOrigin = url.origin === window.location.origin;
      if (sameOrigin) {
        return {
          mode: "same-origin",
          credentials: "include",
        } satisfies RequestInit;
      }
    } catch {
      // fall through to cross-origin defaults
    }
    return {
      mode: "cors",
      credentials: "omit",
    } satisfies RequestInit;
  };

  const inlineImages = async (root: HTMLElement) => {
    const imgs = Array.from(root.querySelectorAll("img"));
    await Promise.all(
      imgs.map(async (img) => {
        try {
          const src = img.currentSrc || img.src;
          if (!src || src.startsWith("data:")) return;
          const res = await fetch(src, buildFetchConfig(src));
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
  // Background stays light for consistent PDF output
  wrapper.style.padding = "0";
  wrapper.style.pointerEvents = "none";

  const clone = element.cloneNode(true) as HTMLElement;
  const computedFontFamily = (() => {
    try {
      return (
        window.getComputedStyle(element).fontFamily ||
        "Inter, 'Space Grotesk', 'Helvetica Neue', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      );
    } catch {
      return "Inter, 'Space Grotesk', 'Helvetica Neue', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    }
  })();

  clone.style.fontFamily = computedFontFamily;
  wrapper.style.fontFamily = computedFontFamily;
  // Determine a render width that preserves mobile layouts while still fitting on the page
  const naturalWidth = (() => {
    try {
      const intrinsic = element.scrollWidth || element.clientWidth;
      return Number.isFinite(intrinsic) && intrinsic > 0
        ? intrinsic
        : targetContentWidthPx;
    } catch {
      return targetContentWidthPx;
    }
  })();
  const renderWidthPx = Math.max(targetContentWidthPx, naturalWidth);
  clone.style.width = `${renderWidthPx}px`;
  clone.style.maxWidth = "none";
  clone.style.boxShadow = "none";
  clone.style.transform = "none";
  clone.style.filter = "none";
  // Background stays light for consistent PDF output
  clone.style.height = "auto";
  clone.style.maxHeight = "none";
  clone.style.overflow = "visible";
  // Ensure cloned node is positioned inside the wrapper (reset offscreen coords)
  try {
    clone.style.position = "relative";
    clone.style.left = "0";
    clone.style.top = "0";
  } catch {}

  // Convert modern CSS color functions (oklch, oklab, etc.) to rgb for html2canvas compatibility
  try {
    convertModernColorsToRgb(clone);
  } catch (e) {
    console.warn("Failed to convert modern colors:", e);
  }

  // ALWAYS use light mode for PDFs - remove dark mode variants and normalize colors
  try {
    // Remove all dark: variant classes
    clone.querySelectorAll("*").forEach((el) => {
      const htmlEl = el as HTMLElement;
      if (htmlEl.classList) {
        const classes = Array.from(htmlEl.classList);
        classes.forEach((cls) => {
          if (cls.startsWith("dark:")) {
            htmlEl.classList.remove(cls);
          }
        });
      }
    });

    // Force white page background
    clone.style.background = "#ffffff";
    wrapper.style.background = "#ffffff";

    // Normalize all elements to light mode
    clone.querySelectorAll("*").forEach((el) => {
      const htmlEl = el as HTMLElement;
      const computed = getComputedStyle(htmlEl);

      // Check if this is an intentionally dark design element (table headers, summary boxes)
      const hasDesignedDarkBg =
        htmlEl.classList.contains("bg-gray-800") ||
        htmlEl.classList.contains("bg-gray-900") ||
        htmlEl.classList.contains("bg-slate-800") ||
        htmlEl.classList.contains("bg-slate-900");

      if (hasDesignedDarkBg) {
        // Keep these dark with white text - they're part of the design
        return;
      }

      // For all other elements, ensure light backgrounds
      const bgColor = computed.backgroundColor;
      if (bgColor && bgColor.includes("rgb")) {
        const match = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (match) {
          const [, r, g, b] = match.map(Number);
          // If it's dark (from dark mode), make it white
          if (r < 128 && g < 128 && b < 128) {
            htmlEl.style.backgroundColor = "#ffffff";
          }
        }
      }

      // Ensure dark text on light backgrounds
      const textColor = computed.color;
      if (textColor && textColor.includes("rgb")) {
        const match = textColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (match) {
          const [, r, g, b] = match.map(Number);
          // If text is light (from dark mode), make it dark
          if (r > 200 && g > 200 && b > 200 && !hasDesignedDarkBg) {
            htmlEl.style.color = "#111111";
          }
        }
      }
    });
  } catch (err) {
    console.warn("Light mode normalization failed:", err);
  } // Normalize <img> elements to avoid lazy loading and CORS issues for html2canvas
  const imgs = Array.from(clone.querySelectorAll("img"));
  imgs.forEach((img) => {
    try {
      img.setAttribute("loading", "eager");
      // Allow CORS fetching when possible
      // @ts-ignore - HTMLImageElement supports crossOrigin
      if (!img.crossOrigin) {
        try {
          const imgUrl = new URL(img.src || "", window.location.href);
          const isSameOrigin = imgUrl.origin === window.location.origin;
          if (!isSameOrigin) {
            img.crossOrigin = "anonymous";
          }
        } catch {
          img.crossOrigin = "anonymous";
        }
      }
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

  // Ensure images are fully loaded and inlined to prevent Safari from dropping them
  await waitForImages(clone);
  await inlineImages(clone);

  // Additional cleanup: strip any remaining Tailwind dark utilities
  try {
    clone.querySelectorAll("[class]").forEach((el) => {
      const htmlEl = el as HTMLElement;
      const cls = htmlEl.className || "";
      if (typeof cls === "string") {
        // Remove dark mode class variants
        if (cls.includes("dark:")) {
          htmlEl.className = cls.replace(/\bdark:[\w-]+/g, "").trim();
        }
        // Don't override intentionally dark design elements (table headers, summary boxes)
        const hasDesignDark =
          /bg-gray-800|bg-gray-900|bg-slate-800|bg-slate-900/.test(cls);
        if (hasDesignDark) {
          // Keep these dark elements as-is
          return;
        }
      }
    });
  } catch {
    // ignore
  }

  // html2canvas renders the DOM to a canvas bitmap. Try WITHOUT foreignObject first
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
      foreignObjectRendering: false,
      windowWidth: renderWidthPx,
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

  // Fallback: retry WITH foreignObjectRendering and simpler styles
  if (!canvas || canvas.width < 2 || canvas.height < 2) {
    try {
      // Remove potential problematic styles
      clone.querySelectorAll("*").forEach((el) => {
        const style = (el as HTMLElement).style;
        if (!style) return;
        style.backdropFilter = "";
        style.filter = "";
        style.transform = "";
        // Avoid CSS colors that may use unsupported functions like oklch
        try {
          const cs = getComputedStyle(el as Element);
          const bg = cs.background || cs.backgroundColor || "";
          if (bg && bg.includes("oklch")) {
            (el as HTMLElement).style.background = "transparent";
            (el as HTMLElement).style.backgroundColor = "transparent";
          }
          const col = cs.color || "";
          if (col && col.includes("oklch")) {
            (el as HTMLElement).style.color = "#111";
          }
          const borderCol = cs.borderColor || "";
          if (borderCol && borderCol.includes("oklch")) {
            (el as HTMLElement).style.borderColor = "#ddd";
          }
        } catch {}
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
        foreignObjectRendering: true,
        windowWidth: renderWidthPx,
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

  // If all client-side attempts failed, silently fall back to server-side PDF generation
  // instead of throwing an error. The caller can handle the fallback by catching this
  // and requesting /api/invoices/[id]/pdf
  if (!canvas || canvas.width < 2 || canvas.height < 2) {
    console.warn(
      "Client PDF capture failed, recommend server fallback:",
      lastError
    );
    throw new Error("CLIENT_PDF_FAILED");
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

  // Center horizontally, align content to the top margin
  const posX = (pageWidth - targetWidth) / 2;
  const posY = mmMargin;

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
