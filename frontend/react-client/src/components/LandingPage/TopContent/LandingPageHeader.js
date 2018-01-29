import React, { Component } from 'react';
import {Link} from 'react-router-dom';

class LandingPageHeader extends Component {
    render() {
        return (
          <div className="LandingPageHeader">
            <div className="LandingPageLogo" style={{marginLeft:'10%'}}>
              KUNG FOODS
            </div>
            <div className="LandingPageOptions">
              <Link className="LandingPageOption" to="/register">Sign Up</Link>
            </div>
          </div>
        );
    }
}

export default LandingPageHeader;
