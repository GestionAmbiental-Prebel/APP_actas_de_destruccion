import { Fragment, useState, useRef, useEffect } from "react";
import { Combobox as HUICombobox, Transition } from "@headlessui/react";

export type ComboOption = {
  value: string;
  label: string;
};

type ComboboxProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: ComboOption[];
  disabled?: boolean;
  placeholder?: string;
};

export default function Combobox({
  label,
  value,
  onChange,
  options,
  disabled = false,
  placeholder = "Seleccione..."
}: ComboboxProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered =
    query === ""
      ? options
      : options.filter(o =>
          o.label.toLowerCase().includes(query.toLowerCase())
        );

  // Detectar clicks fuera del componente
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef} className="flex flex-col gap-1">
      <label className="font-medium">{label}</label>

      <HUICombobox
        value={value}
        onChange={(v: string | null) => {
          if (v !== null) {
            onChange(v);
            setIsOpen(false); // cerramos solo cuando selecciona una opción
          }
        }}
        disabled={disabled}
        as="div"
        className="relative"
      >
        <HUICombobox.Input
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 p-2 bg-white dark:bg-gray-800"
          displayValue={(v: string) => options.find(o => o.value === v)?.label ?? ""}
          placeholder={placeholder}
          onChange={e => {
            setQuery(e.target.value);
            setIsOpen(true); // mantener abierto al escribir
          }}
          onClick={() => {
            setQuery(""); // limpiar filtro para mostrar todas
            setIsOpen(true); // abrir menú
          }}
        />

        <Transition
          as={Fragment}
          show={isOpen} // controlamos apertura manualmente
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <HUICombobox.Options className="absolute mt-1 w-full max-h-60 overflow-y-auto rounded-md bg-white dark:bg-gray-800 shadow-lg border border-gray-300 dark:border-gray-600 z-50">
            {filtered.length === 0 ? (
              <div className="p-3 text-gray-400 text-sm">Sin resultados</div>
            ) : (
              filtered.map(o => (
                <HUICombobox.Option
                  key={o.value}
                  value={o.value}
                  className={({ active }) =>
                    `cursor-pointer select-none p-2 ${active ? "bg-sky-200 dark:bg-sky-700" : ""}`
                  }
                >
                  {o.label}
                </HUICombobox.Option>
              ))
            )}
          </HUICombobox.Options>
        </Transition>
      </HUICombobox>
    </div>
  );
}
