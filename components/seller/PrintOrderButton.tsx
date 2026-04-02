"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useI18n } from "@/components/useI18n";

interface PrintOrderButtonProps {
  orderId: string;
  /** Shown in print dialog title (e.g. MASA-2026-000001). */
  orderLabel?: string;
}

export function PrintOrderButton({ orderId, orderLabel }: PrintOrderButtonProps) {
  const { t } = useI18n();
  function handlePrint() {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const printContent = document.getElementById(`order-print-${orderId}`);
    if (!printContent) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Order ${orderLabel ?? orderId.slice(0, 8)}</title>
          <style>
            @page { margin: 20mm; }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              color: #1a1a1a; 
              line-height: 1.5;
              padding: 20px;
            }
            .print-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #6b2c3f;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .print-logo { 
              font-size: 28px; 
              font-weight: 700; 
              color: #6b2c3f;
              letter-spacing: 2px;
            }
            .print-store-info {
              text-align: right;
              font-size: 12px;
              color: #666;
            }
            .print-store-name {
              font-size: 16px;
              font-weight: 600;
              color: #1a1a1a;
              margin-bottom: 4px;
            }
            .print-title {
              font-size: 24px;
              font-weight: 600;
              color: #6b2c3f;
              margin-bottom: 8px;
            }
            .print-meta {
              font-size: 13px;
              color: #666;
              margin-bottom: 30px;
            }
            .print-section {
              margin-bottom: 30px;
            }
            .print-section-title {
              font-size: 14px;
              font-weight: 600;
              color: #6b2c3f;
              text-transform: uppercase;
              letter-spacing: 1px;
              border-bottom: 1px solid #e5e5e5;
              padding-bottom: 8px;
              margin-bottom: 15px;
            }
            .print-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 30px;
            }
            .print-info-row {
              display: flex;
              justify-content: space-between;
              padding: 6px 0;
              font-size: 13px;
            }
            .print-info-label {
              color: #666;
            }
            .print-info-value {
              font-weight: 500;
              text-align: right;
            }
            .print-table {
              width: 100%;
              border-collapse: collapse;
              font-size: 13px;
            }
            .print-table th {
              background: #f9f7f5;
              padding: 12px 10px;
              text-align: left;
              font-weight: 600;
              color: #6b2c3f;
              border-bottom: 2px solid #6b2c3f;
            }
            .print-table th:last-child,
            .print-table td:last-child {
              text-align: right;
            }
            .print-table td {
              padding: 12px 10px;
              border-bottom: 1px solid #e5e5e5;
            }
            .print-product-cell {
              display: flex;
              align-items: center;
              gap: 12px;
            }
            .print-product-img {
              width: 50px;
              height: 50px;
              object-fit: cover;
              border-radius: 4px;
              background: #f5f5f5;
            }
            .print-product-name {
              font-weight: 500;
            }
            .print-product-category {
              font-size: 11px;
              color: #888;
            }
            .print-summary {
              margin-top: 20px;
              margin-left: auto;
              width: 280px;
            }
            .print-summary-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              font-size: 13px;
            }
            .print-summary-row.total {
              border-top: 2px solid #6b2c3f;
              margin-top: 8px;
              padding-top: 12px;
              font-size: 16px;
              font-weight: 600;
              color: #6b2c3f;
            }
            .print-footer {
              margin-top: 50px;
              padding-top: 20px;
              border-top: 1px solid #e5e5e5;
              text-align: center;
              font-size: 11px;
              color: #888;
            }
            .print-status-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 500;
              text-transform: capitalize;
              background: #f0e6e9;
              color: #6b2c3f;
            }
            @media print {
              body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handlePrint}
      className="gap-2 border-primary/20 text-primary hover:bg-primary/5"
    >
      <Printer className="w-4 h-4" />
      {t("common.printOrder", "Print Order PDF")}
    </Button>
  );
}
