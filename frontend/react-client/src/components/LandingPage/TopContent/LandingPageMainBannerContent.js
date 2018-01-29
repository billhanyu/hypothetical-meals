import React, { Component } from 'react';
import LandingPageHeaderBulletsContainer from './LandingPageHeaderBulletsContainer.js';

class TopContentContainer extends Component {
  constructor(props){
    super(props);
  }

  render() {
      return (
        <div className="LandingPageHeaderContainer">
          <LandingPageHeaderBulletsContainer />
        </div>
      );
  }

}

export default TopContentContainer;
