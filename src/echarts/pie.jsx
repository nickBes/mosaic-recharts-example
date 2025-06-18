import { init } from "echarts";
import { useEffect } from "react";
import { useRef } from "react";
import { useMosaicClient } from "../use-mosaic-client";
import { Query } from "@uwdata/mosaic-sql";

export function PieChart(props) {
  const { selection } = props;
  const chartWrapper = useRef(null);
  const chartRef = useRef(null);

  const { data, isPending, isError } = useMosaicClient({
    selection,
    query() {
      return Query.from("flights_airport")
        .select({
          name: "destination",
          value: "count",
        })
        .orderby("count")
        .limit(10);
    },
  });

  useEffect(() => {
    console.log("Pie data", data);

    data &&
      chartRef.current?.setOption({
        series: [
          {
            type: "pie",
            radius: "50%",
            data,
          },
        ],
      });
  }, [data]);

  useEffect(() => {
    if (chartWrapper.current) {
      chartRef.current = init(chartWrapper.current, "dark");
    }
  }, []);

  console.log("Render attempt");

  return (
    <div style={{ width: 500, height: 500 }} ref={chartWrapper}>
      {isPending && <div>Loading pie data...</div>}
      {isError && <div>Error loading pie data</div>}
    </div>
  );
}
