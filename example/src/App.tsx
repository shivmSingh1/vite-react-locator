import { useState } from "react";

function Header() {
  return <h2>Header Component</h2>;
}

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount((c) => c + 1)}>
      Count: {count}
    </button>
  );
}

function App() {
  return (
    <div>
      <Header />
      <Counter />
      <h1>vite-react-locator</h1>
    </div>
  );
}

export default App;