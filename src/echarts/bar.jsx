import { avg, Query } from "@uwdata/mosaic-sql";
import { useMosaicClient } from "../use-mosaic-client";
import { useRef, useEffect, useMemo } from "react";
import { init, dispose } from "echarts/core";

export function BarChart(props) {
  const { selection } = props;
  const chartWrapper = useRef(null);
  const chartRef = useRef(null);
  const { data, isError, isPending } = useMosaicClient({
    selection,
    query(filter = []) {
      return Query.from("flights")
        .select({ xaxis: "origin", value: avg("delay") })
        .groupby("origin")
        .where(filter);
    },
  });

  const xAxisData = useMemo(() => {
    return data?.map((d) => d.xaxis) || [];
  }, [data]);

  const barData = useMemo(() => {
    return data?.map((d) => d.value) || [];
  }, [data]);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.setOption({
        xAxis: {
          type: "category",
          data: xAxisData,
        },
        brush: {
          toolbox: ["rect", "polygon", "lineX", "lineY", "keep", "clear"],
          xAxisIndex: 0,
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            type: "bar",
            data: barData,
          },
        ],
      });
    }
  }, [xAxisData, barData]);

  useEffect(() => {
    if (chartWrapper.current) {
      chartRef.current = init(chartWrapper.current, "dark");
    }

    return () => {
      chartRef.current && dispose(chartRef.current);
    };
  }, [selection]);

  return (
    <div style={{ width: 500, height: 500 }} ref={chartWrapper}>
      {isPending && <div>Loading bar chart...</div>}
      {isError && <div>Error loading bar data</div>}
    </div>
  );
}
