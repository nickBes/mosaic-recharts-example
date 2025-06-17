import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { wasmConnector, coordinator, Priority } from "@uwdata/mosaic-core";
import { loadCSV } from "@uwdata/mosaic-sql";

coordinator().databaseConnector(wasmConnector({ log: true }));
coordinator().manager._logQueries = true;

await coordinator().exec(
  loadCSV("weather", `${window.location}seattle-weather.csv`),
  { priority: Priority.High }
);

console.log("Mosaic client initialized with CSV data");

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
