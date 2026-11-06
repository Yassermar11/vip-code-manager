# VIP Code Manager — Mobile-First Web Application

A professional, responsive web application built for managing, validating, tracking, and exporting VIP cinema ticket codes.

## Features

- **Dashboard**: Real-time statistics on total codes, validation status, and usage status with recent activity feeds.
- **All Codes Management**: Search, filter by validation/usage/type, edit codes, toggle status independently, and delete codes with confirmation.
- **Batch Import**: Import hundreds or thousands of codes via CSV, Excel (`.xlsx`), or manual paste with automatic duplicate detection and whitespace cleaning.
- **PDF Export Studio**: Generate printable PDF sheets with original code text clearly displayed above high-resolution QR codes and barcodes.
- **Settings & Database**: Configure code types, barcode symbologies, QR error correction, and prepare Supabase cloud sync credentials securely.

## Tech Stack

- React 18, TypeScript, Vite
- Tailwind CSS
- Lucide React Icons
- `qrcode` & `jsbarcode` for scannable code generation
- `jspdf` for PDF generation
- `xlsx` for Excel/CSV parsing

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## GitHub Pages Deployment

The project is configured for static hosting (Vite base set to `./`). You can deploy the `dist/` build folder to GitHub Pages or any static web host.
