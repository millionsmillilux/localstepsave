import type { ResumeDoc } from "./resume-doc";
import type { ResumeTemplate } from "./types";

// Standard PDF fonts only cover basic Latin; normalize punctuation so nothing renders as boxes.
function ascii(text: string) {
  return text
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/[\u2022\u00B7]/g, "-")
    .replace(/[^\x09\x0A\x0D\x20-\x7E\u00A0-\u00FF]/g, "");
}

export function resumeFileName(doc: ResumeDoc, ext: string) {
  const base = doc.name.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "") || "Resume";
  return `${base}_Resume.${ext}`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

/** US Letter PDF with real, selectable text (ATS-readable), wrapping and page breaks. */
export async function buildResumePdf(doc: ResumeDoc, template: ResumeTemplate): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "pt", format: "letter" });
  const W = 612, H = 792, M = 54, CW = W - M * 2;
  const font = template === "classic" ? "times" : "helvetica";
  const accent: [number, number, number] = template === "modern" ? [30, 64, 120] : [20, 20, 20];
  const base = template === "classic" ? 11 : 10;
  let y = M;

  const ensure = (h: number) => {
    if (y + h > H - M) { pdf.addPage(); y = M; }
  };
  const lines = (text: string, size: number, width = CW) => {
    pdf.setFontSize(size);
    return pdf.splitTextToSize(ascii(text), width) as string[];
  };
  const lh = (size: number) => size * 1.3;

  // Header
  const center = template !== "modern";
  pdf.setFont(font, "bold");
  pdf.setTextColor(...accent);
  for (const l of lines(doc.name, 20)) {
    ensure(lh(20));
    pdf.text(l, center ? W / 2 : M, y + 16, { align: center ? "center" : "left" });
    y += lh(20);
  }
  pdf.setTextColor(60, 60, 60);
  pdf.setFont(font, "normal");
  if (doc.contactLine) {
    for (const l of lines(doc.contactLine, base - 1)) {
      ensure(lh(base));
      pdf.text(l, center ? W / 2 : M, y + base, { align: center ? "center" : "left" });
      y += lh(base - 1);
    }
  }
  y += 6;

  for (const section of doc.sections) {
    // Keep a section heading with at least its first two lines.
    ensure(lh(base) * 3 + 18);
    y += 8;
    pdf.setFont(font, "bold");
    pdf.setFontSize(base + 1);
    pdf.setTextColor(...accent);
    pdf.text(ascii(template === "minimal" ? section.title : section.title.toUpperCase()), M, y + base);
    y += lh(base + 1);
    if (template !== "minimal") {
      pdf.setDrawColor(...accent);
      pdf.setLineWidth(template === "modern" ? 1.2 : 0.6);
      pdf.line(M, y - 2, W - M, y - 2);
    }
    y += 4;
    pdf.setTextColor(25, 25, 25);

    if (section.kind === "text") {
      pdf.setFont(font, "normal");
      for (const l of lines(section.text, base)) {
        ensure(lh(base));
        pdf.text(l, M, y + base);
        y += lh(base);
      }
      continue;
    }

    for (const item of section.items) {
      if (item.heading) {
        pdf.setFont(font, "bold");
        pdf.setFontSize(base);
        const dates = item.dates ? ascii(item.dates) : "";
        const datesW = dates ? pdf.getTextWidth(dates) + 12 : 0;
        const head = item.sub ? `${item.heading}, ${item.sub}` : item.heading;
        const headLines = lines(head, base, CW - datesW);
        ensure(lh(base) * Math.min(2, headLines.length + 1));
        headLines.forEach((l, i) => {
          ensure(lh(base));
          pdf.setFont(font, "bold");
          pdf.text(l, M, y + base);
          if (i === 0 && dates) {
            pdf.setFont(font, "normal");
            pdf.text(dates, W - M, y + base, { align: "right" });
          }
          y += lh(base);
        });
      }
      pdf.setFont(font, "normal");
      for (const b of item.bullets) {
        const bl = lines(b, base, CW - 14);
        bl.forEach((l, i) => {
          ensure(lh(base));
          if (i === 0) pdf.text("-", M + 3, y + base);
          pdf.text(l, M + 14, y + base);
          y += lh(base);
        });
      }
      y += 4;
    }
  }
  return pdf.output("blob");
}

export async function buildResumeDocx(doc: ResumeDoc, template: ResumeTemplate): Promise<Blob> {
  const d = await import("docx");
  const font = template === "classic" ? "Times New Roman" : "Arial";
  const color = template === "modern" ? "1E4078" : "141414";
  const size = template === "classic" ? 22 : 20;
  const center = template !== "modern";
  const children: InstanceType<typeof d.Paragraph>[] = [
    new d.Paragraph({
      alignment: center ? d.AlignmentType.CENTER : d.AlignmentType.LEFT,
      children: [new d.TextRun({ text: doc.name, bold: true, size: 40, color, font })],
    }),
  ];
  if (doc.contactLine) {
    children.push(new d.Paragraph({
      alignment: center ? d.AlignmentType.CENTER : d.AlignmentType.LEFT,
      spacing: { after: 120 },
      children: [new d.TextRun({ text: doc.contactLine, size: size - 2, font, color: "404040" })],
    }));
  }
  for (const s of doc.sections) {
    children.push(new d.Paragraph({
      keepNext: true,
      spacing: { before: 200, after: 80 },
      ...(template === "minimal" ? {} : { border: { bottom: { style: d.BorderStyle.SINGLE, size: 6, color, space: 1 } } }),
      children: [new d.TextRun({ text: template === "minimal" ? s.title : s.title.toUpperCase(), bold: true, size: size + 2, color, font })],
    }));
    if (s.kind === "text") {
      children.push(new d.Paragraph({ children: [new d.TextRun({ text: s.text, size, font })] }));
      continue;
    }
    for (const item of s.items) {
      if (item.heading) {
        children.push(new d.Paragraph({
          keepNext: true,
          tabStops: [{ type: d.TabStopType.RIGHT, position: 9360 }],
          spacing: { before: 80 },
          children: [
            new d.TextRun({ text: item.heading, bold: true, size, font }),
            ...(item.sub ? [new d.TextRun({ text: `, ${item.sub}`, size, font })] : []),
            ...(item.dates ? [new d.TextRun({ text: `\t${item.dates}`, size, font })] : []),
          ],
        }));
      }
      for (const b of item.bullets) {
        children.push(new d.Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new d.TextRun({ text: b, size, font })] }));
      }
    }
  }
  const document = new d.Document({
    numbering: {
      config: [{
        reference: "bullets",
        levels: [{ level: 0, format: d.LevelFormat.BULLET, text: "•", alignment: d.AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 240 } } } }],
      }],
    },
    sections: [{
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, bottom: 1080, left: 1440, right: 1440 } } },
      children,
    }],
  });
  return d.Packer.toBlob(document);
}

export async function downloadResume(doc: ResumeDoc, template: ResumeTemplate, kind: "pdf" | "docx") {
  const blob = kind === "pdf" ? await buildResumePdf(doc, template) : await buildResumeDocx(doc, template);
  downloadBlob(blob, resumeFileName(doc, kind));
}
