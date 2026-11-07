import React, { useState } from 'react';
import { CodeItem, Language } from '../types';
import { t } from '../utils/translations';
import { CodeGenerator } from './CodeGenerator';
import { ChevronLeft, ChevronRight, Trash2, Download } from 'lucide-react';

interface CodeViewerProps {
  codes: CodeItem[];
  language: Language;
  onDeleteCode: (id: string) => void;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ codes, language, onDeleteCode }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (codes.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4">
        <p className="text-gray-500 dark:text-gray-400 text-lg">{t(language, 'noCodes')}</p>
      </div>
    );
  }

  const currentCode = codes[currentIndex] || codes[0];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : codes.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < codes.length - 1 ? prev + 1 : 0));
  };

  const handleDownloadCurrent = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `qrcode_${currentCode.original_code}.png`;
    a.click();
  };

  return (
    <div className="max-w-md mx-auto space-y-6 p-4">
      <div className="flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 px-4 py-2 rounded shadow-sm">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t(language, 'totalCodes')}: {codes.length}
        </span>
        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
          {currentIndex + 1} / {codes.length}
        </span>
      </div>

      <div className="flex justify-center">
        <CodeGenerator value={currentCode.original_code} size={240} />
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={handlePrev}
          className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold py-3 px-4 rounded flex items-center justify-center space-x-2 transition"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>{t(language, 'previous')}</span>
        </button>

        <button
          onClick={handleNext}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded flex items-center justify-center space-x-2 transition"
        >
          <span>{t(language, 'next')}</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-300 dark:border-gray-700">
        <button
          onClick={handleDownloadCurrent}
          className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2 px-3 rounded flex items-center space-x-1.5 transition"
        >
          <Download className="w-4 h-4" />
          <span>{t(language, 'downloadQr')}</span>
        </button>

        <button
          onClick={() => {
            onDeleteCode(currentCode.id);
            if (currentIndex >= codes.length - 1 && currentIndex > 0) {
              setCurrentIndex(currentIndex - 1);
            }
          }}
          className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2 px-3 rounded flex items-center space-x-1.5 transition"
        >
          <Trash2 className="w-4 h-4" />
          <span>{t(language, 'deleteCode')}</span>
        </button>
      </div>
    </div>
  );
};
