export const getEstilosPorEstado = (tipo: string) => {
  switch (tipo) {
    case "conciliada":
      return {
        bgColor: "bg-green-50 dark:bg-green-900/20",
        textColor: "text-green-800 dark:text-green-200",
        borderColor: "border-green-200 dark:border-green-700",
        badgeColor: "bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200",
        icon: "✅",
      };
    case "pendiente":
      return {
        bgColor: "bg-gray-50 dark:bg-gray-900/20",
        textColor: "text-gray-800 dark:text-gray-200",
        borderColor: "border-gray-200 dark:border-gray-700",
        badgeColor: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200",
        icon: "⏳",
        pesoColor: "text-gray-600 dark:text-gray-400",
      };
    case "con_novedad":
      return {
        bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
        textColor: "text-yellow-800 dark:text-yellow-200",
        borderColor: "border-yellow-200 dark:border-yellow-700",
        badgeColor: "bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200",
        icon: "⚠️",
        pesoColor: "text-yellow-600 dark:text-yellow-400",
      };
    default:
      return {
        bgColor: "bg-gray-50 dark:bg-gray-800/20",
        textColor: "text-gray-800 dark:text-gray-200",
        borderColor: "border-gray-200 dark:border-gray-700",
        badgeColor: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200",
        icon: "📄",
      };
  }
};

export const getHoverPorEstado = (tipo: string) => {
  switch (tipo) {
    case "conciliada":
      return "hover:shadow-green-100 dark:hover:shadow-green-900/30 hover:border-green-300";
    case "pendiente":
      return "hover:shadow-gray-100 dark:hover:shadow-gray-900/30 hover:border-gray-300";
    case "con_novedad":
      return "hover:shadow-yellow-100 dark:hover:shadow-yellow-900/30 hover:border-yellow-300";
    default:
      return "hover:shadow-lg hover:border-gray-300";
  }
};

export const getTextoEstado = (tipo: string) => {
  switch (tipo) {
    case "conciliada":
      return "Conciliada";
    case "pendiente":
      return "Pendiente";
    case "con_novedad":
      return "Con Novedad";
    default:
      return "Sin estado";
  }
};