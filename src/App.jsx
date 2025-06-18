import "./App.css";
import { Charts } from "./echarts/charts";

function App() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
      }}
    >
      <Charts />
    </div>
  );
}

export default App;
