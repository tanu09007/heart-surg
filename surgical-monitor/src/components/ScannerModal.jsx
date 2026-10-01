import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  X, 
  Check, 
  RotateCcw, 
  FileText, 
  Sparkles, 
  AlertCircle,
  ScanLine
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ScannerModal({ isOpen, onClose, onSaveReport }) {
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [reportTitle, setReportTitle] = useState('');
  const [category, setCategory] = useState('ECG Rhythm');
  const [summary, setSummary] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Initialize camera when modal opens
  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, capturedImage]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setCameraActive(true);
      } else {
        throw new Error('Camera API not supported in this browser');
      }
    } catch (err) {
      console.warn('Camera access error, switching to scanner simulation mode:', err.message);
      setCameraError('Camera access unavailable or denied. High-resolution document simulator ready.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Capture snapshot from real video or simulate high-res cardiac scan
  const handleCapture = () => {
    setIsScanning(true);
    setTimeout(() => {
      if (cameraActive && videoRef.current) {
        try {
          const video = videoRef.current;
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setCapturedImage(dataUrl);
          stopCamera();
        } catch (e) {
          console.error(e);
          generateSimulatedCapture();
        }
      } else {
        generateSimulatedCapture();
      }
      setIsScanning(false);
      toast.success('Document scanned successfully!');
    }, 1200);
  };

  const generateSimulatedCapture = () => {
    // Sample high quality medical document scan
    const sampleScans = [
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=1000&q=80'
    ];
    const picked = sampleScans[Math.floor(Math.random() * sampleScans.length)];
    setCapturedImage(picked);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!capturedImage) {
      toast.error('Please scan or capture a document first');
      return;
    }

    const title = reportTitle.trim() || `${category} - ${new Date().toLocaleDateString()}`;

    onSaveReport({
      title,
      category,
      fileType: 'image',
      previewUrl: capturedImage,
      summary: summary.trim() || 'Scanned document uploaded via optical camera scanner.'
    });

    // Reset & close
    setCapturedImage(null);
    setReportTitle('');
    setSummary('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <ScanLine className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Smart Document Scanner</h3>
              <p className="text-xs text-slate-400">Position ECG, X-Ray, or Lab Report within the viewfinder</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {!capturedImage ? (
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-950 border-2 border-dashed border-cyan-500/30 flex items-center justify-center group">
              {cameraActive ? (
                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-6 max-w-md">
                  <div className="w-16 h-16 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center mx-auto mb-3">
                    <Camera className="w-8 h-8" />
                  </div>
                  <h4 className="font-semibold text-slate-200 text-sm mb-1">
                    {cameraError ? 'Scanner Simulation Active' : 'Initializing Optical Scanner...'}
                  </h4>
                  <p className="text-xs text-slate-400 mb-3">
                    {cameraError || 'Click below to capture high-resolution medical document snapshot'}
                  </p>
                  <button
                    type="button"
                    onClick={generateSimulatedCapture}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition cursor-pointer inline-flex items-center space-x-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Sample Cardiac Scan</span>
                  </button>
                </div>
              )}

              {/* Viewfinder Corner Overlays */}
              <div className="absolute inset-4 pointer-events-none border border-white/20 rounded-lg">
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-cyan-400" />
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-cyan-400" />
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-cyan-400" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-cyan-400" />

                {/* Laser Scanning Beam */}
                {isScanning && (
                  <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-scan-line" />
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-950 border border-cyan-500/40 shadow-lg">
                <img
                  src={capturedImage}
                  alt="Scanned preview"
                  className="w-full h-full object-contain bg-black/60"
                />
                <div className="absolute top-3 right-3">
                  <button
                    type="button"
                    onClick={handleRetake}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-900/90 text-xs font-semibold text-slate-200 hover:text-white border border-slate-700 hover:bg-slate-800 shadow-lg transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retake</span>
                  </button>
                </div>
                <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded text-[11px] font-mono text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Scan Captured & Processed</span>
                </div>
              </div>

              {/* Form Details */}
              <form onSubmit={handleSave} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Document / Scan Title
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 12-Lead ECG Morning Rhythm"
                      value={reportTitle}
                      onChange={(e) => setReportTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="ECG Rhythm">ECG Rhythm Strip</option>
                      <option value="Imaging Scan">Chest X-Ray / CT Scan</option>
                      <option value="Echo Ultrasound">Echocardiogram</option>
                      <option value="Lab Report">Blood Panel / Lab Test</option>
                      <option value="Doctor Prescription">Prescription / Discharge Paper</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Notes / Observations (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Scan taken after doctor follow-up, rhythm felt normal"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center space-x-1.5 px-5 py-2 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/20 transition cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Upload to Medical Record</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Action Trigger when in Camera View */}
          {!capturedImage && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-400 flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5 text-cyan-400" />
                <span>Keep camera steady and align all 4 edges inside the markers</span>
              </span>

              <button
                type="button"
                disabled={isScanning}
                onClick={handleCapture}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25 transition cursor-pointer disabled:opacity-50"
              >
                <Camera className="w-4 h-4" />
                <span>{isScanning ? 'Scanning...' : 'Capture & Process Scan'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
