import React, { useState } from 'react';
import { CodeItem, Language } from '../types';
import { t } from '../utils/translations';
import { CodeGenerator } from './CodeGenerator';
import { ChevronLeft, ChevronRight, Trash2, AlertTriangle } from 'lucide-react';

interface CodeViewerProps {
  codes: CodeItem[];
  language: Language;
  onClearCodes: () => void;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ codes, language, onClearCodes }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);

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

  return (
    <div className="max-w-md mx-auto space-y-6 p-4">
      {/* Clear All button positioned above total codes on the right */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowConfirm(true)}
          className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-1.5 px-3 rounded flex items-center space-x-1.5 transition shadow-sm"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{t(language, 'clearAll')}</span>
        </button>
      </div>

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

      {/* Custom Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-6 max-w-sm w-full shadow-xl space-y-4">
            <div className="flex items-center space-x-3 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {t(language, 'clearAll')}
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {t(language, 'confirmClearAll')}
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded text-sm transition"
              >
                {t(language, 'cancel')}
              </button>
              <button
                onClick={() => {
                  setShowConfirm(false);
                  onClearCodes();
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded text-sm transition"
              >
                {t(language, 'confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
