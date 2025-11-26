"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: string) => void;
}

const QRScanner = ({ onScanSuccess, onScanError }: QRScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(true);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>("");
  const [scanStatus, setScanStatus] = useState<string>("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get available cameras
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setCameras(devices);
          // Prefer back camera on mobile
          const backCamera = devices.find(
            (d) => d.label.toLowerCase().includes("back") || 
                   d.label.toLowerCase().includes("rear") ||
                   d.label.toLowerCase().includes("environment")
          );
          setSelectedCamera(backCamera?.id || devices[0].id);
          setHasCamera(true);
        } else {
          setHasCamera(false);
        }
      })
      .catch((err) => {
        console.error("Error getting cameras:", err);
        setHasCamera(false);
      });

    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    if (!selectedCamera) return;

    try {
      // Clean up existing scanner if any
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
          scannerRef.current.clear();
        } catch {
          // Ignore cleanup errors
        }
      }

      const scanner = new Html5Qrcode("qr-reader", {
        verbose: false,
      });
      scannerRef.current = scanner;

      setScanStatus("Đang khởi động camera...");

      await scanner.start(
        selectedCamera,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        (decodedText) => {
          setScanStatus("Quét thành công!");
          onScanSuccess(decodedText);
        },
        () => {
          // Ignore QR not found errors - this is normal during scanning
          setScanStatus("Đang quét... Hãy đưa mã QR vào khung hình");
        }
      );

      setIsScanning(true);
      setScanStatus("Đang quét... Hãy đưa mã QR vào khung hình");
    } catch (err) {
      console.error("Error starting scanner:", err);
      const errorMsg = err instanceof Error ? err.message : "Không thể khởi động camera";
      setScanStatus("");
      onScanError?.(errorMsg);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
    setScanStatus("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanStatus("Đang phân tích ảnh...");

    try {
      // Create a temporary scanner for file scanning
      const tempScanner = new Html5Qrcode("qr-reader-file", { verbose: false });
      
      const result = await tempScanner.scanFile(file, /* showImage */ true);
      setScanStatus("Quét thành công!");
      onScanSuccess(result);
      tempScanner.clear();
    } catch (err) {
      console.error("Error scanning file:", err);
      setScanStatus("");
      
      // Provide more helpful error message
      let errorMsg = "Không thể đọc mã QR từ ảnh.";
      if (err instanceof Error) {
        if (err.message.includes("No MultiFormat") || err.message.includes("NotFoundException")) {
          errorMsg = "Không tìm thấy mã QR trong ảnh. Vui lòng đảm bảo ảnh chứa mã QR rõ ràng.";
        } else if (err.message.includes("format")) {
          errorMsg = "Định dạng ảnh không được hỗ trợ. Vui lòng sử dụng ảnh JPG, PNG hoặc GIF.";
        }
      }
      onScanError?.(errorMsg);
    }

    // Reset input
    e.target.value = "";
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Camera Selection */}
      {hasCamera && cameras.length > 1 && (
        <div className="flex flex-col gap-2">
          <label className="text-sm text-zinc-400">Chọn camera:</label>
          <select
            value={selectedCamera}
            onChange={(e) => {
              setSelectedCamera(e.target.value);
              if (isScanning) {
                stopScanner().then(() => startScanner());
              }
            }}
            disabled={isScanning}
            className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#f84565]"
          >
            {cameras.map((camera) => (
              <option key={camera.id} value={camera.id}>
                {camera.label || `Camera ${camera.id}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Scanner Container */}
      <div
        ref={containerRef}
        className="relative w-full aspect-square max-w-[350px] mx-auto bg-zinc-800 rounded-xl overflow-hidden border-2 border-dashed border-zinc-600"
      >
        <div id="qr-reader" className="w-full h-full" />
        <div id="qr-reader-file" className="hidden" />
        
        {!isScanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-zinc-800/90">
            <div className="w-16 h-16 border-4 border-[#f84565] rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-[#f84565]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M4 12h2m10 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <p className="text-zinc-400 text-sm text-center px-4">
              Nhấn nút bên dưới để bắt đầu quét
            </p>
          </div>
        )}
      </div>

      {/* Scan Status */}
      {scanStatus && (
        <div className="text-center">
          <p className={`text-sm ${scanStatus.includes("thành công") ? "text-green-400" : "text-zinc-400"}`}>
            {scanStatus}
          </p>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {hasCamera && (
          <button
            onClick={isScanning ? stopScanner : startScanner}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
              isScanning
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-[#f84565] hover:bg-[#ff5a77] text-white"
            }`}
          >
            {isScanning ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
                Dừng quét
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Bắt đầu quét
              </>
            )}
          </button>
        )}

        <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium bg-zinc-700 hover:bg-zinc-600 text-white cursor-pointer transition-all">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Tải ảnh QR
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {!hasCamera && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
          <p className="text-yellow-400 text-sm text-center">
            Không tìm thấy camera. Vui lòng sử dụng chức năng tải ảnh QR.
          </p>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
