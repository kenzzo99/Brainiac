// HeroButtons.jsx

import React, { useState, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import CurriculumContext from "../../context/CurriculumContext";
const HeroButtons = () => {
  const [showForm, setShowForm] = useState(false);
  const [courseID, setCourseID] = useState("");
  const { curriculum, setCurriculum } = useContext(CurriculumContext);
  const navigate = useNavigate();
  // handles upload button click
  const handleButtonClick = () => {
    document.getElementById("fileInput").click();
  };

  // handles selecting the file
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    // Handle the file
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      setCourseID(result.courseID);
      console.log("File uploaded successfully:", result);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleCurriculumClick = () => {
    setShowForm(true);
  };

  const generateMaterials = async () => {
    try {
      const response = await fetch("http://localhost:5000/generateMaterials", {
        method: "POST",
      });
      const result = await response.json();
      console.log("Materials generated succesfully", result);
    } catch (error) {
      console.error("Error generating materials", error);
    }
  };

  //
 

  // ...



  const handleCurriculumForm = async (event) => {
    event.preventDefault();
    setShowForm(false);

    const requestBody = {
      courseID: courseID,
    };

    try {
      const response = await fetch("http://localhost:5000/generateCurriculum", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      const result = await response.json();
      setCurriculum(result);
      setShowForm(false); // Hide the form after curriculum is generated
      console.log("Curriculum generated successfully", result);

        // Navigate to the CurriculumPage
    navigate('/curriculum');
    } catch (error) {
      console.error("Error generating curriculum", error);
    }
  };

  const generateCurriculum = async () => {
    // add courseID to request body
    const courseID = "your-course-id";
    const requestBody = {
      courseID: courseID,
    };

    try {
      const response = await fetch("http://localhost:5000/generateCurriculum", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      const result = await response.json();
      console.log("Curriculum generated successfully", result);
    } catch (error) {
      console.error("Error generating curriculum", error);
    }
  };

  // Button only initiates handleFileChange if the user selects a different file from the one previously selected
  return (
    <div className="hero-buttons">
      <button className="button start" onClick={handleButtonClick}>
        Upload Files
      </button>
      <input
        type="file"
        id="fileInput"
        style={{ display: "none" }}
        onChange={handleFileChange}
      ></input>
      {courseID && <p>Course ID: {courseID}</p>}
      <button className="button contact" onClick={handleCurriculumClick}>
        Generate Curriculum
      </button>
      {showForm && (
        <form onSubmit={handleCurriculumForm}>
          <label>
            Course ID:
            <input
              type="text"
              value={courseID}
              onChange={(e) => setCourseID(e.target.value)}
            />
          </label>
          <input type="submit" value="Submit" />
        </form>
      )}
{curriculum && Object.entries(curriculum).map(([key, value], index) => (
  <p key={index}>{key}: {value.Title}</p>
))}
      <button className="button contact" onClick={generateMaterials}>
        Generate Materials
      </button>
    </div>
  );
};

export default HeroButtons;

// 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 OPENAI API KEY
// setx OPENAI_API_KEY "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"
