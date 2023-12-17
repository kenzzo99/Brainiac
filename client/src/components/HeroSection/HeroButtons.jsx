// HeroButtons.jsx

import React from 'react';

const HeroButtons = () => {
  // handles upload button click
  const handleButtonClick = () => {
    document.getElementById('fileInput').click();
  };

  // handles selecting the file
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    // Handle the file
    if (file) {
      handleFileUpload(file)
    };
  };

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      console.log('File uploaded successfully:', result);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const generateMaterials = async () => {
    try {
      const response = await fetch('http://localhost:5000/generateMaterials', {
        method: 'POST',
      });
      const result = await response.json();
      console.log('Materials generated succesfully', result);
    } catch (error) {
      console.error('Error generating materials', error);
    }
  };
  
  

  // Button only initiates handleFileChange if the user selects a different file from the one previously selected
  return (
    <div className="hero-buttons">
      <button className="button start" onClick={handleButtonClick}>Upload Files</button>
      <input type="file" id="fileInput" style={{display: "none"}} onChange={handleFileChange}></input>
      <button className="button contact" onClick={generateMaterials}>Generate Materials</button>
    </div>
  );
};

export default HeroButtons;

// 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 OPENAI API KEY
// setx OPENAI_API_KEY "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"