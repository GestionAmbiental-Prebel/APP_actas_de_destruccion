type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[] | string[];
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
};

export default function Select({
  label,
  value,
  onChange,
  options,
  required = false,
  disabled = false,
  placeholder = 'Seleccione una opción'
}: SelectProps) {
  // Normalizar opciones: si son strings, convertirlas a objetos
  const normalizedOptions: SelectOption[] = options.map(opt => 
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  return (
    <div className="flex flex-col">
      <label className="mb-1 font-medium">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 
                   focus:ring-2 focus:ring-skyBlue dark:focus:ring-lightBlue 
                   focus:outline-none
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all"
      >
        <option value="">{placeholder}</option>
        {normalizedOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}