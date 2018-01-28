import React, { Component } from 'react';
import FeatureOverviewContentEntry from './FeatureOverviewContentEntry.js';

class FeatureOverviewContent extends Component {
  constructor(props) {
    super(props);

    this.BulletTexts = [
        {
          titleText:'Detailed Coin Summary',
          contentText:'Learn about the coin project with a general overview of recent developments.',
        },
        {
          titleText:'Detailed Coin Summary',
          contentText:'Learn about the coin project with a general overview of recent developments.',
        },
        {
          titleText:'Detailed Coin Summary',
          contentText:'Learn about the coin project with a general overview of recent developments.',
        },
      ];
  }
  //TODO: TO Create a Horizontal Line between elements

  render() {
      return (
        <div className="KnowledgeOverviewContainer">
          <FeatureOverviewContentEntry BulletTexts={this.BulletTexts} ImageSRC='/images/KnowledgeImage.png'/>
        </div>
      );
  }

}

export default FeatureOverviewContent;
