import { useCallback, useRef, useState } from "react";
import "./App.css";
import useInterval from "./useInterval.js";

// stretch goal: detect looping

// Directions: N, S, E, W, NE, NW, SE, SW
const operations = [
  [0, 1], // top
  [0, -1], // bottom
  [1, 0], // right
  [-1, 0], // left
  [1, 1], // top right
  [-1, 1], // top left
  [1, -1], // bottom right
  [-1, -1], // bottom left
];

const generateRandomGrid = (numRows, numCols) => {
  const rows = [];
  for (let row = 0; row < numRows; row++) {
    rows.push(Array.from(Array(numCols), () => (Math.random() > 0.7 ? 1 : 0)));
  }
  return rows;
};

const LoopCount = ({ count }) => <div>Loop count: {count}</div>;

function App({ numRows = 10, numCols = 10, interval = 150 }) {
  const [loopCount, setLoopCount] = useState(0);
  const [grid, setGrid] = useState(() => {
    return generateRandomGrid(numRows, numCols);
  });
  const [running, setRunning] = useState(false);
  const [evolving, setEvolving] = useState(null);
  const runningRef = useRef(running);
  runningRef.current = running;
  const startedRef = useRef(false);

  const runSimulation = useCallback(
    (grid) => {
      if (!runningRef.current) {
        return;
      }

      setEvolving(true);

      let gridCopy = JSON.parse(JSON.stringify(grid));
      for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
          let neighbors = 0;

          operations.forEach(([x, y]) => {
            const newRow = row + x;
            const newCol = col + y;

            if (
              newRow >= 0 &&
              newRow < numRows &&
              newCol >= 0 &&
              newCol < numCols
            ) {
              neighbors += grid[newRow][newCol];
            }
          });

          if (neighbors < 2 || neighbors > 3) {
            gridCopy[row][col] = 0;
          } else if (grid[row][col] === 0 && neighbors === 3) {
            gridCopy[row][col] = 1;
          }
        }
      }

      // this is wildly non-performant with larger grids
      if (JSON.stringify(grid) === JSON.stringify(gridCopy)) {
        setEvolving(false);
        setRunning(false);
        return;
      }

      setLoopCount((previous) => previous + 1);
      setGrid(gridCopy);
    },
    [numCols, numRows]
  );

  useInterval(() => {
    runSimulation(grid);
  }, interval);

  if (!startedRef.current) {
    setRunning(true);
    startedRef.current = true;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Game of Life</h1>
        <LoopCount count={loopCount} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${numCols}, 20px)`,
            width: "fit-content",
            margin: "0 auto",
          }}
        >
          {grid.map((rows, i) =>
            rows.map((col, k) => (
              <div
                key={`${i}-${k}`}
                onClick={() => {
                  // Deep clone grid
                  let newGrid = JSON.parse(JSON.stringify(grid));
                  newGrid[i][k] = grid[i][k] ? 0 : 1;
                  setGrid(newGrid);
                }}
                style={{
                  width: 20,
                  height: 20,
                  backgroundColor: grid[i][k] ? "#F68E5F" : undefined,
                  border: "1px solid #595959",
                }}
              ></div>
            ))
          )}
        </div>
        {startedRef.current && evolving != null && (
          <div>
            {evolving ? "Evolution is ongoing." : "Evolution has stopped."}
          </div>
        )}
        <button
          onClick={() => {
            setRunning(!running);
          }}
        >
          {running ? "Pause" : "Play"}
        </button>
        <button
          onClick={() => {
            setRunning(false);
            setGrid(generateRandomGrid(numRows, numCols));
            setLoopCount(0);
            setRunning(true);
          }}
        >
          Restart
        </button>
      </header>
    </div>
  );
}

export default App;
