// src/components/admin/ReportChart.tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface Props {
  data: any[];
  type: "bar" | "pie";
  title: string;
}

export const ReportChart = ({ data, type, title }: Props) => {
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="mb-2">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        {type === "bar" ? (
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#8884d8" />
          </BarChart>
        ) : (
          <PieChart>
            <Pie data={data} dataKey="total" nameKey="name" outerRadius={100} fill="#8884d8" label>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};
