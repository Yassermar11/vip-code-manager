export type CodeType = 'qr' | 'barcode';
export type ValidationStatus = 'pending' | 'validated';
export type UsageStatus = 'unused' | 'used';

export interface CodeRecord {
  id: string;
  original_code: string;
  code_type: CodeType;
  validation_status: ValidationStatus;
  usage_status: UsageStatus;
  created_at: string;
  validated_at: string | null;
  used_at: string | null;
  batch_id: string | null;
}

export interface ImportBatch {
  id: string;
  batch_name: string;
  imported_at: string;
  total_codes: number;
  imported_by: string;
}

export interface AppSettings {
  defaultCodeType: CodeType;
  barcodeSymbology: string;
  qrErrorCorrection: 'L' | 'M' | 'Q' | 'H';
  itemsPerPage: number;
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export type ActiveTab = 'dashboard' | 'codes' | 'import' | 'export' | 'settings';
