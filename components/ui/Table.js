'use client';

export function Table({ children, className = '' }) {
  return <table className={`table ${className}`}>{children}</table>;
}

export function TableHeader({ children, className = '' }) {
  return <thead className={`table-header ${className}`}>{children}</thead>;
}

export function TableBody({ children, className = '' }) {
  return <tbody className={`table-body ${className}`}>{children}</tbody>;
}

export function TableRow({ children, className = '' }) {
  return <tr className={`table-row ${className}`}>{children}</tr>;
}

export function TableHead({ children, className = '' }) {
  return <th className={`table-head ${className}`}>{children}</th>;
}

export function TableCell({ children, className = '' }) {
  return <td className={`table-cell ${className}`}>{children}</td>;
}

