import React, { Component } from 'react';
import FeatureContentBullet from './FeatureContentBullet.js';
import FeatureVerticalBulletLine from './FeatureVerticalBulletLine.js';

class FeatureOverviewContentEntry extends Component {
  constructor(props) {
    super(props);
  }

  /*** REQUIRED props
  1. BulletTexts (Array of JSON Objects with keys as listed below)
      1. titleText (String)
      2. contentText (String)
  2. ImageSRC (String)
  */

  render() {
      return (
        <div className="FeatureContentContainer">
          <FeatureVerticalBulletLine />
          <div className="FeatureContentTextContainer">
            <div className="FeatureContentBulletsContainer">
            {
              this.props.BulletTexts.map((element, key) => {
                return <FeatureContentBullet contentText={element.contentText} titleText={element.titleText} key={key} />
              })
            }
            </div>
          </div>

          <div className="FeatureContentImageContainer">
            <div className="background"></div>
            <div className="mask">
              <div className="bluredBackground"></div>
            </div>
          </div>
        </div>
      );
  }

}

export default FeatureOverviewContentEntry;
