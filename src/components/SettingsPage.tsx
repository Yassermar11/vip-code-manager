import React, { useState } from 'react';
import { AppSettings, CodeType } from '../types';
import { Settings, ShieldCheck, Database, Download, Upload, Trash2, Check, RefreshCw } from 'lucide-react';

interface SettingsPageProps {
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  onExportJson: () => void;
  onClearAll: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  onSaveSettings,
  onExportJson,
  onClearAll,
}) => {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [savedMessage, setSavedMessage] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-white tracking-tight">Application Settings</h2>
        <p className="text-slate-400 text-sm mt-1">
          Configure default code generation formats, barcode symbology, QR error correction, and database synchronization.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Generation Preferences */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-white">Generation Preferences</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Default Code Format</label>
              <select
                value={formData.defaultCodeType}
                onChange={(e) => setFormData({ ...formData, defaultCodeType: e.target.value as CodeType })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="qr">QR Code</option>
                <option value="barcode">Barcode</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Barcode Symbology</label>
              <select
                value={formData.barcodeSymbology}
                onChange={(e) => setFormData({ ...formData, barcodeSymbology: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="CODE128">CODE 128 (Standard)</option>
                <option value="CODE39">CODE 39</option>
                <option value="EAN13">EAN-13</option>
                <option value="UPC">UPC</option>
              </select>
            </div>
          </div>
        </div>

        {/* Supabase Integration (Prepared) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Supabase Cloud Database Integration</h3>
              <p className="text-xs text-slate-400">Connect to Supabase for multi-user real-time ticket validation syncing.</p>
            </div>
            <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs px-2.5 py-1 rounded-full font-semibold">
              Prepared
            </span>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Supabase Project URL</label>
              <input
                type="text"
                placeholder="https://xyzproject.supabase.co"
                value={formData.supabaseUrl}
                onChange={(e) => setFormData({ ...formData, supabaseUrl: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Supabase Anon Key</label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={formData.supabaseAnonKey}
                onChange={(e) => setFormData({ ...formData, supabaseAnonKey: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Note: Credentials are kept secure in local environment storage and never exposed in client source code repositories.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          {savedMessage ? (
            <div className="flex items-center space-x-2 text-emerald-400 text-sm font-semibold animate-pulse">
              <Check className="w-4 h-4" />
              <span>Settings saved successfully!</span>
            </div>
          ) : (
            <div></div>
          )}
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all"
          >
            Save Settings
          </button>
        </div>
      </form>

      {/* Data Management & Backup */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-white">Data Backup & Management</h3>
        <p className="text-xs text-slate-400">Export all stored codes and batches as JSON or reset local state.</p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={onExportJson}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center space-x-2 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export Data Backup (JSON)</span>
          </button>

          {clearConfirm ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  onClearAll();
                  setClearConfirm(false);
                }}
                className="bg-red-600 hover:bg-red-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-red-600/30 transition-all"
              >
                Confirm Clear All Data
              </button>
              <button
                onClick={() => setClearConfirm(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2.5 rounded-xl text-sm font-semibold"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setClearConfirm(true)}
              className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center space-x-2 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All Data</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
