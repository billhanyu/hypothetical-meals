import React, { Component } from 'react';

class FeatureOverviewContentEntry extends Component {
  constructor(props) {
    super(props);
  }

  /*** REQUIRED PROPS
    1. NumBullets (Number)
  */

  render() {
      return (
        <div className="FeatureVerticalLine">
          <div className="FeatureVerticalLineCircle" style={{marginTop:'74px'}}></div>
          <div className="FeatureVerticalLineCircle" style={{marginTop:'193px'}}></div>
          <div className="FeatureVerticalLineCircle" style={{marginTop:'312px'}}></div>
        </div>
      );
  }

}

export default FeatureOverviewContentEntry;
