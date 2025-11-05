import React, { forwardRef } from 'react';
import { formatCurrency } from '../lib/utils';

interface ReceiptItem {
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface ReceiptData {
  invoice_number: string;
  date: string;
  time: string;
  cashier_name: string;
  items: ReceiptItem[];
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  payment_amount: number;
  change_amount: number;
  payment_method: string;
  store_name?: string;
  store_address?: string;
  store_phone?: string;
}

interface ReceiptProps {
  data: ReceiptData;
}

export const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(({ data }, ref) => {
  return (
    <div 
      ref={ref} 
      className="receipt-container bg-white p-6 font-mono text-sm max-w-xs mx-auto"
      style={{ 
        fontFamily: 'monospace',
        lineHeight: '1.2',
        fontSize: '12px',
        width: '220mm', // Thermal printer width
        maxWidth: '80mm',
        color: '#000',
        backgroundColor: '#fff'
      }}
    >
      {/* Header */}
      <div className="text-center mb-4 border-b-2 border-dashed pb-2">
        <div className="font-bold text-lg mb-1">{data.store_name || 'TOKO SAHABAT MINIMARKET'}</div>
        <div className="text-xs">{data.store_address || 'JL. MERDEKA NO. 123, BANDUNG'}</div>
        <div className="text-xs">{data.store_phone || 'Telp: 021-12345678'}</div>
      </div>

      {/* Transaction Info */}
      <div className="mb-4">
        <div className="text-center font-bold mb-2">STRUK PENJUALAN</div>
        <div className="flex justify-between">
          <span>No:</span>
          <span>{data.invoice_number}</span>
        </div>
        <div className="flex justify-between">
          <span>Tanggal:</span>
          <span>{data.date} {data.time}</span>
        </div>
        <div className="flex justify-between">
          <span>Kasir:</span>
          <span>{data.cashier_name}</span>
        </div>
      </div>

      {/* Items */}
      <div className="border-b-2 border-dashed pb-2 mb-2">
        <div className="flex justify-between font-bold text-xs mb-1">
          <span>ITEM</span>
          <span>QTY</span>
          <span>HARGA</span>
          <span>SUBTOTAL</span>
        </div>
        {data.items.map((item, index) => (
          <div key={index} className="mb-1">
            <div className="flex justify-between text-xs">
              <span className="flex-1 truncate pr-1">{item.product_name}</span>
              <span className="w-8 text-center">{item.quantity}</span>
              <span className="w-16 text-right">{formatCurrency(item.price)}</span>
              <span className="w-20 text-right">{formatCurrency(item.subtotal)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="mb-4">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{formatCurrency(data.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Pajak (11%):</span>
          <span>{formatCurrency(data.tax_amount)}</span>
        </div>
        <div className="flex justify-between font-bold text-base border-t pt-1">
          <span>TOTAL:</span>
          <span>{formatCurrency(data.total_amount)}</span>
        </div>
        <div className="flex justify-between mt-2">
          <span>BAYAR:</span>
          <span>{formatCurrency(data.payment_amount)}</span>
        </div>
        <div className="flex justify-between">
          <span>KEMBALI:</span>
          <span>{formatCurrency(data.change_amount)}</span>
        </div>
        <div className="flex justify-between mt-1">
          <span>Metode:</span>
          <span>{data.payment_method}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center border-t-2 border-dashed pt-2">
        <div className="font-bold">TERIMA KASIH</div>
        <div className="text-xs">Silakan datang kembali!</div>
      </div>
    </div>
  );
});

Receipt.displayName = 'Receipt';