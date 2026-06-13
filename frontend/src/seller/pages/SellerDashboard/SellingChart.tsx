import { useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useAppDispatch, useAppSelector } from '../../../Redux Toolkit/Store';
import { fetchRevenueChart } from '../../../Redux Toolkit/Seller/revenueChartSlice';
import type { RootState } from '../../../Redux Toolkit/Store';

const SellingChart = ({ chartType }: { chartType: string }) => {
  const dispatch     = useAppDispatch();
  const revenueChart = useAppSelector((state: RootState) => state.revenueChart);

  useEffect(() => {
    if (chartType) {
      dispatch(fetchRevenueChart({ type: chartType }));
    }
  }, [chartType]);

  return (
    <div style={{ width: "100%", height: "100%", minHeight: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={revenueChart.chart}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date"    stroke="#8884d8" />
          <YAxis dataKey="revenue" stroke="#8884d8" />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#94a3b8"
            fill="#ffffff"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SellingChart;
