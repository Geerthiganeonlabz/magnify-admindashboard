"use client";

import { Trash2, X } from "lucide-react";
import type { Order } from "@/types/order";

interface DeleteOrderModalProps {
  isOpen: boolean;
  order: Order | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteOrderModal({
  isOpen,
  order,
  onCancel,
  onConfirm,
}: DeleteOrderModalProps) {
  if (!isOpen || !order) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center px-4 py-6 sm:px-6"
      style={{
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(2px)",
      }}
      onClick={onCancel}
    >
      <div
        className="relative flex w-full max-w-[480px] flex-col overflow-hidden rounded-2xl bg-white px-5 py-6 shadow-[0px_20px_40px_rgba(0,0,0,0.18)] sm:px-8 sm:py-8 md:px-10 md:py-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-[#64748B] transition hover:bg-slate-100 hover:text-[#1A1C1F] sm:right-5 sm:top-5"
        >
          <X size={20} strokeWidth={1.8} />
        </button>

        {/* Delete Icon */}
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FEF2F2]">
            <Trash2 size={28} strokeWidth={2} className="text-[#BC0000]" />
          </div>
        </div>

        {/* Heading */}
        <h2
          className="mt-5 text-center text-[22px] font-bold leading-8 text-[#002B73] sm:text-[24px]"
          style={{
            fontFamily: "var(--font-manrope, Manrope, sans-serif)",
          }}
        >
          Delete Order
        </h2>

        {/* Description */}
        <p className="mt-2 text-center text-sm leading-6 text-[#434652] sm:text-base">
          Are you sure you want to delete order{" "}
          <span className="font-semibold text-[#002B73]">{order.orderId}</span>?
          This action cannot be undone.
        </p>

        {/* Order Information */}
        <div className="mt-5 flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 sm:mt-6 sm:gap-4 sm:p-4">
          {/* Customer Initial */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#DAE2FF] text-sm font-bold text-[#002B73]">
            {order.customerInitials}
          </div>

          {/* Customer Details */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[#1A1C1F] sm:text-base">
              {order.customerName}
            </p>

            <p className="mt-0.5 break-words text-xs leading-5 text-[#64748B] sm:text-sm">
              {order.orderId}
              <span className="mx-1.5">·</span>
              Qty: {order.qty}
              <span className="mx-1.5">·</span>
              {order.customerId}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row">
          <button
            type="button"
            onClick={onCancel}
            className="flex h-12 w-full items-center justify-center rounded-xl border-[1.5px] border-[#C3C6D4] text-sm font-semibold text-[#434652] transition hover:bg-slate-50 sm:flex-1 sm:text-base"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="flex h-12 w-full items-center justify-center rounded-xl bg-[#BC0000] text-sm font-semibold text-white shadow-[0px_4px_8px_rgba(188,0,0,0.24)] transition hover:bg-[#9f0000] sm:flex-1 sm:text-base"
          >
            Delete Order
          </button>
        </div>
      </div>
    </div>
  );
}