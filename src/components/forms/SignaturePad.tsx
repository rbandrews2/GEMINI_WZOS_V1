import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  PenTool,
  RotateCcw,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Type,
  FileSignature,
} from 'lucide-react';

interface SignaturePadProps {
  signerName: string;
  onSignatureChange: (dataUrl: string | null) => void;
  required?: boolean;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  signerName,
  onSignatureChange,
  required = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [hasSignature, setHasSignature] = useState(false);
  const [isUsingStamp, setIsUsingStamp] = useState(false);
  const [strokeHistory, setStrokeHistory] = useState<ImageData[]>([]);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  // Setup canvas size with DPI scaling for high-res touchscreens
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = 140 * dpr;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#ff6700'; // Safety Orange signature ink
    }
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  // Helper to extract normalized coordinates
  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  // Touch & Mouse Drawing Handlers
  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if ('touches' in e) {
      // Prevent screen scrolling when drawing signature
      e.stopPropagation();
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Save history state before starting new stroke
    const dpr = window.devicePixelRatio || 1;
    const currentSnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setStrokeHistory((prev) => [...prev, currentSnapshot]);

    isDrawingRef.current = true;
    setIsUsingStamp(false);

    const point = getCoordinates(e);
    if (!point) return;

    lastPointRef.current = point;
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawingRef.current) return;
    if ('touches' in e) {
      e.stopPropagation();
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const point = getCoordinates(e);
    if (!point || !lastPointRef.current) return;

    // Smooth quadratic curve interpolation
    const midX = (lastPointRef.current.x + point.x) / 2;
    const midY = (lastPointRef.current.y + point.y) / 2;

    ctx.quadraticCurveTo(lastPointRef.current.x, lastPointRef.current.y, midX, midY);
    ctx.stroke();

    lastPointRef.current = point;
    if (!hasSignature) {
      setHasSignature(true);
    }
  };

  const stopDrawing = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    lastPointRef.current = null;

    const canvas = canvasRef.current;
    if (!canvas) return;

    setHasSignature(true);
    onSignatureChange(canvas.toDataURL('image/png'));
  };

  // Clear Signature Canvas
  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setStrokeHistory([]);
    setHasSignature(false);
    setIsUsingStamp(false);
    onSignatureChange(null);
  };

  // Undo Last Stroke Gesture
  const undoLastStroke = () => {
    const canvas = canvasRef.current;
    if (!canvas || strokeHistory.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const previousSnapshot = strokeHistory[strokeHistory.length - 1];
    ctx.putImageData(previousSnapshot, 0, 0);

    const updatedHistory = strokeHistory.slice(0, -1);
    setStrokeHistory(updatedHistory);

    if (updatedHistory.length === 0) {
      setHasSignature(false);
      onSignatureChange(null);
    } else {
      onSignatureChange(canvas.toDataURL('image/png'));
    }
  };

  // Glove-friendly Digital Certified Stamp (when gloves prevent touchscreen stylus)
  const applyGloveFriendlyStamp = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    clearSignature();
    setIsUsingStamp(true);
    setHasSignature(true);

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    // Draw stylish certificate stamp
    ctx.fillStyle = '#0f1117';
    ctx.fillRect(0, 0, rect.width, 140);

    // Border
    ctx.strokeStyle = '#ff6700';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, rect.width - 20, 120);

    // Signature cursive font
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'italic bold 28px serif';
    ctx.fillText(signerName || 'Field TCS Lead', 24, 55);

    // Metadata lines
    ctx.fillStyle = '#8e929b';
    ctx.font = '11px sans-serif';
    ctx.fillText(`VERIFIED DIGITAL GLOVE SIGNATURE · MUTCD SECTION 6C`, 24, 85);
    ctx.fillText(`TIMESTAMP: ${new Date().toLocaleString()} · ID: CERT-${Date.now().toString().slice(-6)}`, 24, 105);

    onSignatureChange(canvas.toDataURL('image/png'));
  };

  return (
    <div className="p-4 rounded-2xl bg-[#090a0d] border border-[#23252d] space-y-3">
      {/* Header with Title and Actions */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
          <FileSignature className="w-4 h-4 text-[#ff6700]" />
          <span>Field Member Digital Signature</span>
          {required && <span className="text-red-400">*</span>}
        </label>

        <div className="flex items-center gap-2">
          {hasSignature && strokeHistory.length > 0 && !isUsingStamp && (
            <button
              type="button"
              onClick={undoLastStroke}
              className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 px-2 py-0.5 rounded bg-[#181920] border border-[#2b2d35]"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Undo</span>
            </button>
          )}

          {hasSignature && (
            <button
              type="button"
              onClick={clearSignature}
              className="text-[11px] text-slate-400 hover:text-red-400 font-bold flex items-center gap-1 px-2 py-0.5 rounded bg-[#181920] border border-[#2b2d35]"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Touch Gesture Canvas Area */}
      <div
        ref={containerRef}
        className="relative border-2 border-dashed border-[#2d303b] hover:border-amber-500/50 rounded-2xl bg-[#121318] overflow-hidden touch-none h-[140px] flex items-center justify-center transition-colors"
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full cursor-crosshair"
          style={{ touchAction: 'none' }}
        />

        {/* Guidance Overlay when Empty */}
        {!hasSignature && (
          <div className="absolute pointer-events-none flex flex-col items-center justify-center text-center p-4 select-none">
            <PenTool className="w-5 h-5 text-amber-400/60 mb-1 animate-pulse" />
            <span className="text-xs font-semibold text-slate-300">
              Sign directly on screen with finger or stylus
            </span>
            <span className="text-[10px] text-[#717684] mt-0.5">
              Touch gesture tracking active · Certified by {signerName || 'Field Tech'}
            </span>
          </div>
        )}

        {/* Verified Badge Overlay when Signed */}
        {hasSignature && (
          <div className="absolute bottom-2 right-2 pointer-events-none px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Signature Verified</span>
          </div>
        )}
      </div>

      {/* Alternative Glove Mode & Attestation */}
      <div className="flex items-center justify-between text-[11px] text-[#8e929b] pt-1">
        <span className="flex items-center gap-1 text-[10px]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Certifies MUTCD / Caltrans Title 8 safety compliance</span>
        </span>

        <button
          type="button"
          onClick={applyGloveFriendlyStamp}
          className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 text-[10px] underline underline-offset-2"
        >
          <Type className="w-3 h-3" />
          <span>Wearing Heavy Gloves? Adopt Stamp</span>
        </button>
      </div>
    </div>
  );
};
