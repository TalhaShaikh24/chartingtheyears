import React from 'react';

export function Table({ children, className = '', ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto">
      <table
        {...props}
        className={`
          w-full border-collapse
          ${className}
        `}
      >
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className = '', ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      {...props}
      className={`
        bg-muted
        border-b border-border
        ${className}
      `}
    >
      {children}
    </thead>
  );
}

export function TableBody({ children, className = '', ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody
      {...props}
      className={`
        divide-y divide-border
        ${className}
      `}
    >
      {children}
    </tbody>
  );
}

export function TableRow({ children, className = '', ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      {...props}
      className={`
        hover:bg-secondary transition-colors
        ${className}
      `}
    >
      {children}
    </tr>
  );
}

export function TableHead({ children, className = '', ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      {...props}
      className={`
        px-6 py-3 text-left text-sm font-semibold
        text-foreground uppercase tracking-wide
        ${className}
      `}
    >
      {children}
    </th>
  );
}

export function TableCell({ children, className = '', ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      {...props}
      className={`
        px-6 py-4 text-sm
        text-foreground
        ${className}
      `}
    >
      {children}
    </td>
  );
}
