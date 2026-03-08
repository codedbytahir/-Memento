/**
 * Core logic for generating biography PDFs using jsPDF.
 * It handles document styling, content layout, page breaks, and branding elements for the final biography report.
 */
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export async function generateBiographyPDF(story: string, images: string[] = []): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  doc.setFont('georgia', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(31, 56, 100);
  doc.text('Memento', margin, 30);

  doc.setFontSize(10);
  doc.setTextColor(44, 44, 44);
  doc.text('PRESERVE YOUR STORY', margin, 38);

  doc.setFontSize(18);
  doc.setTextColor(31, 56, 100);
  doc.text('My Life Story', margin, 55);

  doc.setFont('times', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(44, 44, 44);

  const splitText = doc.splitTextToSize(story, contentWidth);
  doc.text(splitText, margin, 70);

  let yPos = 70 + (splitText.length * 6);

  for (const imageUrl of images) {
    if (yPos + 80 > pageHeight) {
      doc.addPage();
      yPos = margin;
    }

    try {
        doc.rect(margin, yPos, contentWidth, 60);
        doc.text('[Image Placeholder]', margin + 10, yPos + 30);
        yPos += 70;
    } catch (e) {
        console.error('Failed to add image to PDF', e);
    }
  }

  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  }

  return doc.output('blob');
}
