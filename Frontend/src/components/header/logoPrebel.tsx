export const LogoPrebel = () => {
  return (
    <section className="flex items-center gap-4">
      {/* Logo Prebel principal */}
      <div>
        <img
          src="/image/Prebel_AzulClaro_SF.webp"
          alt="Logo Prebel Azul claro"
          className="block dark:hidden"
          width={120}
          height={100}
        />
        <img
          src="/image/Prebel_Blanco.webp"
          alt="Logo Prebel blanco"
          className="hidden dark:block"
          width={120}
          height={100}
        />
      </div>

      {/* Logo Ambiental */}
      <div>
        <img
          src="/image/Ambiental_AzulClaro.webp"
          alt="Segunda imagen claro"
          className="block dark:hidden"
          width={130}
          height={80}
        />
        <img
          src="/image/Ambiental_AzulClaro.webp"
          alt="Segunda imagen oscuro"
          className="hidden dark:block"
          width={130}
          height={100}
        />
      </div>
    </section>
  );
};
