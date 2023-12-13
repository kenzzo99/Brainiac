import React from 'react';

import logo from "../../assets/images/logo.png";

const LogoStatement = () => {
  return (
    <div className="logo-statement">
      <img src={logo} style={{width: "60%", height: "auto"}} alt="BrAIniac Logo" />
      <h1 className='statement'>Learning, Reimagined.</h1>
    </div>
  );
};

export default LogoStatement;