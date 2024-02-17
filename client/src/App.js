import "./App.css";

import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HeroSection from "./components/HeroSection/HeroSection";
import CurriculumPage from "./components/CurriculumPage";
import QuizPage from "./components/QuizPage";
import CurriculumContext from "./context/CurriculumContext"; // Import the context
// 1. import `NextUIProvider` component
import { NextUIProvider } from "@nextui-org/react";
function App() {
  const [curriculum, setCurriculum] = React.useState(null);

  return (
    <NextUIProvider>
      <CurriculumContext.Provider value={{ curriculum, setCurriculum }}>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/curriculum/:courseID" element={<CurriculumPage />} />
              <Route path="/quiz/:courseID/:lessonTitle" element={<QuizPage />} />
              <Route path="/" element={<HeroSection />} />
            </Routes>
          </div>
        </Router>
      </CurriculumContext.Provider>
    </NextUIProvider>
  );
}

export default App;
