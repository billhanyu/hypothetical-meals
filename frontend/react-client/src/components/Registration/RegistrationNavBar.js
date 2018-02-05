import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class NavBar extends Component {
  render() {
    return (
      <registrationheader className="RegistrationThemeColor">
        <ul className="RegistrationButtons unselectable">
          <li className="navButton RegistrationLogo">
            <Link to="" className="RegistrationLogoText">KUNG FOODS</Link>
          </li>
          <li className="RegistrationAccount">
            Have an account? Log in.
          </li>
        </ul>
      </registrationheader>
    )
  }
}

export default NavBar;
