import { jsPDF } from "jspdf";
import { ScanResult } from "../types";

export const generateLabReport = (
  data: ScanResult, 
  backImageBase64: string | null,
  frontImageBase64?: string | null
) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const midnight = "#0F172A";
  const accent = data.verdict_color;
  const isMismatch = !!data.consistency_warning;
  const now = new Date();
  
  // --- BACKGROUND & FRAME ---
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, 210, 297, "F"); // White paper
  
  // Outer Security Frame
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.rect(10, 10, 190, 277); // Main border

  // --- HEADER ---
  doc.setFillColor(midnight);
  doc.rect(10, 10, 190, 30, "F");

  // Logo / Title
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("LABEL LENS", 16, 22);
  doc.setFontSize(8);
  doc.setTextColor(150, 200, 255);
  doc.text("FORENSIC NUTRITION ANALYSIS UNIT", 16, 28);

  // Meta Info (Monospace/Courier as requested)
  doc.setFont("courier", "bold");
  doc.setFontSize(9);
  doc.setTextColor(220, 220, 220);
  
  const metaX = 135;
  doc.text(`CASE ID: ${now.getTime().toString().slice(-8)}`, metaX, 19);
  doc.text(`DATE:    ${now.toLocaleDateString()}`, metaX, 24);
  doc.text(`STATUS:  ${isMismatch ? "FLAGGED" : "VERIFIED"}`, metaX, 29);
  
  if (isMismatch) {
    doc.setTextColor(255, 100, 100);
    doc.text(`STATUS:  MISMATCH`, metaX, 29);
  }

  // --- VERDICT SECTION ---
  const verdictY = 55;
  
  // Score Circle
  doc.setDrawColor(accent);
  doc.setLineWidth(2);
  doc.circle(30, verdictY + 4, 14, "S");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(0, 0, 0);
  doc.text(data.purity_score.toString(), 30, verdictY + 6, { align: "center" });
  doc.setFontSize(6);
  doc.text("PURITY SCORE", 30, verdictY + 12, { align: "center" });

  // Verdict Title
  doc.setFontSize(24);
  doc.setTextColor(accent);
  doc.text(data.verdict_title.toUpperCase(), 55, verdictY + 4);
  
  // Summary
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  const summaryLines = doc.splitTextToSize(data.summary, 135);
  doc.text(summaryLines, 55, verdictY + 12);

  let currentY = verdictY + 12 + (summaryLines.length * 5) + 10;

  // Warning Box (if exists)
  if (data.consistency_warning || data.freshness_analysis) {
    const text = data.consistency_warning 
      ? `⚠ ALARM: ${data.consistency_warning}` 
      : `FRESHNESS: ${data.freshness_analysis}`;
    
    doc.setFontSize(9);
    doc.setTextColor(data.consistency_warning ? 200 : 0, data.consistency_warning ? 0 : 100, 0);
    
    const splitWarn = doc.splitTextToSize(text, 180);
    const boxH = (splitWarn.length * 5) + 6;
    
    // Background
    doc.setFillColor(data.consistency_warning ? 255 : 240, data.consistency_warning ? 240 : 255, 240);
    doc.setDrawColor(data.consistency_warning ? 255 : 100, data.consistency_warning ? 0 : 150, 0);
    doc.rect(15, currentY, 180, boxH, "FD");
    
    doc.text(splitWarn, 18, currentY + 5);
    currentY += boxH + 10;
  }

  // --- VISUAL EVIDENCE BOX ---
  // "Draw a black rectangular border below the title. Add label FIG 1... Place image inside."
  
  const boxHeight = 70;
  const boxWidth = 180;
  const boxX = 15;
  
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.rect(boxX, currentY, boxWidth, boxHeight); // The Box
  
  // Label inside box
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(0, 0, 0);
  doc.text("FIG 1: VISUAL EVIDENCE", boxX + 2, currentY + 4);

  // Image Placement Logic
  const imgY = currentY + 6;
  const imgH = boxHeight - 8;
  const imgMaxW = (boxWidth / 2) - 4; // Max width if 2 images
  
  if (frontImageBase64 && backImageBase64) {
    // Dual Images: Side by Side
    try {
      doc.addImage(`data:image/jpeg;base64,${frontImageBase64}`, "JPEG", boxX + 2, imgY, imgMaxW, imgH, undefined, 'FAST');
      doc.addImage(`data:image/jpeg;base64,${backImageBase64}`, "JPEG", boxX + 2 + imgMaxW + 2, imgY, imgMaxW, imgH, undefined, 'FAST');
    } catch (e) {}
  } else if (backImageBase64) {
    // Single Image: Centered
    // Calculate aspect ratio to fit nicely? For now, we fit to height and center.
    const singleImgW = 80; 
    const singleImgX = boxX + (boxWidth - singleImgW) / 2;
    try {
      doc.addImage(`data:image/jpeg;base64,${backImageBase64}`, "JPEG", singleImgX, imgY, singleImgW, imgH, undefined, 'FAST');
    } catch (e) {}
  }

  currentY += boxHeight + 15;

  // --- STAMP (Overlapping Evidence) ---
  const stampX = 160;
  const stampY = currentY - 20; 
  const angle = 20; 
  
  doc.setDrawColor(204, 51, 51); // Faded Red
  doc.setTextColor(204, 51, 51);
  doc.setLineWidth(1);
  doc.circle(stampX, stampY, 16, "S");
  doc.circle(stampX, stampY, 14, "S");
  
  doc.setFontSize(6);
  doc.setFont("helvetica", "bold");
  doc.text("OFFICIAL AUDIT", stampX, stampY - 8, { align: "center", angle: angle });
  doc.text("LABEL LENS", stampX, stampY + 1, { align: "center", angle: angle });
  doc.text(isMismatch ? "REJECTED" : "VERIFIED", stampX, stampY + 9, { align: "center", angle: angle });

  // --- STRUCTURED LISTS ---
  
  // Header Row
  doc.setFillColor(midnight);
  doc.rect(15, currentY, 180, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text("COMPOUND BREAKDOWN", 18, currentY + 5);
  doc.text("NUTRITION PROFILE", 110, currentY + 5);

  currentY += 14;
  
  // Columns
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  const colWidth = 85;
  const startY = currentY;
  
  // Left Column: Ingredients
  let leftY = startY;
  const ingredients = data.additives_found.length ? data.additives_found : ["Natural Composition"];
  
  ingredients.slice(0, 15).forEach(item => {
    const text = `•  ${item}`;
    const splitText = doc.splitTextToSize(text, colWidth);
    doc.text(splitText, 18, leftY);
    leftY += (splitText.length * 5) + 2; // +2 for vertical spacing between bullets
  });

  // Right Column: Nutrients
  let rightY = startY;
  data.nutrients_highlight.slice(0, 15).forEach(item => {
    const text = `•  ${item}`;
    const splitText = doc.splitTextToSize(text, colWidth);
    doc.text(splitText, 110, rightY);
    rightY += (splitText.length * 5) + 2;
  });

  // --- SIGNATURE BLOCK ---
  const bottomY = 270;
  
  // Line
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(130, bottomY, 190, bottomY);
  
  // Label
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(0, 0, 0);
  doc.text("AUTHORIZED SIGNATURE", 160, bottomY + 4, { align: "center" });
  
  // Script Signature
  doc.setFont("times", "italic");
  doc.setFontSize(16);
  doc.text("LabelLens AI", 160, bottomY - 2, { align: "center" });

  // --- FOOTER ---
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  
  // Timestamp Fix: toLocaleString()
  doc.text(`Generated: ${now.toLocaleString()}`, 15, 285);
  doc.text("Page 1 of 1", 195, 285, { align: "right" });

  doc.save(`LabelLens_Report_${now.getTime()}.pdf`);
};
