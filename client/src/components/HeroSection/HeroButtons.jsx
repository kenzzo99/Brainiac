// HeroButtons.jsx

import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import CurriculumContext from "../../context/CurriculumContext";
import { Input, Button } from "@nextui-org/react";
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
    setShowForm((prevShowForm) => !prevShowForm);
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
      // First, try to fetch the existing curriculum
      const response = await fetch(
        `http://localhost:5000/api/curriculum/${courseID}`
      );
      const existingCurriculum = await response.text();

      if (existingCurriculum && Object.keys(existingCurriculum).length > 0) {
        // If a curriculum exists, navigate to it
        navigate(`/curriculum/${courseID}`);
      } else {
        // If no curriculum exists, generate a new one
        const response = await fetch(
          "http://localhost:5000/generateCurriculum",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
          }
        );
        const result = await response.text();
        setCurriculum(result);
        console.log("Curriculum generated successfully", result);

        // Navigate to the CurriculumPage
        navigate(`/curriculum/${courseID}`);
      }
    } catch (error) {
      console.error("Error fetching or generating curriculum", error);
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
      <div className="flex flex-col gap-3">
        <button className="button contact" onClick={handleCurriculumClick}>
          Generate Curriculum
        </button>
        {showForm && (
          <form onSubmit={handleCurriculumForm} className="flex flex-col gap-3">
            <Input
              isRequired
              type="text"
              label="Course ID"
              value={courseID}
              className="max-w"
              onChange={(e) => setCourseID(e.target.value)}
            />
            <Button color="default" size="sm" type="submit">
              Submit
            </Button>
          </form>
        )}
      </div>
      {curriculum &&
        Object.entries(curriculum).map(([key, value], index) => (
          <p key={index}>
            {key}: {value.Title}
          </p>
        ))}
    </div>
  );
};

export default HeroButtons;

// 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 OPENAI API KEY
// setx OPENAI_API_KEY "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"
