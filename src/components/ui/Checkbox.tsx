import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Checkbox({
  label,
  className = '',
  ...props
}: CheckboxProps) {
  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        {...props}
        className={`
          w-5 h-5 rounded-md
          bg-input border border-border
          cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-accent
          checked:bg-primary checked:border-primary
          accent-primary
          ${className}
        `}
      />
      {label && (
        <label className="ml-2 text-sm font-medium text-foreground cursor-pointer">
          {label}
        </label>
      )}
    </div>
  );
}
