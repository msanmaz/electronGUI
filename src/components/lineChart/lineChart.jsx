import React from "react";
import {
  CartesianGrid,
  LineChart,
  ResponsiveContainer,
  YAxis,
  XAxis,
  Line,
} from "recharts";

const LineChartPlot = (props) => {
  const { data } = props;
  console.log(data);
  const slicedData = data.length > 1250 ? data.slice(data.length - 1250) : data;
  const filteredArray = slicedData.filter((item) => item.counter % 5 === 0);

  return (
    <>
      <ResponsiveContainer height={350} width="100%">
        <LineChart data={filteredArray} margin={{ right: 25, top: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="counter" />
          <YAxis dataKey="A_X" />
          <Line type="monotone" dataKey="A_X" stroke="#8884d8" />
          <Line type="monotone" dataKey="A_Z" stroke="#FF4500" />
          <Line type="monotone" dataKey="A_Y" stroke="#008000" />
        </LineChart>
      </ResponsiveContainer>
    </>
  );
};

export default React.memo(LineChartPlot);
