import type { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'subtle' | 'danger';
export type ButtonSize = 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all ' +
  'disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2';

const variantCls: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5',
  secondary: 'border border-gray-200 text-gray-700 hover:bg-gray-50',
  subtle: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  danger: 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100',
};

const sizeCls: Record<ButtonSize, string> = {
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3.5 text-base',
};

export function buttonVariants({
  variant = 'primary',
  size = 'md',
  className = '',
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return `${base} ${variantCls[variant]} ${sizeCls[size]} ${className}`.trim();
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export default function Button({ variant = 'primary', size = 'md', className = '', ...props }: ButtonProps) {
  return <button className={buttonVariants({ variant, size, className })} {...props} />;
}
