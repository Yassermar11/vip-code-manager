import React, { useState } from 'react';
import { AppSettings, CodeItem, Language, ThemeMode } from '../types';
import { t } from '../utils/translations';
import { FileDown, Sun, Moon, Globe } from 'lucide-react';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

interface SettingsViewProps {
  settings: AppSettings;
  codes: CodeItem[];
  onUpdateSettings: (newSettings: AppSettings) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  codes,
  onUpdateSettings,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' },
    { code: 'ar', label: 'العربية' },
  ];

  const currentLangLabel = languages.find((l) => l.code === settings.language)?.label || 'English';

  const handleThemeToggle = () => {
    const nextTheme: ThemeMode = settings.theme === 'dark' ? 'light' : 'dark';
    onUpdateSettings({ ...settings, theme: nextTheme });
  };

  const handleExportPdf = async () => {
    if (codes.length === 0) {
      alert('No codes to export.');
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
      const cols = 3;
      const rows = 4;
      const cellWidth = printableWidth / cols;
      const cellHeight = (pageHeight - margin * 2 - 15) / rows;

      let countOnPage = 0;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('VIP Codes QR Export', margin, margin);

      setExportProgress(30);

      for (let i = 0; i < codes.length; i++) {
        const item = codes[i];

        if (countOnPage > 0 && countOnPage % (cols * rows) === 0) {
          doc.addPage();
          countOnPage = 0;
        }

        const colIndex = countOnPage % cols;
        const rowIndex = Math.floor((countOnPage % (cols * rows)) / cols);

        const x = margin + colIndex * cellWidth + 2;
        const y = margin + 10 + rowIndex * cellHeight;

        doc.setDrawColor(200, 200, 200);
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(x, y, cellWidth - 4, cellHeight - 4, 2, 2, 'FD');

        doc.setFont('courier', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.text(item.original_code, x + (cellWidth - 4) / 2, y + 8, { align: 'center' });

        const canvas = document.createElement('canvas');
        await QRCode.toCanvas(canvas, item.original_code, { width: 120, margin: 1 });
        const imgData = canvas.toDataURL('image/png');
        doc.addImage(imgData, 'PNG', x + (cellWidth - 4 - 28) / 2, y + 12, 28, 28);

        countOnPage++;
        if (i % 10 === 0) {
          setExportProgress(30 + Math.floor((i / codes.length) * 60));
        }
      }

      setExportProgress(95);
      doc.save(`vip_qrs_${Date.now()}.pdf`);
      setExportProgress(100);
      setTimeout(() => setIsExporting(false), 500);
    } catch (err) {
      console.error('PDF export error:', err);
      alert('Failed to export PDF.');
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 p-4">
      <div className="border border-gray-300 dark:border-gray-700 rounded p-6 bg-white dark:bg-gray-900 shadow-sm space-y-6">
        {/* Theme Mode */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {settings.theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            <span className="font-medium">{t(settings.language, 'themeMode')}</span>
          </div>
          <button
            onClick={handleThemeToggle}
            className="bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-semibold py-1.5 px-4 rounded text-sm transition"
          >
            {settings.theme === 'dark' ? t(settings.language, 'darkMode') : t(settings.language, 'lightMode')}
          </button>
        </div>

        {/* Language */}
        <div className="relative flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5" />
            <span className="font-medium">{t(settings.language, 'language')}</span>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowLangDropdown(!showLangDropdown)}
              className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded py-1.5 px-3 text-sm font-medium flex items-center space-x-2 transition focus:outline-none"
            >
              <span>{currentLangLabel}</span>
              <span className="text-xs opacity-75">▼</span>
            </button>

            {showLangDropdown && (
              <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded shadow-lg z-30 py-1">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onUpdateSettings({ ...settings, language: lang.code });
                      setShowLangDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm transition hover:bg-gray-100 dark:hover:bg-gray-800 ${
                      settings.language === lang.code
                        ? 'font-bold text-blue-600 dark:text-blue-400'
                        : 'text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* PDF Export */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={handleExportPdf}
            disabled={isExporting || codes.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded flex items-center justify-center space-x-2 transition disabled:opacity-50"
          >
            <FileDown className="w-5 h-5" />
            <span>{isExporting ? `Exporting (${exportProgress}%)...` : t(settings.language, 'exportPdf')}</span>
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
            {codes.length} codes available for PDF export
          </p>
        </div>
      </div>
    </div>
  );
};
