import React, { Component } from 'react';
import FeatureOverviewContentEntry from './FeatureOverviewContentEntry.js';

class FeatureOverviewContent extends Component {
  constructor(props) {
    super(props);

    this.BulletTexts = [
        {
          titleText:'Competitive Vendors',
          contentText:'Find ingredients from all vendors, with all prices. We provide vendors across the country.',
        },
        {
          titleText:'Simple UI',
          contentText:'Easy and self-explanatory UI interface, with simple options for purchasing ingredients.',
        },
        {
          titleText:'Best Prices',
          contentText:'Best prices for all ingredients, always. We check our competitor prices and make sure we are better. Price match guarantee.',
        },
      ];
  }
  //TODO: TO Create a Horizontal Line between elements

  render() {
      return (
        <div className="KnowledgeOverviewContainer">
          <FeatureOverviewContentEntry BulletTexts={this.BulletTexts} ImageSRC='/images/NewIngredient.png'/>
        </div>
      );
  }

}

export default FeatureOverviewContent;
