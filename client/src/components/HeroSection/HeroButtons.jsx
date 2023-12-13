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
    console.log(file.name);
  };


  return (
    <div className="hero-buttons">
      <button className="button start" onClick={handleButtonClick}>Upload Files</button>
      <input type="file" id="fileInput" style={{display: "none"}} onChange={handleFileChange}></input>
      {/* <button className="button contact">CONTACT</button> */}
    </div>
  );
};

export default HeroButtons;

// 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 OPENAI API KEY
// setx OPENAI_API_KEY "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"