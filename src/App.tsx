import React, { useState, useEffect } from 'react';
import { ActiveTab, CodeItem, AppSettings } from './types';
import { Navigation } from './components/Navigation';
import { ImportView } from './components/ImportView';
import { CodeViewer } from './components/CodeViewer';
import { SettingsView } from './components/SettingsView';

const CODES_STORAGE_KEY = 'simple_vip_codes';
const SETTINGS_STORAGE_KEY = 'simple_vip_settings';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('import');
  const [codes, setCodes] = useState<CodeItem[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'dark',
    language: 'en',
  });

  useEffect(() => {
    try {
      const savedCodes = localStorage.getItem(CODES_STORAGE_KEY);
      if (savedCodes) setCodes(JSON.parse(savedCodes));

      const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings((prev) => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      console.error('Error loading from storage:', e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CODES_STORAGE_KEY, JSON.stringify(codes));
    } catch (e) {
      console.error('Error saving codes:', e);
    }
  }, [codes]);

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings:', e);
    }

    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    if (settings.language === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
    }
  }, [settings]);

  const handleCodesGenerated = (newCodes: CodeItem[]) => {
    setCodes(newCodes);
  };

  const handleClearCodes = () => {
    setCodes([]);
  };

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
  };

  return (
    <div className={settings.theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 transition-colors">
        <Navigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          language={settings.language}
          codesCount={codes.length}
        />

        <main className="py-6">
          {activeTab === 'import' && (
            <ImportView
              language={settings.language}
              onCodesGenerated={handleCodesGenerated}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'viewer' && (
            <CodeViewer
              codes={codes}
              language={settings.language}
              onClearCodes={handleClearCodes}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              codes={codes}
              onUpdateSettings={handleUpdateSettings}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
