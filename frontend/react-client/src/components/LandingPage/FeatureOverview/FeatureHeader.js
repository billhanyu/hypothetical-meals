import React, { Component } from 'react';

class FeatureButtons extends Component {
  constructor(props) {
    super(props);
    /*** REQUIRED props
      1. titleText (String)

    */
  }

  render() {
      return (
        <div className="FeatureTitleContainer">
          <hr className='FeatureLine' />
          <div className="FeatureTitleText">Informative Ingredient Interface</div>
          <hr className='FeatureLine' />
        </div>
      );
  }

}

export default FeatureButtons;
