import React, { ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', className, disabled, children, ...props }) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  const variantStyles = {
    primary: 'bg-[#FF3B30] text-white hover:bg-[#E61D11]',
    secondary: 'bg-[#F3F3F8] text-[#0040A1] hover:bg-[#E5E5E8]',
    danger: 'bg-[#FF3B30] text-white hover:bg-[#E61D11]',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className || ''}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
