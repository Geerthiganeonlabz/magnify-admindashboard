'use client';

import { useState } from 'react';
import { Shield, Eye, EyeOff } from 'lucide-react';

export interface PasswordFields {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface SecurityCardProps {
  passwords: PasswordFields;
  twoFactorEnabled: boolean;
  onPasswordChange: (patch: Partial<PasswordFields>) => void;
  onToggleTwoFactor: (value: boolean) => void;
}

export default function SecurityCard({
  passwords,
  twoFactorEnabled,
  onPasswordChange,
  onToggleTwoFactor,
}: SecurityCardProps) {
  return (
    <section className="w-full shrink-0 rounded-xl border border-[#C3C6D4] bg-white p-5 shadow-sm sm:p-6 md:w-[280px] lg:w-[339px]">
      <div className="mb-5 flex items-center gap-2 sm:mb-6">
        <Shield className="h-5 w-5 text-[#0040A1] sm:h-6 sm:w-6" />
        <h2 className="text-[18px] font-semibold text-[#1A1C1F] sm:text-[20px]">Security</h2>
      </div>

      <div className="flex flex-col gap-4 sm:gap-5">
        <PasswordField
          id="currentPassword"
          label="Current Password"
          value={passwords.currentPassword}
          onChange={(value) => onPasswordChange({ currentPassword: value })}
          filled
        />
        <PasswordField
          id="newPassword"
          label="New Password"
          value={passwords.newPassword}
          onChange={(value) => onPasswordChange({ newPassword: value })}
        />
        <PasswordField
          id="confirmPassword"
          label="Confirm Password"
          value={passwords.confirmPassword}
          onChange={(value) => onPasswordChange({ confirmPassword: value })}
        />
      </div>
    </section>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  filled = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  filled?: boolean;
}) {
  // Each field owns its own visibility state, so toggling one never
  // affects the others. Defaults to hidden.
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-[12px] font-semibold uppercase tracking-[0.7px] text-[#747784] sm:text-[13px]"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={isVisible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="new-password"
          className="h-[43px] w-full rounded-lg border border-[#C3C6D4] px-3 pr-10 text-[#1A1C1F] outline-none focus:border-[#0040A1]"
          style={{ background: filled ? '#F3F3F8' : '#FFFFFF' }}
        />

        <button
          type="button"
          onClick={() => setIsVisible((prev) => !prev)}
          className="absolute right-0 top-0 flex h-[43px] w-10 items-center justify-center text-[#747784] transition hover:text-[#1A1C1F]"
          aria-label={isVisible ? `Hide ${label}` : `Show ${label}`}
          aria-pressed={isVisible}
          tabIndex={0}
        >
          {isVisible ? (
            <EyeOff className="h-[18px] w-[18px]" />
          ) : (
            <Eye className="h-[18px] w-[18px]" />
          )}
        </button>
      </div>
    </div>
  );
}