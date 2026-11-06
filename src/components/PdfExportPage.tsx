import React, { useState } from 'react';
import { CodeRecord } from '../types';
import { FileDown, Printer, CheckCircle2, QrCode, Barcode, ShieldCheck, Filter } from 'lucide-react';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';

interface PdfExportPageProps {
  codes: CodeRecord[];
}

export const PdfExportPage: React.FC<PdfExportPageProps> = ({ codes }) => {
  const [filterMode, setFilterMode] = useState<'all' | 'available' | 'validated' | 'unused'>('all');
  const [itemsPerPage, setItemsPerPage] = useState<number>(12);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const getFilteredCodes = () => {
    return codes.filter((c) => {
      if (filterMode === 'available') return c.usage_status === 'unused';
      if (filterMode === 'validated') return c.validation_status === 'validated';
      if (filterMode === 'unused') return c.usage_status === 'unused';
      return true;
    });
  };

  const targetCodes = getFilteredCodes();

  const handleGeneratePdf = async () => {
    if (targetCodes.length === 0) {
      alert('No codes match the selected export criteria.');
      return;
    }

    setIsExporting(true);
    setExportProgress(10);

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const printableWidth = pageWidth - margin * 2;

      // Layout calculation based on itemsPerPage (e.g. 6, 12, 24)
      let cols = 3;
      let rows = 4;
      if (itemsPerPage <= 6) {
        cols = 2;
        rows = 3;
      } else if (itemsPerPage >= 24) {
        cols = 3;
        rows = 8;
      }

      const cellWidth = printableWidth / cols;
      const cellHeight = (pageHeight - margin * 2 - 15) / rows;

      let currentX = margin;
      let currentY = margin + 15; // Space for header
      let countOnPage = 0;

      // Draw header on first page
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(15, 23, 42);
      doc.text('VIP Cinema Ticket Code Export', margin, margin);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Generated: ${new Date().toLocaleString()} | Filter: ${filterMode.toUpperCase()} | Total: ${targetCodes.length}`, margin, margin + 6);

      setExportProgress(30);

      for (let i = 0; i < targetCodes.length; i++) {
        const code = targetCodes[i];

        if (countOnPage > 0 && countOnPage % itemsPerPage === 0) {
          doc.addPage();
          countOnPage = 0;
          currentY = margin + 10;
        }

        const colIndex = countOnPage % cols;
        const rowIndex = Math.floor((countOnPage % itemsPerPage) / cols);

        const x = margin + colIndex * cellWidth + 2;
        const y = margin + 15 + rowIndex * cellHeight;

        // Draw card border
        doc.setDrawColor(203, 213, 225);
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(x, y, cellWidth - 4, cellHeight - 4, 3, 3, 'FD');

        // Render original code text ABOVE
        doc.setFont('courier', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
        doc.text(code.original_code, x + (cellWidth - 4) / 2, y + 8, { align: 'center' });

        // Generate image data URL for QR or Barcode
        const canvas = document.createElement('canvas');
        if (code.code_type === 'qr') {
          await QRCode.toCanvas(canvas, code.original_code, { width: 140, margin: 1 });
          const imgData = canvas.toDataURL('image/png');
          doc.addImage(imgData, 'PNG', x + (cellWidth - 4 - 32) / 2, y + 12, 32, 32);
        } else {
          try {
            JsBarcode(canvas, code.original_code, { format: 'CODE128', width: 2, height: 40, displayValue: false, margin: 2 });
            const imgData = canvas.toDataURL('image/png');
            doc.addImage(imgData, 'PNG', x + (cellWidth - 4 - 38) / 2, y + 14, 38, 24);
          } catch (e) {
            console.error('PDF barcode render error:', e);
          }
        }

        // Status pill text
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(71, 85, 105);
        const statusText = `${code.code_type.toUpperCase()} | ${code.validation_status.toUpperCase()} | ${code.usage_status.toUpperCase()}`;
        doc.text(statusText, x + (cellWidth - 4) / 2, y + cellHeight - 8, { align: 'center' });

        countOnPage++;
        if (i % 10 === 0) {
          setExportProgress(30 + Math.floor((i / targetCodes.length) * 60));
        }
      }

      setExportProgress(95);
      doc.save(`VIP_Ticket_Codes_${filterMode}_${Date.now()}.pdf`);
      setExportProgress(100);
      setTimeout(() => setIsExporting(false), 500);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Failed to generate PDF. Please try again.');
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-white tracking-tight">PDF Export Studio</h2>
        <p className="text-slate-400 text-sm mt-1">
          Generate high-resolution printable PDF sheets containing original ticket text above scannable QR codes and barcodes.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Filter selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Export Filter</label>
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Codes ({codes.length} total)</option>
              <option value="available">Available Unused Codes ({codes.filter(c => c.usage_status === 'unused').length})</option>
              <option value="validated">Validated Codes Only ({codes.filter(c => c.validation_status === 'validated').length})</option>
              <option value="unused">Unused Codes ({codes.filter(c => c.usage_status === 'unused').length})</option>
            </select>
          </div>

          {/* Items per page */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Codes Per Page Layout</label>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
            >
              <option value={6}>6 Codes per page (Large & Clear)</option>
              <option value={12}>12 Codes per page (Standard Grid)</option>
              <option value={24}>24 Codes per page (Compact Sheet)</option>
            </select>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
          <div>
            <span className="text-sm font-bold text-white block">Ready for Export</span>
            <span className="text-xs text-slate-400">
              {targetCodes.length} codes will be included in the printable PDF document.
            </span>
          </div>

          <button
            onClick={handleGeneratePdf}
            disabled={isExporting || targetCodes.length === 0}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold text-sm flex items-center space-x-2 shadow-lg shadow-blue-600/30 disabled:opacity-40 transition-all"
          >
            <FileDown className="w-4 h-4" />
            <span>{isExporting ? `Exporting (${exportProgress}%)` : 'Generate & Download PDF'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
