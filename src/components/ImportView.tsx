import React, { useState } from 'react';
import { CodeItem, Language, ActiveTab } from '../types';
import { t } from '../utils/translations';
import { parseFileToCodes } from '../utils/fileParser';
import { Upload, FileText, Check, AlertCircle } from 'lucide-react';

interface ImportViewProps {
  language: Language;
  onCodesGenerated: (newCodes: CodeItem[]) => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const ImportView: React.FC<ImportViewProps> = ({
  language,
  onCodesGenerated,
  setActiveTab,
}) => {
  const [manualText, setManualText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleGenerate = async (parsedCodes: string[]) => {
    if (parsedCodes.length === 0) {
      setErrorMessage('No valid codes found.');
      return;
    }

    const items: CodeItem[] = parsedCodes.map((code, idx) => ({
      id: 'code-' + Date.now() + '-' + idx,
      original_code: code,
    }));

    onCodesGenerated(items);
    setSuccessMessage(`Successfully generated ${items.length} codes!`);
    setErrorMessage('');
    setTimeout(() => {
      setActiveTab('viewer');
    }, 800);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lines = manualText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    handleGenerate(lines);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    setIsLoading(true);
    setErrorMessage('');
    try {
      const parsed = await parseFileToCodes(file);
      setIsLoading(false);
      handleGenerate(parsed);
    } catch (err) {
      console.error('File parsing error:', err);
      setIsLoading(false);
      setErrorMessage('Failed to parse file. Please verify file format.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4">
      <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-6 bg-white dark:bg-gray-900 shadow-sm transition-all">
        <h2 className="text-lg font-bold mb-3 text-gray-900 dark:text-gray-100">{t(language, 'manualTitle')}</h2>
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <textarea
            rows={6}
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            placeholder={t(language, 'manualPlaceholder')}
            className="w-full p-3.5 border border-gray-200 dark:border-gray-700/80 rounded-xl font-mono text-sm bg-gray-50/50 dark:bg-gray-800/50 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md shadow-blue-600/20 active:scale-[0.99] transition-all"
          >
            {t(language, 'generateBtn')}
          </button>
        </form>
      </div>

      <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-6 bg-white dark:bg-gray-900 shadow-sm transition-all">
        <h2 className="text-lg font-bold mb-1 text-gray-900 dark:text-gray-100">{t(language, 'fileTitle')}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t(language, 'fileHint')}</p>

        <div className="border-2 border-dashed border-gray-200 dark:border-gray-700/80 rounded-xl p-8 text-center bg-gray-50/30 dark:bg-gray-800/20 hover:border-blue-500/50 transition-colors">
          <Upload className="w-10 h-10 mx-auto mb-3 text-blue-500 opacity-80" />
          <label className="inline-block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/80 text-gray-800 dark:text-gray-200 font-semibold py-2.5 px-5 rounded-xl cursor-pointer shadow-sm transition active:scale-95">
            <span>Choose File</span>
            <input
              type="file"
              accept=".txt,.csv,.xlsx,.xls,.docx,.pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {isLoading && <p className="text-center text-sm font-medium text-blue-500 mt-4 animate-pulse">Processing file...</p>}
        {errorMessage && (
          <div className="flex items-center space-x-2 text-red-500 text-sm mt-4 p-3 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-900/50">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="flex items-center space-x-2 text-green-600 dark:text-green-400 text-sm mt-4 p-3 bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-200 dark:border-green-900/50">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
