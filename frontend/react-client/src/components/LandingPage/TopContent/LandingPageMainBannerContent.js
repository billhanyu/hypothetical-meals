import React, { Component } from 'react';
import LandingPageHeaderBulletsContainer from './LandingPageHeaderBulletsContainer.js';
import LandingPageHeaderSummary from './LandingPageHeaderSummary.js';

class TopContentContainer extends Component {
  constructor(props){
    super(props);
  }

  render() {
      return (
        <div className="LandingPageHeaderContainer">
          <LandingPageHeaderSummary />
          <LandingPageHeaderBulletsContainer />
        </div>
      );
  }

}

export default TopContentContainer;
