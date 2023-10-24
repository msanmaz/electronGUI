import {
  CartesianGrid,
  LineChart,
  ResponsiveContainer,
  YAxis,
  XAxis,
  Line,
} from "recharts";
import React from "react";


function LineChartPlot(props){
  const { data } = props;

  const dataToDisplay = data.slice(Math.max(data.length - 50, 0));

  return (
    <>
      <ResponsiveContainer height={350} width="100%">
        <LineChart data={dataToDisplay} margin={{ right: 25, top: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="counter" />
          <YAxis  />
          <Line type="monotone" dataKey="c1" stroke="#8884d8" />
          <Line type="monotone" dataKey="c2" stroke="#FF4500" />
          <Line type="monotone" dataKey="c3" stroke="#008060" />
          <Line type="monotone" dataKey="c4" stroke="#008650" />
          <Line type="monotone" dataKey="c5" stroke="#008300" />
          <Line type="monotone" dataKey="c6" stroke="#008300" />
          <Line type="monotone" dataKey="c7" stroke="#008300" />
          <Line type="monotone" dataKey="c8" stroke="#008300" />
          <Line type="monotone" dataKey="c9" stroke="#008300" />
          <Line type="monotone" dataKey="c10" stroke="#008300" />


        </LineChart>
      </ResponsiveContainer>
    </>
  );
}

export default React.memo(LineChartPlot)
