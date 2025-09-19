import React, { useState, useEffect } from 'react';

export function BarcodeScanner({ onScan }) {
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    // Simulate barcode scanning for demonstration
    // In a real app, you would use a barcode scanning library
    const handleKeyPress = (e) => {
      if (e.key === 'Enter') {
        onScan('123456789'); // Simulated barcode
      }
    };

    if (scanning) {
      window.addEventListener('keypress', handleKeyPress);
      return () => window.removeEventListener('keypress', handleKeyPress);
    }
  }, [scanning, onScan]);

  return (
    <div className="text-center">
      <button 
        onClick={() => setScanning(!scanning)}
        className={`px-4 py-2 rounded ${scanning ? 'bg-red-500' : 'bg-green-500'} text-white`}
      >
        {scanning ? 'Stop Scanning' : 'Start Scanning'}
      </button>
      {scanning && (
        <div className="mt-2">
          <div className="text-sm text-gray-600">Press Enter to simulate scan</div>
          <div className="border-2 border-dashed border-green-500 h-20 mt-2 flex items-center justify-center">
            <div>Scanner Active</div>
          </div>
        </div>
      )}
    </div>
  );
}