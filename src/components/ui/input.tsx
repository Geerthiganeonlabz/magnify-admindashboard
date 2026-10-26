import React, { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'outline' | 'ghost';
}

export const Input: React.FC<InputProps> = ({ variant = 'default', className, ...props }) => {
  return (
    <input
      className={cn(
        'w-full rounded-lg border border-[#E5E5E8] bg-white px-4 py-3 text-[#1A1C1F] placeholder-[#999BA5] transition-colors focus:border-[#0040A1] focus:outline-none focus:ring-1 focus:ring-[#0040A1] disabled:bg-[#F3F3F8] disabled:text-[#999BA5]',
        className,
      )}
      {...props}
    />
  );
};

export default Input;
