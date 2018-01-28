import React, { Component } from 'react';
import LandingPageHeaderSummary from './LandingPageHeaderSummary.js';

class TopContentContainer extends Component {
  constructor(props){
    super(props);
  }

  render() {
      return (
        <div className="LandingPageSummaryText">
          <div className="LandingPageMainHeaderText">
            Discover Cryptocurrency
          </div>
          <div className="LandingPageHeaderSubText">
            Learn about new and growing coins with our knowledge-base and manage digital currency investments through an advanced portfolio tracker
          </div>
          <div className="LandingPageSignUpButton">Get Started</div>
        </div>
      );
  }

}

export default TopContentContainer;
