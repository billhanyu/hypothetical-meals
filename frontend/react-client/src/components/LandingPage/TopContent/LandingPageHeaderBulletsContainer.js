import React, { Component } from 'react';
import LandingPageHeaderBullet from './LandingPageHeaderBullet.js';

class LandingPageHeaderBulletsContainer extends Component {
  constructor(props){
    super(props);
  }

  render() {
      return (
        <div className="LandingPageHeaderBulletsContainer">
          <LandingPageHeaderBullet faIcon="far fa-lightbulb fa-3x" textContent="Detailed information on all coins" faStyle={{marginLeft: '8px'}} textStyle={{marginLeft:'19px'}}/>
          <LandingPageHeaderBullet faIcon="fas fa-chart-line fa-3x" textContent="Beautiful and informative coin tracker" textStyle={{marginLeft:'16px'}}/>
          <LandingPageHeaderBullet faIcon="far fa-credit-card fa-3x" textContent="Free to use with NO advertisements" />
        </div>
      );
  }

}

export default LandingPageHeaderBulletsContainer;
