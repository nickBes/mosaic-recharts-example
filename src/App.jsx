import { useRef } from "react";
import "./App.css";
import { useEffect, useState } from "react";
import {
  loadCSV,
  Query,
  avg,
  dateMonth,
  isBetween,
  literal,
} from "@uwdata/mosaic-sql";
import {
  Selection,
  wasmConnector,
  Coordinator,
  MosaicClient,
  makeClient,
  coordinator,
} from "@uwdata/mosaic-core";
import {
  BarChart,
  Bar,
  Brush,
  ReferenceLine,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Scatter,
  ScatterChart,
} from "recharts";
import { useMosaicClient } from "./use-mosaic-client";

coordinator().databaseConnector(wasmConnector({ log: true }));
coordinator().manager._logQueries = true;

await coordinator().exec(
  loadCSV("weather", `${window.location}seattle-weather.csv`)
);

function App() {
  const selection = useRef(Selection.intersect());
  const [scatterData, setScatterData] = useState(null);
  const { data: barData, client } = useMosaicClient({
    query(filter = []) {
      return Query.select({
        date: dateMonth("date"),
        precipitation: avg("precipitation"),
      })
        .from("weather")
        .groupby(dateMonth("date"))
        .where(filter);
    },
  });

  useEffect(() => {
    let scatterClient = makeClient({
      coordinator: coordinator.current,
      selection: selection.current,
      query: (predicate) => {
        return Query.from("weather")
          .select({
            wind: "wind",
            temp_max: "temp_max",
          })
          .where(predicate);
      },
      queryResult: (data) => {
        setScatterData(Array.from(data));
      },
    });

    return () => {
      if (scatterClient) {
        scatterClient.destroy();
      }
    };
  }, []);

  return (
    <div>
      {barData ? (
        <BarChart
          width={1200}
          height={250}
          data={barData ?? []}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            stroke="white"
            tickFormatter={(date) =>
              date.toLocaleDateString("default", { month: "long" })
            }
            domain={["datamin", "datamax"]}
          />
          <YAxis stroke="white" />
          <Tooltip />
          <Legend verticalAlign="top" wrapperStyle={{ lineHeight: "40px" }} />
          <ReferenceLine y={0} stroke="#000" />
          <Brush
            dataKey="date"
            height={30}
            stroke="#8884d8"
            onChange={({ startIndex, endIndex }) => {
              const startDate = barData[startIndex]?.date;
              const endDate = barData[endIndex]?.date;

              if (startDate && endDate) {
                const predicate = isBetween(dateMonth("date"), [
                  dateMonth(literal(startDate)),
                  dateMonth(literal(endDate)),
                ]);

                const clause = {
                  source: client,
                  predicate,
                  value: [startDate, endDate],
                };

                this.selection.activate(clause);
                this.selection.update(clause);
              }
            }}
            tickFormatter={(date) =>
              date.toLocaleDateString("default", { month: "long" })
            }
          />
          <Bar dataKey="precipitation" fill="#8884d8" />
        </BarChart>
      ) : (
        <p>Loading Bars...</p>
      )}
      {scatterData ? (
        <ScatterChart width={1200} height={250}>
          <CartesianGrid />
          <XAxis type="number" dataKey="temp_max" name="stature" unit="cm" />
          <YAxis type="number" dataKey="wind" name="weight" unit="kg" />
          <Tooltip cursor={{ strokeDasharray: "3 3" }} />
          <Scatter
            name="A school"
            data={scatterData}
            fill="#8884d8"
            fillOpacity={0.3}
            r={2}
          />
        </ScatterChart>
      ) : (
        <p>Loading Scatter...</p>
      )}
    </div>
  );
}

export default App;
