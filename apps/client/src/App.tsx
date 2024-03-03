import "./App.css";
import Lobby from "./components/Lobby/Lobby";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CodeBlock from "./components/CodeBlock/CodeBlock";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Lobby />} />
          <Route path="/codeblock/:codeTitleName" element={<CodeBlock />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
