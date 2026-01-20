import {
    BarChart,
    Bar, 
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

interface ChartProps {
    data: { month: string; revenue: number }[];
}

const MonthlySalesChart = ({ data }: ChartProps) => {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mt-8">
      <h3 className="font-semibold mb-4">Monthly Sales Performance</h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="revenue" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlySalesChart;