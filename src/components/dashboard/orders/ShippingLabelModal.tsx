'use client';

import Image from 'next/image';
import { Printer, X } from 'lucide-react';
import type { Order } from '@/types/order';

interface ShippingLabelModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

// Integrated vector icons (black rounded container + white symbol)
// This guarantees that even if the browser has "Background graphics" unchecked in print,
// the black rounded box and white symbol ALWAYS render 100% visibly.
function IconBox() {
  return (
    <svg className="size-9 sm:size-10 shrink-0" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="9" fill="black" />
      <g transform="translate(8, 8)">
        <path
          d="M12 3L3.5 7.5V16.5L12 21L20.5 16.5V7.5L12 3Z"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path d="M12 12L20.5 7.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 12V21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 12L3.5 7.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

function IconBuilding() {
  return (
    <svg className="size-9 sm:size-10 shrink-0" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="9" fill="black" />
      <g transform="translate(8, 8)">
        <rect x="3" y="3" width="18" height="18" rx="2" fill="white" />
        <rect x="6" y="6" width="3.5" height="3" rx="0.5" fill="black" />
        <rect x="14.5" y="6" width="3.5" height="3" rx="0.5" fill="black" />
        <rect x="6" y="11" width="3.5" height="3" rx="0.5" fill="black" />
        <rect x="14.5" y="11" width="3.5" height="3" rx="0.5" fill="black" />
        <path d="M9.5 21V17C9.5 15.6193 10.6193 14.5 12 14.5C13.3807 14.5 14.5 15.6193 14.5 17V21H9.5Z" fill="black" />
      </g>
    </svg>
  );
}

function IconPhone() {
  return (
    <svg className="size-9 sm:size-10 shrink-0" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="9" fill="black" />
      <g transform="translate(8, 8)">
        <path
          d="M6.62 10.79C8.06 13.62 10.38 15.94 13.21 17.38L15.41 15.18C15.69 14.9 16.08 14.82 16.43 14.94C17.55 15.31 18.76 15.51 20 15.51C20.55 15.51 21 15.96 21 16.51V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.7 6.45 9.07 7.57C9.18 7.92 9.1 8.31 8.82 8.59L6.62 10.79Z"
          fill="white"
        />
      </g>
    </svg>
  );
}

function IconMail() {
  return (
    <svg className="size-9 sm:size-10 shrink-0" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="9" fill="black" />
      <g transform="translate(8, 8)">
        <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="white" />
      </g>
    </svg>
  );
}

function IconMapPin() {
  return (
    <svg className="size-9 sm:size-10 shrink-0" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="9" fill="black" />
      <g transform="translate(8, 8)">
        <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="white" />
      </g>
    </svg>
  );
}

function IconUser() {
  return (
    <svg className="size-9 sm:size-10 shrink-0" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="9" fill="black" />
      <g transform="translate(8, 8)">
        <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="white" />
      </g>
    </svg>
  );
}

function IconHome() {
  return (
    <svg className="size-9 sm:size-10 shrink-0" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="9" fill="black" />
      <g transform="translate(8, 8)">
        <path d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z" fill="white" />
      </g>
    </svg>
  );
}

export default function ShippingLabelModal({ order, isOpen, onClose }: ShippingLabelModalProps) {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const addressParts = (order.shippingAddress || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const addressLine1 = addressParts[0] || order.shippingAddress || '';
  const addressLine2 = addressParts.slice(1, 3).join(', ') || '';
  const addressLine3 = addressParts.slice(3).join(', ') || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 backdrop-blur-xs print:static print:bg-white print:p-0" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-3xl rounded-3xl bg-white p-4 sm:p-6 shadow-2xl print:max-w-none print:rounded-none print:p-0 print:shadow-none">
        {/* Modal Controls (Hidden in Print) */}
        <div className="mb-4 flex items-center justify-between border-b border-[#E2E8F0] pb-3 print:hidden">
          <div>
            <h3 className="text-lg font-bold text-[#0F172A]">Shipping Label Preview</h3>
            <p className="text-xs text-[#64748B]">Ready to print and paste on package</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#1D4ED8]"
            >
              <Printer size={16} />
              Print Label
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex size-9 items-center justify-center rounded-xl border border-[#E2E8F0] text-[#64748B] hover:bg-slate-100"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Label Box */}
        <div
          id="printable-shipping-label"
          className="mx-auto w-full overflow-hidden rounded-2xl border-[3px] border-black bg-white font-sans text-black"
          style={{
            maxWidth: '780px',
            WebkitPrintColorAdjust: 'exact',
            printColorAdjust: 'exact',
          }}
        >
          {/* Header */}
          <div className="relative flex items-center justify-between border-b-[3px] border-black p-4 sm:p-5 min-h-[92px]">
            {/* Logo (Left) */}
            <div className="flex items-center z-10">
              <div className="relative h-13 w-40 sm:h-15 sm:w-48">
                <Image
                  src="/magnify-logo.png"
                  alt="Magnify Creations"
                  fill
                  priority
                  className="object-contain object-left"
                />
              </div>
            </div>

            {/* True Geometric Center: Title & Website */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none w-max z-0">
              <h1 className="text-2xl sm:text-3xl font-black tracking-wider uppercase text-black whitespace-nowrap">
                SHIPPING LABEL
              </h1>
              <p className="text-xs sm:text-sm font-semibold tracking-wide text-black mt-0.5 whitespace-nowrap">
                www.magnifycreation.lk
              </p>
            </div>

            {/* ORDER NO Box (Right) */}
            <div className="z-10 rounded-xl border-[2.5px] border-black px-4 py-2 sm:px-5 sm:py-2.5 min-w-[130px] sm:min-w-[150px] text-left">
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider block text-black">
                ORDER NO.
              </span>
              <span className="font-mono text-sm sm:text-base font-black text-black">
                {order.orderId}
              </span>
            </div>
          </div>

          {/* 2-Column Body */}
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y-[3px] sm:divide-y-0 sm:divide-x-[3px] divide-black">
            {/* LEFT COLUMN: FROM (SENDER) */}
            <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
              {/* Header Pill */}
              <div className="flex items-center gap-2">
                <IconBox />
                <div
                  className="rounded-lg px-4 py-1.5 sm:px-5 sm:py-2 text-xs sm:text-sm font-black uppercase tracking-wider"
                  style={{
                    backgroundColor: '#000000',
                    color: '#ffffff',
                    WebkitPrintColorAdjust: 'exact',
                    printColorAdjust: 'exact',
                  }}
                >
                  FROM (SENDER)
                </div>
              </div>

              {/* Company Info */}
              <div className="flex items-start gap-3">
                <IconBuilding />
                <div>
                  <h4 className="text-base sm:text-lg font-black text-black leading-tight">
                    Magnify (Pvt) Ltd
                  </h4>
                  <p className="mt-1 text-xs sm:text-sm font-semibold text-black leading-relaxed">
                    125A, KKS Road<br />
                    Kokuvil Junction<br />
                    Jaffna, Sri Lanka
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-3">
                <IconPhone />
                <span className="text-sm sm:text-base font-black text-black tracking-wide">
                  +94 75 391 2534
                </span>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3">
                <IconMail />
                <span className="text-xs sm:text-sm font-black text-black break-all">
                  magnifyofficials@gmail.com
                </span>
              </div>
            </div>

            {/* RIGHT COLUMN: TO (DELIVERY ADDRESS) */}
            <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
              {/* Header Pill */}
              <div className="flex items-center gap-2">
                <IconMapPin />
                <div
                  className="rounded-lg px-4 py-1.5 sm:px-5 sm:py-2 text-xs sm:text-sm font-black uppercase tracking-wider"
                  style={{
                    backgroundColor: '#000000',
                    color: '#ffffff',
                    WebkitPrintColorAdjust: 'exact',
                    printColorAdjust: 'exact',
                  }}
                >
                  TO (DELIVERY ADDRESS)
                </div>
              </div>

              {/* Customer Name */}
              <div className="flex items-center gap-3">
                <IconUser />
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-black text-black truncate pb-0.5">
                    {order.customerName}
                  </p>
                  <div className="border-b-[2px] border-dotted border-black w-full" />
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-3">
                <IconPhone />
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-black text-black pb-0.5">
                    {order.phone || '+94 7X XXX XXXX'}
                  </p>
                  <div className="border-b-[2px] border-dotted border-black w-full" />
                </div>
              </div>

              {/* Address (Multi-line dotted rows) */}
              <div className="flex items-start gap-3">
                <IconHome />
                <div className="flex-1 min-w-0 space-y-2">
                  <div>
                    <p className="text-xs sm:text-sm font-black text-black pb-0.5">
                      {addressLine1}
                    </p>
                    <div className="border-b-[2px] border-dotted border-black w-full" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-black text-black pb-0.5">
                      {addressLine2 || <span className="opacity-0">Line 2</span>}
                    </p>
                    <div className="border-b-[2px] border-dotted border-black w-full" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-black text-black pb-0.5">
                      {addressLine3 || <span className="opacity-0">Line 3</span>}
                    </p>
                    <div className="border-b-[2px] border-dotted border-black w-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-[#94A3B8] print:hidden">
          Tip: Click Print Label to print on a thermal sticker printer or standard A4 paper.
        </p>
      </div>

      {/* Global Print Stylesheet ensuring exact reproduction in browser print */}
      <style jsx global>{`
        @media print {
          /* Hide everything except shipping label */
          body * {
            visibility: hidden !important;
          }
          #printable-shipping-label,
          #printable-shipping-label * {
            visibility: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #printable-shipping-label {
            position: fixed !important;
            left: 50% !important;
            top: 20px !important;
            transform: translateX(-50%) !important;
            width: 100% !important;
            max-width: 760px !important;
            box-shadow: none !important;
            border: 3px solid #000000 !important;
            background: #ffffff !important;
          }
          @page {
            size: auto;
            margin: 8mm;
          }
        }
      `}</style>
    </div>
  );
}
