type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning'; // ⭐ AGREGADO
  disabled?: boolean;
  className?: string;
};

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  className = ''
}: ButtonProps) {
  const baseStyles =
    'px-4 py-2 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-lightBlue text-white hover:bg-skyBlue focus:ring-skyBlue',
    secondary: 'bg-gray-500 text-white hover:bg-gray-600 focus:ring-gray-500',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
    success:
      'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500',

    // ⭐ NUEVA VARIANTE WARNING
    warning:
      'bg-yellow-400 text-black hover:bg-yellow-500 focus:ring-yellow-400'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
