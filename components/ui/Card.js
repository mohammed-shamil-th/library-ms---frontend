'use client';

export function Card({ children, className = '' }) {
  return <div className={`card ${className}`}>{children}</div>;
}

export function CardHeader({ children, className = '' }) {
  return <div className={`card-header ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '' }) {
  return <h3 className={`card-title ${className}`}>{children}</h3>;
}

export function CardDescription({ children, className = '' }) {
  return <p className={`card-description ${className}`}>{children}</p>;
}

export function CardContent({ children, className = '' }) {
  return <div className={`card-content ${className}`}>{children}</div>;
}

