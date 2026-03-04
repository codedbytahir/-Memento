import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="w-full space-y-1">
      {label ? (
        <label className="text-sm font-medium text-charcoal">{label}</label>
      ) : null}
      <input
        className={`flex h-11 w-full rounded-md border border-navy/20 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-charcoal-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      />
      {error ? (
        <p className="text-xs text-red-500 font-medium">{error}</p>
      ) : null}
    </div>
  );
};
