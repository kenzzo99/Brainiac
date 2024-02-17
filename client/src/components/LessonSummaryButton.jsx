import React, { useState, useEffect } from "react";
import { Button } from "@nextui-org/react";
import PDFViewer from "./PDFViewer";

function LessonSummaryButton({ courseID, lessonTitle }) {
  const [summary, setSummary] = useState(null);
  const [showReader, setShowReader] = useState(false);
  // This should be a URL to the endpoint that streams the PDF file
  const url = `http://localhost:5000/api/summary/${courseID}/${lessonTitle}`;

  // const handleClick = async () => {
  //   try {
  //     setShowReader(prevShowReader => !prevShowReader);
  //   } catch (error) {
  //     console.error("Error:", error);
  //   }
  // };

  const handleClick = async () => {
    try {
      // Open the PDF in a new window
      window.open(url, '_blank');
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    
      <Button color="default" size="lg" onClick={handleClick}>
        Lesson Summary
      </Button>
      /*{/* {showReader && <PDFViewer file={url} />} */
    
  );
}

export default LessonSummaryButton;
