import React, { Component } from 'react';

class LandingPageHeader extends Component {
    render() {
        return (
          <div className="LandingPageHeader">
            <div className="LandingPageLogo" style={{marginLeft:'10%'}}>
              COINSIGHTFUL
            </div>
            <div className="LandingPageOptions">
              <span>Features</span>
              <span>How To</span>
              <span>FAQ</span>
              <span>Sign In</span>
              <span className="LandingPageSignup">Sign Up</span>
            </div>
          </div>
        );
    }
}

export default LandingPageHeader;
