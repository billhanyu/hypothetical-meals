import React, { Component } from 'react';

class LandingPageHeaderBullet extends Component {
  constructor(props){
    super(props);
  }

  /** REQUIRED PROPS
    1. faIcon (STRING)
    2. textContent (STRING)

      OPTIONAL PROPS
    1. textStyle (JSON Style Object {marginLeft: '40px'})
    2. faStyle (Json Style Object)
  ****/


  render() {
      return (
        <div className="LandingPageHeaderBullet">
          <i className={`${this.props.faIcon} LandingPageFaIcon`} style={this.props.faStyle}>
          </i>
          <div className='LandingPageBulletText' style={this.props.textStyle}>{this.props.textContent}</div>
        </div>
      );
  }

}

export default LandingPageHeaderBullet;
