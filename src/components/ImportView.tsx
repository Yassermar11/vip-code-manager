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
      <div className="border border-gray-300 rounded p-6 bg-white shadow-sm dark:bg-gray-900 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4">{t(language, 'manualTitle')}</h2>
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <textarea
            rows={6}
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            placeholder={t(language, 'manualPlaceholder')}
            className="w-full p-3 border border-gray-300 rounded font-mono text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded transition"
          >
            {t(language, 'generateBtn')}
          </button>
        </form>
      </div>

      <div className="border border-gray-300 rounded p-6 bg-white shadow-sm dark:bg-gray-900 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-2">{t(language, 'fileTitle')}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t(language, 'fileHint')}</p>

        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded p-6 text-center">
          <Upload className="w-10 h-10 mx-auto mb-2 text-gray-400" />
          <label className="inline-block bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded cursor-pointer transition">
            <span>Choose File</span>
            <input
              type="file"
              accept=".txt,.csv,.xlsx,.xls,.docx,.pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {isLoading && <p className="text-center text-sm text-blue-500 mt-3">Processing file...</p>}
        {errorMessage && (
          <div className="flex items-center space-x-2 text-red-500 text-sm mt-3">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="flex items-center space-x-2 text-green-500 text-sm mt-3">
            <Check className="w-4 h-4" />
            <span>{successMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
