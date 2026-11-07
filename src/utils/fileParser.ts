import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export async function parseFileToCodes(file: File): Promise<string[]> {
  const fileName = file.name.toLowerCase();
  const codes: string[] = [];

  if (fileName.endsWith('.txt') || fileName.endsWith('.csv')) {
    const text = await file.text();
    const lines = text.split(/\r?\n/);
    lines.forEach((line) => {
      const parts = line.split(/,|\t/);
      parts.forEach((p) => {
        const cleaned = p.replace(/^["']|["']$/g, '').trim();
        if (cleaned) codes.push(cleaned);
      });
    });
  } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array', cellText: true, raw: false });
    const firstSheet = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheet];
    const jsonData = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
    jsonData.forEach((row) => {
      if (Array.isArray(row)) {
        row.forEach((cell) => {
          if (cell !== null && cell !== undefined) {
            const val = String(cell).trim();
            if (val) codes.push(val);
          }
        });
      }
    });
  } else if (fileName.endsWith('.docx')) {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    const text = result.value;
    const lines = text.split(/\r?\n/);
    lines.forEach((line) => {
      const parts = line.split(/\s+/);
      parts.forEach((p) => {
        const cleaned = p.trim();
        if (cleaned) codes.push(cleaned);
      });
    });
  } else if (fileName.endsWith('.pdf')) {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDoc = await loadingTask.promise;

    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const textContent = await page.getTextContent();
      textContent.items.forEach((item: any) => {
        if (item.str) {
          const val = item.str.trim();
          if (val) codes.push(val);
        }
      });
    }
  }

  // Clean and filter duplicates/empty strings
  return Array.from(new Set(codes.map(c => c.trim()))).filter(Boolean);
}
