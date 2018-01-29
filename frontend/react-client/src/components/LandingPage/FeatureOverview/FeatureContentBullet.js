import React, { Component } from 'react';

class FeatureContentBullet extends Component {
  constructor(props) {
    super(props);
  }

  /*** REQUIRED PROPS
    1. contentText (String)
    2. titleText (String)
  */

  render() {
      return (
        <div className="FeatureContentBulletContainer">
          <div className="FeatureContentTextTitle">{this.props.titleText}</div>
          <div className="FeatureContentDescriptionText">{this.props.contentText}</div>
        </div>
      );
  }

}

export default FeatureContentBullet;
