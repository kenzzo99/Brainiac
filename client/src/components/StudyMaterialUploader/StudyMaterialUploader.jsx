import React, { useState } from 'react';
import './StudyMaterialUploader.css'; // Make sure to create this CSS file

function StudyMaterialUploader() {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);

  function handleTextChange(event) {
    setText(event.target.value);
  }

  function handleFileChange(event) {
    setFile(event.target.files[0]);
  }

  function handleSubmit(event) {
    event.preventDefault();
    // Implement what should happen on form submission
    // This will typically involve sending the text or file to a backend server
  }

  return (
    <div className="StudyMaterialUploader">
      <form onSubmit={handleSubmit}>
        <h2>Generate instant study materials</h2>
        <div>
          <button type="button">Paste text</button>
          <button type="button">File from computer</button>
          <button type="button">Google Docs</button>
        </div>
        <textarea
          placeholder="Finish signing up to start pasting your notes here"
          value={text}
          onChange={handleTextChange}
        />
        <input
          type="file"
          onChange={handleFileChange}
        />
        <button type="submit">Upload</button>
        <div>{text.length}/40,000 characters</div>
      </form>
    </div>
  );
}

export default StudyMaterialUploader;
