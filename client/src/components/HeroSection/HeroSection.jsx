// src/components/HeroSection.js

import React from "react";
import "./HeroSection.css"; // Make sure to create this CSS file

import LogoStatement from "./LogoStatement";
import HeroImg from "./HeroImg";
import HeroButtons from "./HeroButtons";

import logo from "../../assets/images/logo.png";

function HeroSection() {
  return (
    <div className="hero-section">
      <LogoStatement />
      <HeroButtons />
      <HeroImg />
    </div>
  );
}

export default HeroSection;
