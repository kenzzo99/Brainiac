import React from 'react';

import logo from "../../assets/images/logo.png";

const LogoStatement = () => {
  return (
    <div className="logo-statement">
      <img src={logo} style={{width: "700px", height: "auto"}} alt="BrAIniac Logo" />
      <h1 className='statement'>Learning, Reimagined.</h1>
      <p className='sub-statement'>BrAIniac is a platform that uses AI to create personalized learning experiences for students. courseID: 65d05c3875087e6fd22223e4</p>
    </div>
  );
};

export default LogoStatement;