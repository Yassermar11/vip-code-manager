import { CodeRecord, ImportBatch, AppSettings, CodeType } from '../types';

const CODES_KEY = 'vip_code_manager_codes';
const BATCHES_KEY = 'vip_code_manager_batches';
const SETTINGS_KEY = 'vip_code_manager_settings';

const INITIAL_SETTINGS: AppSettings = {
  defaultCodeType: 'qr',
  barcodeSymbology: 'CODE128',
  qrErrorCorrection: 'M',
  itemsPerPage: 12,
  supabaseUrl: '',
  supabaseAnonKey: '',
};

const INITIAL_BATCH: ImportBatch = {
  id: 'batch-sample-1',
  batch_name: 'Initial VIP Batch A',
  imported_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  total_codes: 5,
  imported_by: 'Cinema Management',
};

const INITIAL_CODES: CodeRecord[] = [
  {
    id: 'code-1',
    original_code: 'MA00501251378756',
    code_type: 'qr',
    validation_status: 'validated',
    usage_status: 'unused',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    validated_at: new Date(Date.now() - 86400000 * 1.5).toISOString(),
    used_at: null,
    batch_id: 'batch-sample-1',
  },
  {
    id: 'code-2',
    original_code: 'MA00501251378757',
    code_type: 'qr',
    validation_status: 'validated',
    usage_status: 'used',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    validated_at: new Date(Date.now() - 86400000 * 1.5).toISOString(),
    used_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    batch_id: 'batch-sample-1',
  },
  {
    id: 'code-3',
    original_code: 'MA00501251378758',
    code_type: 'barcode',
    validation_status: 'pending',
    usage_status: 'unused',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    validated_at: null,
    used_at: null,
    batch_id: 'batch-sample-1',
  },
  {
    id: 'code-4',
    original_code: 'MA00501251378759',
    code_type: 'barcode',
    validation_status: 'pending',
    usage_status: 'unused',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    validated_at: null,
    used_at: null,
    batch_id: 'batch-sample-1',
  },
  {
    id: 'code-5',
    original_code: 'MA00501251378760',
    code_type: 'qr',
    validation_status: 'validated',
    usage_status: 'unused',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    validated_at: new Date(Date.now() - 86400000 * 1.5).toISOString(),
    used_at: null,
    batch_id: 'batch-sample-1',
  },
];

export function getCodes(): CodeRecord[] {
  try {
    const data = localStorage.getItem(CODES_KEY);
    if (!data) {
      localStorage.setItem(CODES_KEY, JSON.stringify(INITIAL_CODES));
      return INITIAL_CODES;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Error reading codes from storage:', e);
    return INITIAL_CODES;
  }
}

export function saveCodes(codes: CodeRecord[]): void {
  try {
    localStorage.setItem(CODES_KEY, JSON.stringify(codes));
  } catch (e) {
    console.error('Error saving codes to storage:', e);
  }
}

export function getBatches(): ImportBatch[] {
  try {
    const data = localStorage.getItem(BATCHES_KEY);
    if (!data) {
      localStorage.setItem(BATCHES_KEY, JSON.stringify([INITIAL_BATCH]));
      return [INITIAL_BATCH];
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Error reading batches:', e);
    return [INITIAL_BATCH];
  }
}

export function saveBatches(batches: ImportBatch[]): void {
  try {
    localStorage.setItem(BATCHES_KEY, JSON.stringify(batches));
  } catch (e) {
    console.error('Error saving batches:', e);
  }
}

export function getSettings(): AppSettings {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (!data) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(INITIAL_SETTINGS));
      return INITIAL_SETTINGS;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Error reading settings:', e);
    return INITIAL_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings:', e);
  }
}

export function addImportBatch(
  batchName: string,
  rawCodes: string[],
  codeType: CodeType,
  importedBy = 'Cinema Staff'
): { addedCount: number; duplicateCount: number; invalidCount: number } {
  const codes = getCodes();
  const batches = getBatches();

  const existingCodesSet = new Set(codes.map((c) => c.original_code.trim()));
  const batchId = 'batch-' + Date.now();
  const now = new Date().toISOString();

  let addedCount = 0;
  let duplicateCount = 0;
  let invalidCount = 0;

  const newRecords: CodeRecord[] = [];

  for (let raw of rawCodes) {
    const cleaned = raw.trim();
    if (!cleaned) {
      invalidCount++;
      continue;
    }
    if (existingCodesSet.has(cleaned)) {
      duplicateCount++;
      continue;
    }
    // Prevent duplicates within the same import payload
    if (newRecords.some((r) => r.original_code === cleaned)) {
      duplicateCount++;
      continue;
    }

    existingCodesSet.add(cleaned);
    newRecords.push({
      id: 'code-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now().toString(36),
      original_code: cleaned,
      code_type: codeType,
      validation_status: 'pending',
      usage_status: 'unused',
      created_at: now,
      validated_at: null,
      used_at: null,
      batch_id: batchId,
    });
    addedCount++;
  }

  if (newRecords.length > 0) {
    codes.unshift(...newRecords);
    saveCodes(codes);

    const newBatch: ImportBatch = {
      id: batchId,
      batch_name: batchName || `Import Batch ${new Date().toLocaleDateString()}`,
      imported_at: now,
      total_codes: newRecords.length,
      imported_by: importedBy,
    };
    batches.unshift(newBatch);
    saveBatches(batches);
  }

  return { addedCount, duplicateCount, invalidCount };
}

export function updateCodeStatus(
  id: string,
  updates: Partial<CodeRecord>
): CodeRecord[] {
  const codes = getCodes();
  const updated = codes.map((c) => {
    if (c.id === id) {
      const updatedRecord = { ...c, ...updates };
      // Handle timestamps automatically if status changes
      if (updates.validation_status === 'validated' && c.validation_status !== 'validated') {
        updatedRecord.validated_at = new Date().toISOString();
      } else if (updates.validation_status === 'pending') {
        updatedRecord.validated_at = null;
      }

      if (updates.usage_status === 'used' && c.usage_status !== 'used') {
        updatedRecord.used_at = new Date().toISOString();
      } else if (updates.usage_status === 'unused') {
        updatedRecord.used_at = null;
      }
      return updatedRecord;
    }
    return c;
  });
  saveCodes(updated);
  return updated;
}

export function deleteCodeRecord(id: string): CodeRecord[] {
  const codes = getCodes();
  const filtered = codes.filter((c) => c.id !== id);
  saveCodes(filtered);
  return filtered;
}

export function deleteBatchRecords(batchId: string): { codes: CodeRecord[]; batches: ImportBatch[] } {
  const codes = getCodes();
  const batches = getBatches();
  const filteredCodes = codes.filter((c) => c.batch_id !== batchId);
  const filteredBatches = batches.filter((b) => b.id !== batchId);
  saveCodes(filteredCodes);
  saveBatches(filteredBatches);
  return { codes: filteredCodes, batches: filteredBatches };
}

export function clearAllData(): void {
  localStorage.removeItem(CODES_KEY);
  localStorage.removeItem(BATCHES_KEY);
  localStorage.removeItem(SETTINGS_KEY);
}
