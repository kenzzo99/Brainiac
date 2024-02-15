import React, { useState, useEffect } from "react";
import { Button } from "@nextui-org/react";
import PDFViewer from "./PDFViewer";

function LessonSummaryButton({ courseID, lessonTitle }) {
  const [summary, setSummary] = useState(null);
  const [showReader, setShowReader] = useState(false);

const handleClick = async () => {
    try {
        console.log("Lesson Title:", lessonTitle);
        const response = await fetch(
            `http://localhost:5000/api/summary/${courseID}/${lessonTitle}`
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const lesson = await response.text();
        console.log("Summary data:", lesson);
        setSummary(lesson);
        setShowReader(true);
    } catch (error) {
        console.error("Error:", error);
    }
};

  return (
    <div>
      <Button color="primary" size="lg" onClick={handleClick}>
        Lesson Summary
      </Button>
      {summary && showReader && <PDFViewer file={summary} />}
    </div>
  );
}

export default LessonSummaryButton;
