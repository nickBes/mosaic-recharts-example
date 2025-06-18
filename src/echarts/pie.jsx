import { dispose, init } from "echarts";
import { useEffect } from "react";
import { useRef } from "react";
import { useMosaicClient } from "../use-mosaic-client";
import { eq, literal, Query, sum, desc } from "@uwdata/mosaic-sql";

export function PieChart(props) {
  const { selection } = props;
  const chartWrapper = useRef(null);
  const chartRef = useRef(null);

  const { data, isPending, isError } = useMosaicClient({
    selection,
    query(filter = []) {
      return Query.from("flights_airport")
        .select({
          name: "destination",
          value: sum("count"),
        })
        .where(filter)
        .groupby("destination")
        .orderby(desc(sum("count")))
        .limit(10);
    },
  });

  useEffect(() => {
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

      chartRef.current.on("click", (opts) => {
        const { data } = opts;

        const relatedClauses = selection.clauses.filter(
          (clause) => clause.source === "pie"
        );

        if (relatedClauses.length > 0) {
          selection.reset(relatedClauses);
        } else if (data && data.name) {
          const predicate = eq("destination", literal(data.name));

          const clause = {
            source: "pie",
            predicate,
            value: data.name,
          };

          selection.update(clause);
        }
      });
    }

    return () => {
      chartRef.current && dispose(chartRef.current);
    };
  }, [selection]);

  return (
    <div style={{ width: 500, height: 500 }} ref={chartWrapper}>
      {isPending && <div>Loading pie data...</div>}
      {isError && <div>Error loading pie data</div>}
    </div>
  );
}
