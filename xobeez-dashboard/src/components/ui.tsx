import React from 'react';
import { Toaster, toast, ToastOptions } from 'react-hot-toast';

// Button component
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, className = '', disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
      secondary: 'bg-gray-700 hover:bg-gray-600 text-white focus:ring-gray-500',
      danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
      ghost: 'bg-transparent hover:bg-gray-800 text-gray-300 focus:ring-gray-500',
    };
    
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };
    
    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
);

Button.displayName = 'Button';

// Card component
export interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export const Card = ({ children, className = '', title, subtitle }: CardProps) => {
  return (
    <div className={`bg-gray-800 rounded-xl border border-gray-700 overflow-hidden ${className}`}>
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-gray-700">
          {title && <h3 className="text-lg font-bold text-white">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};

// Toast wrapper with default config
export const showToast = {
  success: (message: string, options?: ToastOptions) => toast.success(message, options),
  error: (message: string, options?: ToastOptions) => toast.error(message, options),
  loading: (message: string, options?: ToastOptions) => toast.loading(message, options),
  dismiss: (id: string) => toast.dismiss(id),
  promise: <T,>(promise: Promise<T>, messages: { loading: string; success: string; error: string }, options?: ToastOptions) => 
    toast.promise(promise, messages, options),
};

// Toaster component for app
export const ToastContainer = () => (
  <Toaster
    position="top-right"
    toastOptions={{
      duration: 4000,
      style: {
        background: '#1f2937',
        color: '#f9fafb',
        border: '1px solid #374151',
        borderRadius: '0.75rem',
        padding: '1rem',
      },
      success: {
        iconTheme: {
          primary: '#10b981',
          secondary: '#f9fafb',
        },
      },
      error: {
        iconTheme: {
          primary: '#ef4444',
          secondary: '#f9fafb',
        },
      },
    }}
  />
);