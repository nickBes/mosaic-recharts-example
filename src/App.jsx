import { useRef } from "react";
import "./App.css";
import { Query, avg, dateMonth, isBetween, literal } from "@uwdata/mosaic-sql";
import { Selection } from "@uwdata/mosaic-core";
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
import { useDebounceCallback } from "usehooks-ts";

function App() {
  const selection = useRef(Selection.single());

  const updateSelection = useDebounceCallback(({ startIndex, endIndex }) => {
    const startDate = barData[startIndex]?.date;
    const endDate = barData[endIndex]?.date;

    if (startDate && endDate) {
      const predicate = isBetween(dateMonth("date"), [
        dateMonth(literal(startDate)),
        dateMonth(literal(endDate)),
      ]);

      const clause = {
        source: "brush",
        predicate,
        value: [startDate, endDate],
      };

      selection.current.activate(clause);
      selection.current.update(clause);
    }
  }, 500);

  const { data: barData } = useMosaicClient({
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

  const { data: scatterData1 } = useMosaicClient({
    selection: selection.current,
    query: (filter = []) => {
      return Query.from("weather")
        .select({
          wind: "wind",
          temp_max: "temp_max",
        })
        .where(filter);
    },
  });

  const { data: scatterData2 } = useMosaicClient({
    selection: selection.current,
    query: (filter = []) => {
      return Query.from("weather")
        .select({
          wind: "wind",
          temp_max: "temp_min",
        })
        .where(filter);
    },
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
      }}
    >
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
            onChange={updateSelection}
            tickFormatter={(date) =>
              date.toLocaleDateString("default", { month: "long" })
            }
          />
          <Bar dataKey="precipitation" fill="#8884d8" />
        </BarChart>
      ) : (
        <p>Loading Bars...</p>
      )}
      <div style={{ display: "flex", gap: "20px" }}>
        {scatterData1 ? (
          <ScatterChart width={300} height={300}>
            <CartesianGrid />
            <XAxis type="number" dataKey="temp_max" name="stature" />
            <YAxis type="number" dataKey="wind" name="weight" />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Scatter
              name="A school"
              data={scatterData1}
              fill="#8884d8"
              fillOpacity={0.1}
              r={2}
            />
          </ScatterChart>
        ) : (
          <p>Loading Scatter 1...</p>
        )}
        {scatterData2 ? (
          <ScatterChart width={300} height={300}>
            <CartesianGrid />
            <XAxis type="number" dataKey="temp_max" name="stature" />
            <YAxis type="number" dataKey="wind" name="weight" />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Scatter
              name="A school"
              data={scatterData2}
              fill="#8884d8"
              fillOpacity={0.1}
              r={2}
            />
          </ScatterChart>
        ) : (
          <p>Loading Scatter 2...</p>
        )}
      </div>
    </div>
  );
}

export default App;
