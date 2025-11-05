import React, { useRef, useState } from 'react';
import { Receipt } from '../components/Receipt';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'react-hot-toast';
import { Download, Printer, FileImage, FileText, CheckCircle, ArrowLeft } from 'lucide-react';
import { formatDate, formatTime } from '../lib/utils';

interface TransactionItem {
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface TransactionSuccessProps {
  transactionData: {
    invoice_number: string;
    items: TransactionItem[];
    subtotal: number;
    tax_amount: number;
    total_amount: number;
    payment_amount: number;
    change_amount: number;
    payment_method: string;
    cashier_name: string;
  };
  onBackToPOS: () => void;
}

export const TransactionSuccess: React.FC<TransactionSuccessProps> = ({
  transactionData,
  onBackToPOS,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const currentDate = new Date();
  const receiptData = {
    ...transactionData,
    date: formatDate(currentDate),
    time: formatTime(currentDate),
  };

  const generatePNG = async () => {
    if (!receiptRef.current) return;
    
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        width: receiptRef.current.scrollWidth,
        height: receiptRef.current.scrollHeight,
      });
      
      const link = document.createElement('a');
      link.download = `struk-${transactionData.invoice_number}.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      toast.success('Struk PNG berhasil diunduh');
    } catch (error) {
      console.error('Error generating PNG:', error);
      toast.error('Gagal membuat struk PNG');
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePDF = async () => {
    if (!receiptRef.current) return;
    
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, 120], // Thermal printer size
      });
      
      const imgWidth = 70;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 5, 5, imgWidth, imgHeight);
      pdf.save(`struk-${transactionData.invoice_number}.pdf`);
      
      toast.success('Struk PDF berhasil diunduh');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Gagal membuat struk PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const printReceipt = () => {
    if (!receiptRef.current) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Popup diblokir. Izinkan popup untuk print.');
      return;
    }
    
    const receiptHTML = receiptRef.current.outerHTML;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Struk</title>
          <style>
            body { margin: 0; padding: 0; font-family: monospace; }
            .receipt-container { 
              width: 80mm; 
              margin: 0; 
              padding: 5mm;
              font-size: 12px;
              line-height: 1.2;
            }
            @media print {
              body { margin: 0; }
              .receipt-container { 
                width: 80mm; 
                margin: 0; 
                padding: 0;
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          ${receiptHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
    
    toast.success('Struk dikirim ke printer');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full">
        {/* Success Header */}
        <div className="text-center mb-6">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Transaksi Berhasil!
          </h1>
          <p className="text-gray-600">
            Pembayaran telah diterima. Silakan cetak struk untuk pelanggan.
          </p>
        </div>

        {/* Transaction Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">No. Transaksi:</span>
              <div className="font-semibold">{transactionData.invoice_number}</div>
            </div>
            <div>
              <span className="text-gray-500">Total:</span>
              <div className="font-semibold text-lg text-green-600">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                }).format(transactionData.total_amount)}
              </div>
            </div>
            <div>
              <span className="text-gray-500">Metode:</span>
              <div className="font-semibold">{transactionData.payment_method}</div>
            </div>
            <div>
              <span className="text-gray-500">Kembalian:</span>
              <div className="font-semibold">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                }).format(transactionData.change_amount)}
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Print Options */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Opsi Cetak Struk</h3>
            <div className="space-y-3">
              <button
                onClick={generatePNG}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-3 rounded-lg transition-colors"
              >
                <FileImage className="h-5 w-5" />
                {isGenerating ? 'Membuat...' : 'Unduh Struk PNG'}
              </button>
              
              <button
                onClick={generatePDF}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-3 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-4 py-3 rounded-lg transition-colors"
              >
                <FileText className="h-5 w-5" />
                {isGenerating ? 'Membuat...' : 'Unduh Struk PDF'}
              </button>
              
              <button
                onClick={printReceipt}
                className="w-full flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg transition-colors"
              >
                <Printer className="h-5 w-5" />
                Cetak Langsung
              </button>
              
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="w-full flex items-center justify-center gap-3 bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition-colors"
              >
                <Download className="h-5 w-5" />
                {showPreview ? 'Sembunyikan' : 'Preview'} Struk
              </button>
            </div>

            <div className="mt-6">
              <button
                onClick={onBackToPOS}
                className="w-full flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                Kembali ke Kasir
              </button>
            </div>
          </div>

          {/* Receipt Preview */}
          <div className={`${showPreview ? 'block' : 'hidden md:block'}`}>
            <h3 className="text-lg font-semibold mb-4">Preview Struk</h3>
            <div className="border rounded-lg p-4 bg-gray-50 overflow-auto max-h-96">
              <Receipt ref={receiptRef} data={receiptData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};