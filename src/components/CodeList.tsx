import React, { useState, useMemo } from 'react';
import { CodeRecord, CodeType, ValidationStatus, UsageStatus } from '../types';
import { CodeGenerator } from './CodeGenerator';
import { Search, Filter, Trash2, Edit2, CheckCircle2, XCircle, Clock, QrCode, Barcode, Plus, AlertTriangle, Check, X } from 'lucide-react';

interface CodeListProps {
  codes: CodeRecord[];
  onUpdateStatus: (id: string, updates: Partial<CodeRecord>) => void;
  onDeleteCode: (id: string) => void;
  onAddManualCode: (codeText: string, codeType: CodeType) => void;
}

export const CodeList: React.FC<CodeListProps> = ({
  codes,
  onUpdateStatus,
  onDeleteCode,
  onAddManualCode,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterValidation, setFilterValidation] = useState<string>('all');
  const [filterUsage, setFilterUsage] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Edit modal state
  const [editingCode, setEditingCode] = useState<CodeRecord | null>(null);
  const [editOriginalText, setEditOriginalText] = useState('');
  const [editCodeType, setEditCodeType] = useState<CodeType>('qr');

  // Manual Add Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCodeText, setNewCodeText] = useState('');
  const [newCodeType, setNewCodeType] = useState<CodeType>('qr');
  const [addError, setAddError] = useState('');

  // Delete confirmation state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredCodes = useMemo(() => {
    return codes.filter((c) => {
      const matchesSearch = c.original_code.toLowerCase().includes(searchQuery.toLowerCase().trim());
      const matchesValidation = filterValidation === 'all' || c.validation_status === filterValidation;
      const matchesUsage = filterUsage === 'all' || c.usage_status === filterUsage;
      const matchesType = filterType === 'all' || c.code_type === filterType;
      return matchesSearch && matchesValidation && matchesUsage && matchesType;
    });
  }, [codes, searchQuery, filterValidation, filterUsage, filterType]);

  const totalPages = Math.ceil(filteredCodes.length / itemsPerPage) || 1;
  const paginatedCodes = filteredCodes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleOpenEdit = (code: CodeRecord) => {
    setEditingCode(code);
    setEditOriginalText(code.original_code);
    setEditCodeType(code.code_type);
  };

  const handleSaveEdit = () => {
    if (!editingCode || !editOriginalText.trim()) return;
    onUpdateStatus(editingCode.id, {
      original_code: editOriginalText.trim(),
      code_type: editCodeType,
    });
    setEditingCode(null);
  };

  const handleCreateManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCodeText.trim()) {
      setAddError('Code text cannot be empty');
      return;
    }
    if (codes.some((c) => c.original_code === newCodeText.trim())) {
      setAddError('This code already exists in the system');
      return;
    }
    onAddManualCode(newCodeText.trim(), newCodeType);
    setNewCodeText('');
    setIsAddModalOpen(false);
    setAddError('');
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* Page Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">All Ticket Codes</h2>
          <p className="text-slate-400 text-sm mt-1">
            Showing {filteredCodes.length} of {codes.length} total codes stored in database.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Single Code</span>
        </button>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-sm space-y-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ticket code (e.g. MA00501251378756)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-all"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Validation Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Validation Status</label>
            <select
              value={filterValidation}
              onChange={(e) => {
                setFilterValidation(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Validations</option>
              <option value="pending">Pending Validation</option>
              <option value="validated">Validated</option>
            </select>
          </div>

          {/* Usage Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Usage Status</label>
            <select
              value={filterUsage}
              onChange={(e) => {
                setFilterUsage(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Usages</option>
              <option value="unused">Unused (Available)</option>
              <option value="used">Used (Scanned)</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Code Type</label>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Types (QR & Barcode)</option>
              <option value="qr">QR Code</option>
              <option value="barcode">Barcode</option>
            </select>
          </div>
        </div>
      </div>

      {/* Code Cards Grid */}
      {paginatedCodes.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <QrCode className="w-12 h-12 mx-auto mb-3 opacity-30 text-blue-400" />
          <h3 className="text-lg font-bold text-white mb-1">No ticket codes found</h3>
          <p className="text-sm">Try adjusting your search query or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedCodes.map((code) => (
            <div
              key={code.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-slate-700 transition-all"
            >
              <div>
                {/* Header: Type and Status badges */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold uppercase ${
                    code.code_type === 'qr'
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                  }`}>
                    {code.code_type === 'qr' ? 'QR Code' : 'Barcode'}
                  </span>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() =>
                        onUpdateStatus(code.id, {
                          validation_status: code.validation_status === 'validated' ? 'pending' : 'validated',
                        })
                      }
                      title={`Click to mark as ${code.validation_status === 'validated' ? 'Pending' : 'Validated'}`}
                      className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${
                        code.validation_status === 'validated'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25'
                      }`}
                    >
                      {code.validation_status === 'validated' ? 'Validated' : 'Pending'}
                    </button>

                    <button
                      onClick={() =>
                        onUpdateStatus(code.id, {
                          usage_status: code.usage_status === 'used' ? 'unused' : 'used',
                        })
                      }
                      title={`Click to mark as ${code.usage_status === 'used' ? 'Unused' : 'Used'}`}
                      className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${
                        code.usage_status === 'used'
                          ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30 hover:bg-purple-500/25'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {code.usage_status === 'used' ? 'Used' : 'Unused'}
                    </button>
                  </div>
                </div>

                {/* Code Generator & Original Text */}
                <div className="my-3">
                  <CodeGenerator
                    value={code.original_code}
                    type={code.code_type}
                    width={180}
                    height={75}
                  />
                </div>

                {/* Timestamps / Meta */}
                <div className="text-[11px] text-slate-400 space-y-1 mt-3 pt-3 border-t border-slate-800">
                  <div className="flex justify-between">
                    <span>Added:</span>
                    <span>{new Date(code.created_at).toLocaleString()}</span>
                  </div>
                  {code.validated_at && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Validated at:</span>
                      <span>{new Date(code.validated_at).toLocaleTimeString()}</span>
                    </div>
                  )}
                  {code.used_at && (
                    <div className="flex justify-between text-purple-400">
                      <span>Used at:</span>
                      <span>{new Date(code.used_at).toLocaleTimeString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800/80">
                <button
                  onClick={() => handleOpenEdit(code)}
                  className="text-xs text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => setDeletingId(code.id)}
                  className="text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 pt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="bg-slate-900 border border-slate-800 text-slate-300 px-4 py-2 rounded-xl text-sm disabled:opacity-40 hover:bg-slate-800 transition-all"
          >
            Previous
          </button>
          <span className="text-sm text-slate-400 px-3">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="bg-slate-900 border border-slate-800 text-slate-300 px-4 py-2 rounded-xl text-sm disabled:opacity-40 hover:bg-slate-800 transition-all"
          >
            Next
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {editingCode && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Edit Ticket Code</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Original Code Text</label>
              <input
                type="text"
                value={editOriginalText}
                onChange={(e) => setEditOriginalText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Code Type</label>
              <select
                value={editCodeType}
                onChange={(e) => setEditCodeType(e.target.value as CodeType)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="qr">QR Code</option>
                <option value="barcode">Barcode</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setEditingCode(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/30 transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Add Single Ticket Code</h3>
            <form onSubmit={handleCreateManual} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Original Code Text</label>
                <input
                  type="text"
                  placeholder="e.g. MA00501251378761"
                  value={newCodeText}
                  onChange={(e) => {
                    setNewCodeText(e.target.value);
                    setAddError('');
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-blue-500"
                  autoFocus
                />
                {addError && <p className="text-xs text-red-400 mt-1">{addError}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Code Type</label>
                <select
                  value={newCodeType}
                  onChange={(e) => setNewCodeType(e.target.value as CodeType)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="qr">QR Code</option>
                  <option value="barcode">Barcode</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/30"
                >
                  Add Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto border border-red-500/20">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Delete Ticket Code?</h3>
            <p className="text-xs text-slate-400">
              This action cannot be undone. The generated code will be permanently removed.
            </p>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteCode(deletingId);
                  setDeletingId(null);
                }}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-red-600/30"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
