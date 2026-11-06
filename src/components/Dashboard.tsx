import React from 'react';
import { CodeRecord, ImportBatch, ActiveTab } from '../types';
import { Ticket, CheckCircle2, AlertCircle, Clock, UploadCloud, FileDown, ArrowRight, ShieldCheck, QrCode, Barcode } from 'lucide-react';
import { CodeGenerator } from './CodeGenerator';

interface DashboardProps {
  codes: CodeRecord[];
  batches: ImportBatch[];
  setActiveTab: (tab: ActiveTab) => void;
  onQuickValidate: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  codes,
  batches,
  setActiveTab,
  onQuickValidate,
}) => {
  const totalCodes = codes.length;
  const validatedCodes = codes.filter((c) => c.validation_status === 'validated').length;
  const pendingCodes = codes.filter((c) => c.validation_status === 'pending').length;
  const usedCodes = codes.filter((c) => c.usage_status === 'used').length;
  const unusedCodes = codes.filter((c) => c.usage_status === 'unused').length;

  const recentCodes = codes.slice(0, 5);

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900/40 via-slate-900 to-slate-900 border border-blue-500/20 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-semibold mb-3 border border-blue-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>VIP Cinema Operations</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Ticket Control & Management Dashboard
            </h2>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Manage, validate, track usage, and generate scannable QR codes and barcodes for hundreds of VIP admission tickets.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('import')}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center space-x-2 shadow-lg shadow-blue-600/30 transition-all"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Import Codes</span>
            </button>
            <button
              onClick={() => setActiveTab('export')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center space-x-2 border border-slate-700 transition-all"
            >
              <FileDown className="w-4 h-4" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-blue-500/10 p-2.5 rounded-xl text-blue-400 border border-blue-500/20">
              <Ticket className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-slate-400">Total</span>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-white tracking-tight">{totalCodes}</div>
          <p className="text-xs text-slate-400 mt-1">Total imported codes</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-emerald-500/10 p-2.5 rounded-xl text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-emerald-400">Validated</span>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-white tracking-tight">{validatedCodes}</div>
          <p className="text-xs text-slate-400 mt-1">{pendingCodes} pending validation</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-amber-500/10 p-2.5 rounded-xl text-amber-400 border border-amber-500/20">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-amber-400">Unused</span>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-white tracking-tight">{unusedCodes}</div>
          <p className="text-xs text-slate-400 mt-1">Ready for screening</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-purple-500/10 p-2.5 rounded-xl text-purple-400 border border-purple-500/20">
              <AlertCircle className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-purple-400">Used</span>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-white tracking-tight">{usedCodes}</div>
          <p className="text-xs text-slate-400 mt-1">Already scanned/entered</p>
        </div>
      </div>

      {/* Recent Codes & Import Batches Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Codes List */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Recent Ticket Codes</h3>
              <p className="text-xs text-slate-400">Latest codes added to the system</p>
            </div>
            <button
              onClick={() => setActiveTab('codes')}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentCodes.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Ticket className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>No codes found. Import codes to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentCodes.map((code) => (
                <div
                  key={code.id}
                  className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:border-slate-700 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-white text-sm bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                        {code.original_code}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                        code.code_type === 'qr' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                      }`}>
                        {code.code_type}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-slate-400 pt-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium ${
                        code.validation_status === 'validated' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {code.validation_status === 'validated' ? 'Validated' : 'Pending Validation'}
                      </span>
                      <span>•</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium ${
                        code.usage_status === 'used' ? 'bg-purple-500/10 text-purple-400' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {code.usage_status === 'used' ? 'Used' : 'Unused'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-center">
                    {code.validation_status === 'pending' && (
                      <button
                        onClick={() => onQuickValidate(code.id)}
                        className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      >
                        Mark Validated
                      </button>
                    )}
                    <button
                      onClick={() => setActiveTab('codes')}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold"
                    >
                      Manage
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Import Batches Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white tracking-tight">Import Batches</h3>
              <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-medium">
                {batches.length} Batches
              </span>
            </div>

            <div className="space-y-3">
              {batches.slice(0, 4).map((batch) => (
                <div key={batch.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-white text-sm truncate max-w-[160px]" title={batch.batch_name}>
                      {batch.batch_name}
                    </span>
                    <span className="text-xs font-bold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">
                      {batch.total_codes} codes
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                    <span>By: {batch.imported_by}</span>
                    <span>{new Date(batch.imported_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <button
              onClick={() => setActiveTab('import')}
              className="w-full bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center space-x-2 transition-all"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Import New Batch</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
