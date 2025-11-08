type InputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'number' | 'email';
  inputMode?: 'text' | 'numeric' | 'decimal' | 'tel' | 'email';
  required?: boolean;
  disabled?: boolean;
  validation?: (value: string) => string;
  placeholder?: string;
  maxLength?: number;
  onBlur?: () => void;
};

export default function Input({
  label,
  value,
  onChange,
  type = 'text',
  inputMode,
  required = false,
  disabled = false,
  validation,
  placeholder,
  maxLength,
  onBlur
}: InputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    
    if (maxLength) {
      newValue = newValue.slice(0, maxLength);
    }
    
    if (validation) {
      newValue = validation(newValue);
    }
    
    onChange(newValue);
  };

  return (
    <div className="flex flex-col">
      <label className="mb-1 font-medium">
        {label}
      </label>
      <input
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 
                   focus:ring-2 focus:ring-skyBlue dark:focus:ring-lightBlue 
                   focus:outline-none
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all"
      />
    </div>
  );
}