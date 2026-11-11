import React from 'react';
import { ActiveTab, Language } from '../types';
import { t } from '../utils/translations';
import { PlusCircle, QrCode, Settings } from 'lucide-react';

interface NavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  language: Language;
  codesCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  language,
  codesCount,
}) => {
  return (
    <nav className="border-b border-gray-200 dark:border-gray-800/80 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm sticky top-0 z-20">
      <div className="max-w-2xl mx-auto flex items-center justify-around p-3">
        <button
          onClick={() => setActiveTab('import')}
          className={`flex items-center space-x-2 py-2 px-3 sm:px-4 rounded-xl font-medium text-sm transition-all duration-200 active:scale-95 ${
            activeTab === 'import'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
          title={t(language, 'importTab')}
        >
          <PlusCircle className="w-4 h-4 flex-shrink-0" />
          {activeTab === 'import' && <span>{t(language, 'importTab')}</span>}
        </button>

        <button
          onClick={() => setActiveTab('viewer')}
          className={`flex items-center space-x-2 py-2 px-3 sm:px-4 rounded-xl font-medium text-sm transition-all duration-200 relative active:scale-95 ${
            activeTab === 'viewer'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
          title={t(language, 'viewerTab')}
        >
          <QrCode className="w-4 h-4 flex-shrink-0" />
          {activeTab === 'viewer' && <span>{t(language, 'viewerTab')}</span>}
          {codesCount > 0 && activeTab !== 'viewer' && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
              {codesCount}
            </span>
          )}
          {codesCount > 0 && activeTab === 'viewer' && (
            <span className="ml-1 bg-white/20 text-white text-xs font-bold px-1.5 py-0.2 rounded-full">
              {codesCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center space-x-2 py-2 px-3 sm:px-4 rounded-xl font-medium text-sm transition-all duration-200 active:scale-95 ${
            activeTab === 'settings'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
          title={t(language, 'settingsTab')}
        >
          <Settings className="w-4 h-4 flex-shrink-0" />
          {activeTab === 'settings' && <span>{t(language, 'settingsTab')}</span>}
        </button>
      </div>
    </nav>
  );
};
