import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import { CodeType } from '../types';

interface CodeGeneratorProps {
  value: string;
  type: CodeType;
  symbology?: string;
  showOriginalText?: boolean;
  className?: string;
  width?: number;
  height?: number;
}

export const CodeGenerator: React.FC<CodeGeneratorProps> = ({
  value,
  type,
  symbology = 'CODE128',
  showOriginalText = true,
  className = '',
  width = 180,
  height = 90,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !value) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (type === 'qr') {
      QRCode.toCanvas(canvas, value, {
        width: width,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      }, (error) => {
        if (error) console.error('QR Code generation error:', error);
      });
    } else {
      try {
        // Clear canvas before barcode rendering
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        JsBarcode(canvas, value, {
          format: symbology,
          width: 2,
          height: height,
          displayValue: false, // We display original text above or below manually for exact styling
          background: '#ffffff',
          lineColor: '#0f172a',
          margin: 10,
        });
      } catch (err) {
        console.error('Barcode generation error for value:', value, err);
        // Fallback or render error text on canvas
        ctx.fillStyle = '#ef4444';
        ctx.font = '12px sans-serif';
        ctx.fillText('Invalid barcode format', 10, 30);
      }
    }
  }, [value, type, symbology, width, height]);

  return (
    <div className={`flex flex-col items-center bg-white p-3 rounded-xl shadow-sm border border-slate-200 ${className}`}>
      {showOriginalText && (
        <div className="mb-2 text-center w-full">
          <span className="font-mono font-bold tracking-wider text-slate-900 text-sm md:text-base bg-slate-100 px-3 py-1 rounded-md border border-slate-200 block truncate select-all" title={value}>
            {value}
          </span>
        </div>
      )}
      <div className="flex items-center justify-center p-1 bg-white">
        <canvas ref={canvasRef} className="max-w-full h-auto object-contain" />
      </div>
      <div className="mt-1 text-[11px] uppercase font-semibold text-slate-600 tracking-wider">
        {type === 'qr' ? 'QR Code' : `Barcode (${symbology})`}
      </div>
    </div>
  );
};
