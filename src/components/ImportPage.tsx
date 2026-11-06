import React, { useState } from 'react';
import { CodeType, CodeRecord } from '../types';
import { UploadCloud, FileSpreadsheet, FileText, CheckCircle2, AlertTriangle, ArrowRight, Check, X, ShieldAlert } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ImportPageProps {
  existingCodes: CodeRecord[];
  onImportBatch: (batchName: string, rawCodes: string[], codeType: CodeType) => { addedCount: number; duplicateCount: number; invalidCount: number };
  onSuccessNavigate: () => void;
}

export const ImportPage: React.FC<ImportPageProps> = ({
  existingCodes,
  onImportBatch,
  onSuccessNavigate,
}) => {
  const [importMethod, setImportMethod] = useState<'bulk' | 'file'>('bulk');
  const [batchName, setBatchName] = useState(`VIP Batch ${new Date().toLocaleDateString()}`);
  const [codeType, setCodeType] = useState<CodeType>('qr');
  const [bulkText, setBulkText] = useState('');

  // Preview state
  const [parsedCodes, setParsedCodes] = useState<string[]>([]);
  const [previewStats, setPreviewStats] = useState<{
    valid: string[];
    duplicates: string[];
    invalidCount: number;
  } | null>(null);

  const [importResult, setImportResult] = useState<{
    added: number;
    duplicates: number;
    invalid: number;
  } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    const reader = new FileReader();
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    if (isExcel) {
      reader.onload = (evt) => {
        try {
          const data = new Uint8Array(evt.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array', cellText: true, raw: false });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1 });

          let extracted: string[] = [];
          jsonData.forEach((row) => {
            if (Array.isArray(row)) {
              row.forEach((cell) => {
                if (cell !== null && cell !== undefined) {
                  const val = String(cell).trim();
                  if (val) extracted.push(val);
                }
              });
            }
          });
          processParsedCodes(extracted);
        } catch (err) {
          console.error('Error parsing Excel file:', err);
          alert('Failed to parse Excel file. Please ensure it is a valid .xlsx file.');
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      // CSV or plain text
      reader.onload = (evt) => {
        try {
          const text = evt.target?.result as string;
          // Split by newline or comma
          const lines = text.split(/\r?\n/);
          let extracted: string[] = [];
          lines.forEach((line) => {
            // If CSV row, split by comma or tab
            const parts = line.split(/,|\t/);
            parts.forEach((p) => {
              const cleaned = p.replace(/^["']|["']$/g, '').trim();
              if (cleaned) extracted.push(cleaned);
            });
          });
          processParsedCodes(extracted);
        } catch (err) {
          console.error('Error parsing CSV file:', err);
          alert('Failed to parse file.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleProcessBulkText = () => {
    const lines = bulkText.split(/\r?\n/);
    processParsedCodes(lines);
  };

  const processParsedCodes = (rawList: string[]) => {
    const existingSet = new Set(existingCodes.map((c) => c.original_code.trim()));
    const valid: string[] = [];
    const duplicates: string[] = [];
    let invalidCount = 0;

    const seenInBatch = new Set<string>();

    rawList.forEach((raw) => {
      const cleaned = raw.trim();
      if (!cleaned) {
        return;
      }
      if (existingSet.has(cleaned) || seenInBatch.has(cleaned)) {
        duplicates.push(cleaned);
      } else {
        seenInBatch.add(cleaned);
        valid.push(cleaned);
      }
    });

    setParsedCodes([...valid, ...duplicates]);
    setPreviewStats({
      valid,
      duplicates,
      invalidCount,
    });
  };

  const handleConfirmImport = () => {
    if (!previewStats || previewStats.valid.length === 0) return;
    const result = onImportBatch(batchName, previewStats.valid, codeType);
    setImportResult({
      added: result.addedCount,
      duplicates: result.duplicateCount,
      invalid: result.invalidCount,
    });
    setPreviewStats(null);
    setBulkText('');
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-white tracking-tight">Import Ticket Codes</h2>
        <p className="text-slate-400 text-sm mt-1">
          Import large batches of ticket codes from CSV, Excel (.xlsx), or manual paste. Preserves leading zeros and formatting.
        </p>
      </div>

      {importResult ? (
        <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-8 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">Import Completed Successfully!</h3>
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto py-2">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="block text-2xl font-bold text-emerald-400">{importResult.added}</span>
              <span className="text-xs text-slate-400">Added</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="block text-2xl font-bold text-amber-400">{importResult.duplicates}</span>
              <span className="text-xs text-slate-400">Duplicates Skipped</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="block text-2xl font-bold text-slate-300">{importResult.invalid}</span>
              <span className="text-xs text-slate-400">Invalid</span>
            </div>
          </div>
          <div className="pt-4 flex justify-center space-x-3">
            <button
              onClick={() => setImportResult(null)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            >
              Import Another Batch
            </button>
            <button
              onClick={onSuccessNavigate}
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/30 transition-all"
            >
              View All Codes
            </button>
          </div>
        </div>
      ) : previewStats ? (
        /* Preview Step */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white">Import Preview & Validation</h3>
              <p className="text-xs text-slate-400">Review codes before saving into database</p>
            </div>
            <button
              onClick={() => setPreviewStats(null)}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg font-semibold"
            >
              Back to Import
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Valid New Codes</span>
              <div className="text-3xl font-bold text-white mt-1">{previewStats.valid.length}</div>
              <p className="text-xs text-slate-400 mt-1">Ready to be generated and stored.</p>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Duplicates Detected</span>
              <div className="text-3xl font-bold text-white mt-1">{previewStats.duplicates.length}</div>
              <p className="text-xs text-slate-400 mt-1">Will be automatically skipped.</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">First 20 Codes Preview</label>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 max-h-60 overflow-y-auto font-mono text-xs text-slate-300 space-y-1">
              {previewStats.valid.slice(0, 20).map((code, idx) => (
                <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-900 last:border-0">
                  <span>{code}</span>
                  <span className="text-emerald-400 font-sans text-[11px]">Valid</span>
                </div>
              ))}
              {previewStats.valid.length > 20 && (
                <div className="text-center text-slate-500 pt-2 font-sans">
                  ...and {previewStats.valid.length - 20} more codes.
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              onClick={() => setPreviewStats(null)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmImport}
              disabled={previewStats.valid.length === 0}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/30 disabled:opacity-40 transition-all"
            >
              Confirm & Import ({previewStats.valid.length} codes)
            </button>
          </div>
        </div>
      ) : (
        /* Import Form */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Batch Name</label>
              <input
                type="text"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500"
                placeholder="e.g. VIP Screening Batch 01"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Generation Format</label>
              <select
                value={codeType}
                onChange={(e) => setCodeType(e.target.value as CodeType)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="qr">QR Code (Electronic Tickets)</option>
                <option value="barcode">Barcode (Physical Tickets)</option>
              </select>
            </div>
          </div>

          {/* Import Method Tabs */}
          <div className="flex border-b border-slate-800">
            <button
              onClick={() => setImportMethod('bulk')}
              className={`pb-3 px-4 font-semibold text-sm transition-all border-b-2 ${
                importMethod === 'bulk'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Manual Paste / Bulk Entry
            </button>
            <button
              onClick={() => setImportMethod('file')}
              className={`pb-3 px-4 font-semibold text-sm transition-all border-b-2 ${
                importMethod === 'file'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Upload CSV or Excel (.xlsx)
            </button>
          </div>

          {importMethod === 'bulk' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Paste Ticket Codes (One code per row)
                </label>
                <textarea
                  rows={8}
                  placeholder={`MA00501251378756\nMA00501251378757\nMA00501251378758`}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-mono text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                onClick={handleProcessBulkText}
                disabled={!bulkText.trim()}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-semibold text-sm shadow-lg shadow-blue-600/30 disabled:opacity-40 transition-all"
              >
                Preview Import Codes
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-2xl p-8 text-center bg-slate-950/50 transition-all">
                <FileSpreadsheet className="w-12 h-12 mx-auto text-blue-400 mb-3 opacity-80" />
                <h4 className="font-bold text-white text-base mb-1">Upload CSV or Excel file</h4>
                <p className="text-xs text-slate-400 mb-4 max-w-md mx-auto">
                  Accepts .csv, .xlsx, or .xls files containing ticket codes. Leading zeros and original string formatting will be fully preserved.
                </p>
                <label className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm cursor-pointer shadow-lg shadow-blue-600/30 transition-all">
                  <span>Browse File</span>
                  <input
                    type="file"
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
