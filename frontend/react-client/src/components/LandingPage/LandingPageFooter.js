import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class LandingPageFooter extends Component {
  constructor(props) {
    super(props);
  }

  render() {
      return (
        <div className="LandingPageFooterContainer">
          <div className="LandingPageFooterContent">
            <div className="LandingPageColumn">
              <div className="LandingPageLogo" style={{color:'black'}}>COINSIGHTFUL</div>
              <div className="LandingPageLogoText"> © 2018 Coinsightful</div>
            </div>
            <div className="LandingPageColumn">
              <div className="LandingPageColumnHeader">Legal</div>
              <Link className="LandingPageColumnText" to="/">Privacy Policy</Link>
              <Link className="LandingPageColumnText" to="/">Terms of Service</Link>
            </div>
            <div className="LandingPageColumn">
              <div className="LandingPageColumnHeader">Social</div>
              <Link className="LandingPageColumnText" to="/">Facebook</Link>
              <Link className="LandingPageColumnText" to="/">Twitter</Link>
            </div>
          </div>
        </div>
      );
  }

}

export default LandingPageFooter;
