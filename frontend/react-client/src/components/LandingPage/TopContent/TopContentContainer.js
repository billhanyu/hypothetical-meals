import React, { Component } from 'react';
import LandingPageHeader from './LandingPageHeader.js';
import LandingPageMainBannerContent from './LandingPageMainBannerContent.js';

class TopContentContainer extends Component {
  constructor(props){
    super(props);
  }

  render() {
      return (
        <div className="LandingPageContentContainer">
          <LandingPageHeader />
          <LandingPageMainBannerContent />
        </div>
      );
  }

}

export default TopContentContainer;
