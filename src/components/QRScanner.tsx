import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, CameraOff } from "lucide-react";

interface QRScannerProps {
  onScan: (data: string) => void;
  disabled?: boolean;
}

export function QRScanner({ onScan, disabled }: QRScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<string>("qr-reader-" + Math.random().toString(36).slice(2));

  const startScanner = async () => {
    setError("");
    try {
      const scanner = new Html5Qrcode(containerRef.current);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 200, height: 200 } },
        (decodedText) => {
          onScan(decodedText);
          stopScanner();
        },
        () => {}
      );
      setScanning(true);
    } catch (err: any) {
      setError("Camera access denied or unavailable");
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    try {
      if (scannerRef.current?.isScanning) {
        await scannerRef.current.stop();
      }
    } catch {}
    scannerRef.current = null;
    setScanning(false);
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className="space-y-3">
      <div
        id={containerRef.current}
        className="rounded-xl overflow-hidden bg-muted"
        style={{ minHeight: scanning ? 250 : 0 }}
      />

      {error && (
        <p className="text-xs text-destructive text-center">{error}</p>
      )}

      <button
        onClick={scanning ? stopScanner : startScanner}
        disabled={disabled}
        className="w-full flex items-center justify-center gap-2 rounded-lg border border-border bg-card py-3 text-sm font-medium text-foreground transition-all hover:bg-secondary active:scale-[0.98] disabled:opacity-40"
      >
        {scanning ? (
          <>
            <CameraOff className="h-4 w-4" />
            Stop Scanner
          </>
        ) : (
          <>
            <Camera className="h-4 w-4" />
            Scan QR Code
          </>
        )}
      </button>
    </div>
  );
}
