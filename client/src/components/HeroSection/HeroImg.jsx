import React from 'react';
import rocket from '../../assets/images/rocket.png'; // Replace with your image path

const HeroImg = () => {
  return (
    <div className="hero-img" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
      <img src={rocket} style={{ width: '1000px', height: 'auto', objectFit: 'contain'}} alt="Hero" />
    </div>
  );
};


export default HeroImg;