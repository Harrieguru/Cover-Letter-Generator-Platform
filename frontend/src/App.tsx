import React from "react";
import "./App.css";
import { ResumeImprover } from "./components/ResumeImprover";
import { CoverLetterGenerator } from "./components/CoverLetterGenerator";

function App() {
  return (
    <div className="App">
      {/* <ResumeImprover /> */}
      <CoverLetterGenerator />
    </div>
  );
}

export default App;
