import React from "react";


import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";


const DashboardGraph = ({ data }) => {
  if (!data) return null;
  
  const chartData = Object.entries(data).map(([key, value]) => ({
    name: key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase()),
    value,
  }));

  return (
    <div className="w-full h-96 bg-white p-4 shadow rounded-lg">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12 }}
            interval={0}
            angle={-30}
            textAnchor="end"
          />
          <YAxis />
          <Tooltip />
          <Bar
            dataKey="value"
            fill="#4f46e5"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DashboardGraph;