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
  min?: number;
  max?: number;
  step?: number;
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
  onBlur,
  min,
  max,
  step,
}: InputProps) {
 const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  let newValue = e.target.value;

  // Validación especial para inputs numéricos
  if (type === 'number') {
    // Permitir mientras escribe un punto o vacío
    if (newValue === "" || newValue === ".") {
      onChange(newValue);
      return;
    }

    // Limitar a 2 decimales
    if (/^\d+(\.\d{0,2})?$/.test(newValue) === false) {
      // Si excede 2 decimales, recortamos
      newValue = newValue.replace(/(\.\d{2}).+/, "$1");
    }

    const numeric = parseFloat(newValue);

    if (!isNaN(numeric)) {
      // Aplicar max
      if (max !== undefined && numeric > max) {
        newValue = String(max);
      }
      // Aplicar min
      if (min !== undefined && numeric < min) {
        newValue = String(min);
      }
    }
  }

  // Validación genérica (si viene una función)
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
        // ⬇⬇⬇ Solo aplica min/max/step si el input es numérico
        {...(type === 'number' ? { min, max, step } : {})}
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
