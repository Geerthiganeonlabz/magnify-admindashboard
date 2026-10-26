import React from 'react';
import { Input, InputProps } from './input';

export interface InputFieldProps extends InputProps {
  label: string;
  error?: string;
}

export const InputField: React.FC<InputFieldProps> = ({ label, error, ...props }) => {
  return (
    <div className="input-field-container">
      <label className="input-label">{label}</label>
      <Input {...props} />
      {error && <span className="input-error">{error}</span>}
    </div>
  );
};

export default InputField;
