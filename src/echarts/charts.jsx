import { coordinator, Selection, wasmConnector } from "@uwdata/mosaic-core";
import { useRef, useEffect, useState } from "react";
import { loadCSV, loadParquet } from "@uwdata/mosaic-sql";
import { PieChart } from "./pie";
import { BarChart } from "./bar";

export function Charts() {
  const selection = useRef(Selection.intersect());
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    coordinator().databaseConnector(wasmConnector({ log: true }));
    coordinator().manager._logQueries = true;

    Promise.all([
      coordinator().exec(
        loadParquet("flights", `${window.location}flights-3m.parquet`)
      ),
      coordinator().exec(
        loadCSV("flights_airport", `${window.location}flights-airport.csv`)
      ),
    ])
      .then(() => {
        setStatus("loaded");
      })
      .catch((error) => {
        console.error("Error loading data:", error);
        setStatus("error");
      });
  });

  if (status === "loading") {
    return <div>Loading echart charts...</div>;
  }
  if (status === "error") {
    return <div>Error loading data</div>;
  }

  return (
    <div style={{ display: "flex", gap: "20px" }}>
      <PieChart selection={selection.current} />
      <BarChart selection={selection.current} />
    </div>
  );
}
