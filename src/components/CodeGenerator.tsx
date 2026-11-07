import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface CodeGeneratorProps {
  value: string;
  size?: number;
}

export const CodeGenerator: React.FC<CodeGeneratorProps> = ({ value, size = 220 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !value) return;

    QRCode.toCanvas(
      canvasRef.current,
      value,
      {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      },
      (error) => {
        if (error) console.error('QR generation error:', error);
      }
    );
  }, [value, size]);

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white border border-gray-300 rounded shadow-sm">
      <div className="mb-3 text-center">
        <span className="font-mono font-bold text-lg text-gray-900 tracking-wider select-all">
          {value}
        </span>
      </div>
      <canvas ref={canvasRef} className="max-w-full h-auto" />
    </div>
  );
};
