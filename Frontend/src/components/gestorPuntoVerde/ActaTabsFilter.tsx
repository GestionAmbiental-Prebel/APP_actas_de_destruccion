import Button from "../common/Button";

type ActaTabsFilterProps = {
  filtroTab: "conciliadas" | "pendientes" | "novedad";
  setFiltroTab: (tab: "conciliadas" | "pendientes" | "novedad") => void;
};

export const ActaTabsFilter = ({ filtroTab, setFiltroTab }: ActaTabsFilterProps) => {
  return (
    <div className="flex justify-center gap-4 mb-6">
      <Button
        variant={filtroTab === "conciliadas" ? "primary" : "secondary"}
        onClick={() => setFiltroTab("conciliadas")}
      >
        Conciliadas
      </Button>
      <Button
        variant={filtroTab === "pendientes" ? "primary" : "secondary"}
        onClick={() => setFiltroTab("pendientes")}
      >
        Pendientes
      </Button>
      <Button
        variant={filtroTab === "novedad" ? "warning" : "secondary"}
        onClick={() => setFiltroTab("novedad")}
      >
        Con Novedad ⚠️
      </Button>
    </div>
  );
};