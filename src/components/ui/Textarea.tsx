import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Textarea({
  label,
  error,
  helperText,
  className = '',
  ...props
}: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-foreground mb-2 uppercase tracking-wide">
          {label}
        </label>
      )}
      <textarea
        {...props}
        className={`
          w-full px-4 py-2 rounded-lg
          bg-input text-foreground
          border border-border
          placeholder:text-muted-foreground
          focus:outline-none focus:ring-2 focus:ring-accent
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors resize-none
          min-h-32
          ${error ? 'border-destructive focus:ring-destructive' : ''}
          ${className}
        `}
      />
      {error && (
        <p className="text-xs text-destructive mt-1">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-xs text-muted-foreground mt-1">{helperText}</p>
      )}
    </div>
  );
}
