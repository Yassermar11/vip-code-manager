import React, { useState, useEffect } from 'react';
import { ActiveTab, CodeRecord, ImportBatch, AppSettings, CodeType } from './types';
import {
  getCodes,
  saveCodes,
  getBatches,
  saveBatches,
  getSettings,
  saveSettings,
  addImportBatch,
  updateCodeStatus,
  deleteCodeRecord,
  clearAllData,
} from './services/storage';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { CodeList } from './components/CodeList';
import { ImportPage } from './components/ImportPage';
import { PdfExportPage } from './components/PdfExportPage';
import { SettingsPage } from './components/SettingsPage';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [codes, setCodes] = useState<CodeRecord[]>([]);
  const [batches, setBatches] = useState<ImportBatch[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    defaultCodeType: 'qr',
    barcodeSymbology: 'CODE128',
    qrErrorCorrection: 'M',
    itemsPerPage: 12,
    supabaseUrl: '',
    supabaseAnonKey: '',
  });

  useEffect(() => {
    setCodes(getCodes());
    setBatches(getBatches());
    setSettings(getSettings());
  }, []);

  const handleUpdateStatus = (id: string, updates: Partial<CodeRecord>) => {
    const updated = updateCodeStatus(id, updates);
    setCodes([...updated]);
  };

  const handleDeleteCode = (id: string) => {
    const updated = deleteCodeRecord(id);
    setCodes([...updated]);
  };

  const handleQuickValidate = (id: string) => {
    handleUpdateStatus(id, { validation_status: 'validated' });
  };

  const handleImportBatch = (batchName: string, rawCodes: string[], codeType: CodeType) => {
    const result = addImportBatch(batchName, rawCodes, codeType);
    setCodes(getCodes());
    setBatches(getBatches());
    return result;
  };

  const handleAddManualCode = (codeText: string, codeType: CodeType) => {
    const now = new Date().toISOString();
    const newRecord: CodeRecord = {
      id: 'code-' + Math.random().toString(36).substring(2, 9),
      original_code: codeText,
      code_type: codeType,
      validation_status: 'pending',
      usage_status: 'unused',
      created_at: now,
      validated_at: null,
      used_at: null,
      batch_id: 'manual-add',
    };
    const updated = [newRecord, ...codes];
    saveCodes(updated);
    setCodes(updated);
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    saveSettings(newSettings);
    setSettings(newSettings);
  };

  const handleExportJson = () => {
    const data = {
      codes,
      batches,
      settings,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vip_code_manager_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearAll = () => {
    clearAllData();
    setCodes(getCodes());
    setBatches(getBatches());
    setSettings(getSettings());
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Navigation (Sidebar on desktop, Top/Bottom bar on mobile) */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalCodesCount={codes.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 max-w-7xl mx-auto w-full transition-all">
        {activeTab === 'dashboard' && (
          <Dashboard
            codes={codes}
            batches={batches}
            setActiveTab={setActiveTab}
            onQuickValidate={handleQuickValidate}
          />
        )}

        {activeTab === 'codes' && (
          <CodeList
            codes={codes}
            onUpdateStatus={handleUpdateStatus}
            onDeleteCode={handleDeleteCode}
            onAddManualCode={handleAddManualCode}
          />
        )}

        {activeTab === 'import' && (
          <ImportPage
            existingCodes={codes}
            onImportBatch={handleImportBatch}
            onSuccessNavigate={() => setActiveTab('codes')}
          />
        )}

        {activeTab === 'export' && (
          <PdfExportPage codes={codes} />
        )}

        {activeTab === 'settings' && (
          <SettingsPage
            settings={settings}
            onSaveSettings={handleSaveSettings}
            onExportJson={handleExportJson}
            onClearAll={handleClearAll}
          />
        )}
      </main>
    </div>
  );
}

export default App;
