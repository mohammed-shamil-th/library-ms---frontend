'use client';

export default function Button({
  children,
  variant = 'default',
  size = 'default',
  className = '',
  onClick,
  disabled = false,
  type = 'button',
  ...props
}) {
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;
  const disabledClass = disabled ? 'btn-disabled' : '';

  return (
    <button
      type={type}
      className={`${baseClass} ${variantClass} ${sizeClass} ${disabledClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

