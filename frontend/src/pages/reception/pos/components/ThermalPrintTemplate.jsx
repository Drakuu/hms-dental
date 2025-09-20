import { useEffect } from "react";

const ThermalPrintTemplate = ({ bill }) => {
  useEffect(() => {
    // Inject custom thermal printer CSS (runs only once)
    const style = document.createElement("style");
    style.innerHTML = `
      @media print {
        @page {
          size: 80mm auto;   /* Thermal roll width */
          margin: 0;         /* No page margins */
        }
        body { 
          width: 80mm; 
          margin: 0; 
          padding: 2mm; 
          font-family: monospace; 
          font-size: 12px;
        }
        .no-print { display: none !important; }
        .print-section { 
          width: 100%; 
          page-break-inside: avoid; 
        }
        * { 
          max-width: 100%; 
          box-sizing: border-box;
        }
        h1, h2, h3, h4 { 
          margin: 2mm 0; 
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .border-bottom { border-bottom: 1px dashed #000; }
        .mt-2 { margin-top: 2mm; }
        .mb-2 { margin-bottom: 2mm; }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Manual print handler
  const handlePrint = () => {
    const printContent = document.getElementById("print-section");
    const originalContents = document.body.innerHTML;
    
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContents;
    
    // Reload to restore React functionality
    window.location.reload();
  };

  return (
    <div>
      {/* Print Content - Hidden by default, only shown when printing */}
      <div
        id="print-section"
        className="print-section"
        style={{ 
          width: "80mm", 
          fontFamily: "monospace", 
          fontSize: "12px",
          display: "none" // Hide from normal view
        }}
      >
        <h2 className="text-center">Al-Shahbaz Glasses</h2>
        <p className="text-center">
          THANA ROAD kAHUTA
        </p>
        <p className="text-center">Phone: (051) 3312120</p>

        <div className="border-bottom mt-2 mb-2"></div>

        <div className="flex justify-between">
          <span>Bill #: {bill._id.slice(-6).toUpperCase()}</span>
          <span>{new Date(bill.createdAt).toLocaleString()}</span>
        </div>

        <div className="flex justify-between mt-2">
          <span>Customer: {bill.customerName || "Walk-in"}</span>
          <span>Status: {bill.status.toUpperCase()}</span>
        </div>

        <div className="border-bottom mt-2 mb-2"></div>

        <div className="flex justify-between font-bold">
          <span>ITEM</span>
          <span>TOTAL</span>
        </div>

        <div className="border-bottom mb-2"></div>

        {bill.products.map((item, index) => (
          <div key={index} className="mb-1">
            <div className="flex justify-between">
              <span>{item.name}</span>
              <span>PKR {item.total.toFixed(2)}</span>
            </div>
            <div className="text-sm">
              {item.quantity} x PKR {item.price.toFixed(2)}
              {item.discount > 0 &&
                ` - Discount: PKR ${item.discount.toFixed(2)}`}
            </div>
            {item.size && <div className="text-sm">Size: {item.size}</div>}
            {item.color && <div className="text-sm">Color: {item.color}</div>}
          </div>
        ))}

        <div className="border-bottom mt-2 mb-2"></div>

        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>
            PKR{" "}
            {bill.products
              .reduce((sum, item) => sum + item.price * item.quantity, 0)
              .toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Discount:</span>
          <span>
            PKR{" "}
            {bill.products
              .reduce((sum, item) => sum + item.discount, 0)
              .toFixed(2)}
          </span>
        </div>

        <div className="border-bottom mb-2"></div>

        <div className="flex justify-between font-bold">
          <span>TOTAL:</span>
          <span>PKR {bill.totalAmount.toFixed(2)}</span>
        </div>

        <div className="border-bottom mt-2 mb-2"></div>

        <div className="flex justify-between">
          <span>Payment Method:</span>
          <span>{bill.paymentMethod?.toUpperCase() || "CASH"}</span>
        </div>

        <div className="text-center mt-4">
          <p>Thank you for your purchase!</p>
          <p>** Terms and Conditions **</p>
          <p>Used Glasses will not be refundable.</p>
          <p>استعمال شدہ چشمہ ناقابلِ واپسی ہوں گے۔</p>
          <p>Changes allowed within three days</p>
          <p>تین دن کے اندر تبدیلی کی اجازت ہے۔</p>
        </div>
      </div>

      {/* Preview Content (Optional - if you want to show a preview) */}
      <div className="no-print" style={{ width: "80mm", fontFamily: "monospace", fontSize: "12px" }}>
        <h2 className="text-center">AL-SHAHBAZ Glasses</h2>
        <p className="text-center">Bill Preview - Click Print to generate thermal print</p>
        <div className="border-bottom mt-2 mb-2"></div>
        
        <div className="flex justify-between">
          <span>Bill #: {bill._id.slice(-6).toUpperCase()}</span>
          <span>Total: PKR {bill.totalAmount.toFixed(2)}</span>
        </div>
        
        <div className="border-bottom mt-2 mb-2"></div>
      </div>

      {/* Print Button */}
      <div className=" outline-red-500 no-print mt-4 text-end">
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-primary-700 text-white rounded"
        >
          Print Bill
        </button>
      </div>
    </div>
  );
};

export default ThermalPrintTemplate;