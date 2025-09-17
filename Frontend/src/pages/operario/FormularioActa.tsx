// src/pages/operario/FormularioActa.tsx
import { useState } from "react";

export const FormularioActa = () => {
  const [nombre, setNombre] = useState("");
  const [cedula, setCedula] = useState("");
  const [sede, setSede] = useState("");
  const [procedencia, setProcedencia] = useState("");
  const [area, setArea] = useState("");
  const [categoria, setCategoria] = useState("");
  const [residuo, setResiduo] = useState("");
  const [motivo, setMotivo] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Acta enviada!");
  };

  return (
    <div className="max-w-4xl mx-auto bg-bone dark:bg-gray-800 p-8 rounded-lg shadow-md font-acidGrotesk">
      <h2 className="text-3xl font-bold mb-6 text-coffee dark:text-bone text-center">
        Nueva Acta de Destrucción
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nombre y Apellido */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-coffee dark:text-bone">
            Nombre y Apellido
          </label>
          <input
            type="text"
            placeholder="Ingrese nombre y apellido"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="p-3 border border-lightGrey dark:border-grey rounded focus:ring-2 focus:ring-cyan dark:focus:ring-skyBlue text-coffee dark:text-bone placeholder:text-lightGrey dark:placeholder:text-lightCoffee"
          />
        </div>

        {/* Cédula */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-coffee dark:text-bone">Cédula</label>
          <input
            type="text"
            placeholder="Ingrese cédula"
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
            className="p-3 border border-lightGrey dark:border-grey rounded focus:ring-2 focus:ring-cyan dark:focus:ring-skyBlue text-coffee dark:text-bone placeholder:text-lightGrey dark:placeholder:text-lightCoffee"
          />
        </div>

        {/* Sede */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-coffee dark:text-bone">Sede</label>
          <input
            type="text"
            placeholder="Ingrese sede"
            value={sede}
            onChange={(e) => setSede(e.target.value)}
            className="p-3 border border-lightGrey dark:border-grey rounded focus:ring-2 focus:ring-cyan dark:focus:ring-skyBlue text-coffee dark:text-bone placeholder:text-lightGrey dark:placeholder:text-lightCoffee"
          />
        </div>

        {/* Procedencia */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-coffee dark:text-bone">Procedencia</label>
          <input
            type="text"
            placeholder="Ingrese procedencia"
            value={procedencia}
            onChange={(e) => setProcedencia(e.target.value)}
            className="p-3 border border-lightGrey dark:border-grey rounded focus:ring-2 focus:ring-cyan dark:focus:ring-skyBlue text-coffee dark:text-bone placeholder:text-lightGrey dark:placeholder:text-lightCoffee"
          />
        </div>

        {/* Área */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-coffee dark:text-bone">Área</label>
          <input
            type="text"
            placeholder="Ingrese área"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="p-3 border border-lightGrey dark:border-grey rounded focus:ring-2 focus:ring-cyan dark:focus:ring-skyBlue text-coffee dark:text-bone placeholder:text-lightGrey dark:placeholder:text-lightCoffee"
          />
        </div>

        {/* Categoría de residuo */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-coffee dark:text-bone">
            Categoría de residuo
          </label>
          <input
            type="text"
            placeholder="Ingrese categoría"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="p-3 border border-lightGrey dark:border-grey rounded focus:ring-2 focus:ring-cyan dark:focus:ring-skyBlue text-coffee dark:text-bone placeholder:text-lightGrey dark:placeholder:text-lightCoffee"
          />
        </div>

        {/* Residuo específico */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-coffee dark:text-bone">Residuo específico</label>
          <input
            type="text"
            placeholder="Ingrese residuo específico"
            value={residuo}
            onChange={(e) => setResiduo(e.target.value)}
            className="p-3 border border-lightGrey dark:border-grey rounded focus:ring-2 focus:ring-cyan dark:focus:ring-skyBlue text-coffee dark:text-bone placeholder:text-lightGrey dark:placeholder:text-lightCoffee"
          />
        </div>

        {/* Motivo */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-coffee dark:text-bone">Motivo del residuo</label>
          <input
            type="text"
            placeholder="Ingrese motivo"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            className="p-3 border border-lightGrey dark:border-grey rounded focus:ring-2 focus:ring-cyan dark:focus:ring-skyBlue text-coffee dark:text-bone placeholder:text-lightGrey dark:placeholder:text-lightCoffee"
          />
        </div>

        {/* Botón enviar */}
        <div className="md:col-span-2 flex justify-center mt-4">
          <button
            type="submit"
            className="bg-cyan hover:bg-skyBlue dark:bg-skyBlue dark:hover:bg-cyan text-bone px-8 py-3 rounded shadow transition"
          >
            Guardar Acta
          </button>
        </div>
      </form>
    </div>
  );
};
