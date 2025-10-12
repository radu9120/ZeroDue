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
  // Render a cloned, print-sized version of the node offscreen to improve fidelity
  const mmToPx = (mm: number) => Math.round((mm * 96) / 25.4);
  const initialMmMargin = (margin * 25.4) / 96; // keep mm-based margin value
  const pageFormat = format === "letter" ? "letter" : "a4";

  const pageWidthMm = pageFormat === "letter" ? 215.9 : 210; // Letter: 8.5in, A4: 210mm
  const targetContentWidthPx = mmToPx(pageWidthMm) - 2 * margin; // approx content width in px

  // Clone element into a hidden container to normalize layout for printing
  const wrapper = document.createElement("div");
  wrapper.style.position = "fixed";
  wrapper.style.left = "-10000px";
  wrapper.style.top = "0";
  wrapper.style.zIndex = "-1";
  wrapper.style.background = "#ffffff";
  wrapper.style.padding = "0";

  const clone = element.cloneNode(true) as HTMLElement;
  // Normalize width to A4/Letter printable width to minimize downscaling blurriness
  clone.style.width = `${targetContentWidthPx}px`;
  clone.style.maxWidth = `${targetContentWidthPx}px`;
  clone.style.boxShadow = "none";
  clone.style.transform = "none";
  clone.style.filter = "none";
  clone.style.background = "#ffffff";

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  // html2canvas renders the DOM to a canvas bitmap respecting CSS; foreignObject handles modern CSS (e.g., oklch)
  const canvas = await html2canvas(clone, {
    scale,
    useCORS: true,
    scrollX: 0,
    scrollY: 0,
    backgroundColor: "#ffffff",
    foreignObjectRendering: true,
    windowWidth: targetContentWidthPx,
  });

  // Cleanup DOM
  document.body.removeChild(wrapper);

  const imgData = canvas.toDataURL("image/png");

  // PDF sizes in mm
  const pdf = new jsPDF({
    unit: "mm",
    format: pageFormat,
    orientation: "portrait",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Convert canvas px to mm preserving aspect ratio
  const pxToMm = (px: number) => (px * 25.4) / 96; // 96dpi CSS pixel
  const imgWidthMm = pxToMm(canvas.width);
  const imgHeightMm = pxToMm(canvas.height);

  // Fit width to page considering margins
  const mmMargin = initialMmMargin;
  const targetWidth = pageWidth - 2 * mmMargin;
  const scaleFactor = targetWidth / imgWidthMm;
  const targetHeight = imgHeightMm * scaleFactor;

  let remainingHeight = targetHeight;
  let positionY = mmMargin;
  let imgY = 0; // in the scaled image space

  // Add pages while slicing the tall image vertically
  while (remainingHeight > 0) {
    const sliceHeight = Math.min(remainingHeight, pageHeight - 2 * mmMargin);

    // Create a temporary canvas slice per page
    const sliceCanvas = document.createElement("canvas");
    const sliceCtx = sliceCanvas.getContext("2d");
    if (!sliceCtx) break;

    const pagePxHeight =
      ((pageHeight - 2 * mmMargin) * 96) / 25.4 / scaleFactor; // height in original canvas px units for this page

    sliceCanvas.width = canvas.width;
    sliceCanvas.height = Math.min(
      canvas.height - imgY,
      Math.round(pagePxHeight)
    );
    sliceCtx.fillStyle = "#ffffff";
    sliceCtx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
    sliceCtx.drawImage(
      canvas,
      0,
      imgY,
      canvas.width,
      sliceCanvas.height,
      0,
      0,
      sliceCanvas.width,
      sliceCanvas.height
    );

    const sliceImg = sliceCanvas.toDataURL("image/png");
    const sliceHeightMm = ((sliceCanvas.height * 25.4) / 96) * scaleFactor; // scaled to fit width

    pdf.addImage(
      sliceImg,
      "PNG",
      mmMargin,
      positionY,
      targetWidth,
      sliceHeightMm,
      undefined,
      "SLOW" // favor quality
    );

    remainingHeight -= sliceHeightMm;
    imgY += sliceCanvas.height; // move down in source canvas

    if (remainingHeight > 1) {
      pdf.addPage();
      positionY = mmMargin;
    }
  }

  pdf.save(filename);
}
