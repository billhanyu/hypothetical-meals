import React, { Component } from 'react';
import FeatureOverviewContent from './FeatureOverviewContent.js';
import FeatureHeader from './FeatureHeader.js';

class FeaturesOverviewContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      portFolioSelected: true,
      knowledgeSelected: false,
    };
  }

  // THIS COMPONENT IS JUST THE TABS LOGIC, Renders the correct feature overview container

  render() {
      return (
        <div className="FeaturesOverviewContainer">
          <FeatureHeader />
          <FeatureOverviewContent />
        </div>
      );
  }

}

export default FeaturesOverviewContainer;
